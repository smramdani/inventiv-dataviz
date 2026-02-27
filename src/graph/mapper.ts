/**
 * Maps raw JSON/table input to normalized GraphData using a DataMappingConfig.
 * Supports node_id, node_name, node_att1_name, att1_value, link_id, link_label, etc.
 */

import type {
  DataRow,
  GraphData,
  MappedLink,
  MappedNode,
  RawGraphInput,
} from "./types";
import type { DataMappingConfig, AttributePair, LinkArrayMapping, RowBasedLinkMapping } from "./mapping-config";

function getValue(row: DataRow, field: string): unknown {
  if (!field || !(field in row)) return undefined;
  return row[field];
}

function getString(row: DataRow, field: string): string {
  const v = getValue(row, field);
  if (v == null) return "";
  return String(v).trim();
}

function getNumber(row: DataRow, field: string): number | undefined {
  const v = getValue(row, field);
  if (v == null) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function readAttributes(
  row: DataRow,
  pairs?: AttributePair[],
  columns?: Record<string, string>
): Record<string, unknown> | undefined {
  const out: Record<string, unknown> = {};
  if (pairs) {
    for (const p of pairs) {
      const name = getString(row, p.nameField);
      if (!name) continue;
      const val = getValue(row, p.valueField);
      if (val !== undefined && val !== null) out[name] = val;
    }
  }
  if (columns) {
    for (const [key, col] of Object.entries(columns)) {
      const val = getValue(row, col);
      if (val !== undefined && val !== null) out[key] = val;
    }
  }
  if (Object.keys(out).length === 0) return undefined;
  return out;
}

function mergeAttributes(
  into: Record<string, unknown>,
  from: Record<string, unknown> | undefined
): void {
  if (!from) return;
  for (const [k, v] of Object.entries(from)) {
    if (v !== undefined && v !== null) into[k] = v;
  }
}

/**
 * Map raw input (rows and/or nodes + links arrays) to GraphData using the given config.
 */
export function mapInputToGraph(input: RawGraphInput, config: DataMappingConfig): GraphData {
  const linkMapping = config.links;

  if (linkMapping.source === "rows") {
    return mapRowsToGraph(input, config);
  }

  return mapStructuredToGraph(input, config);
}

function mapRowsToGraph(input: RawGraphInput, config: DataMappingConfig): GraphData {
  const rows = input.rows ?? [];
  const linkConf = config.links as RowBasedLinkMapping;

  const nodeMap = new Map<string, MappedNode>();
  const links: MappedLink[] = [];
  const seenLinkKeys = new Set<string>();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const sourceId = getString(row, linkConf.sourceField);
    const targetId = getString(row, linkConf.targetField);
    if (!sourceId || !targetId) continue;

    // Ensure source node
    if (!nodeMap.has(sourceId)) {
      const att: Record<string, unknown> = {};
      mergeAttributes(att, readAttributes(row, linkConf.sourceNodeAttributePairs, linkConf.sourceNodeAttributeColumns));
      const node: MappedNode = {
        id: sourceId,
        label: linkConf.sourceLabelField ? getString(row, linkConf.sourceLabelField) || undefined : undefined,
        type: linkConf.sourceTypeField ? getString(row, linkConf.sourceTypeField) || undefined : undefined,
        attributes: Object.keys(att).length ? att : undefined,
      };
      nodeMap.set(sourceId, node);
    } else {
      // Merge optional attributes from this row into existing node (first occurrence wins for label/type)
      const existing = nodeMap.get(sourceId)!;
      const att = readAttributes(row, linkConf.sourceNodeAttributePairs, linkConf.sourceNodeAttributeColumns);
      if (att) {
        existing.attributes = { ...existing.attributes, ...att };
      }
    }

    // Ensure target node
    if (!nodeMap.has(targetId)) {
      const att: Record<string, unknown> = {};
      mergeAttributes(att, readAttributes(row, linkConf.targetNodeAttributePairs, linkConf.targetNodeAttributeColumns));
      const node: MappedNode = {
        id: targetId,
        label: linkConf.targetLabelField ? getString(row, linkConf.targetLabelField) || undefined : undefined,
        type: linkConf.targetTypeField ? getString(row, linkConf.targetTypeField) || undefined : undefined,
        attributes: Object.keys(att).length ? att : undefined,
      };
      nodeMap.set(targetId, node);
    } else {
      const existing = nodeMap.get(targetId)!;
      const att = readAttributes(row, linkConf.targetNodeAttributePairs, linkConf.targetNodeAttributeColumns);
      if (att) {
        existing.attributes = { ...existing.attributes, ...att };
      }
    }

    // Link
    const linkId = linkConf.linkIdField ? getString(row, linkConf.linkIdField) : undefined;
    const linkKey = linkId || `${sourceId}\t${targetId}\t${i}`;
    if (seenLinkKeys.has(linkKey)) continue;
    seenLinkKeys.add(linkKey);

    const linkAtt = readAttributes(row, linkConf.linkAttributePairs, linkConf.linkAttributeColumns);
    const link: MappedLink = {
      source: sourceId,
      target: targetId,
      id: linkId || undefined,
      label: linkConf.linkLabelField ? getString(row, linkConf.linkLabelField) || undefined : undefined,
      weight: linkConf.linkWeightField ? getNumber(row, linkConf.linkWeightField) : undefined,
      attributes: linkAtt,
    };
    links.push(link);
  }

  return {
    nodes: Array.from(nodeMap.values()),
    links,
  };
}

function mapStructuredToGraph(input: RawGraphInput, config: DataMappingConfig): GraphData {
  const linkConf = config.links as LinkArrayMapping;
  const linksData = input.links ?? [];
  const nodesData = input.nodes ?? [];
  const nodeConf = config.nodes;

  const nodeMap = new Map<string, MappedNode>();

  // Build nodes from explicit nodes array
  if (nodeConf?.source === "nodes" && nodesData.length > 0) {
    for (const row of nodesData) {
      const id = getString(row, nodeConf.idField);
      if (!id) continue;
      const att = readAttributes(row, nodeConf.attributePairs, nodeConf.attributeColumns);
      const node: MappedNode = {
        id,
        label: nodeConf.labelField ? getString(row, nodeConf.labelField) || undefined : undefined,
        type: nodeConf.typeField ? getString(row, nodeConf.typeField) || undefined : undefined,
        attributes: att,
      };
      nodeMap.set(id, node);
    }
  }

  // Build links and infer missing nodes from link endpoints
  const links: MappedLink[] = [];
  for (const row of linksData) {
    const sourceId = getString(row, linkConf.sourceField);
    const targetId = getString(row, linkConf.targetField);
    if (!sourceId || !targetId) continue;

    if (!nodeMap.has(sourceId)) {
      nodeMap.set(sourceId, { id: sourceId });
    }
    if (!nodeMap.has(targetId)) {
      nodeMap.set(targetId, { id: targetId });
    }

    const att = readAttributes(row, linkConf.attributePairs, linkConf.attributeColumns);
    links.push({
      source: sourceId,
      target: targetId,
      id: linkConf.idField ? getString(row, linkConf.idField) || undefined : undefined,
      label: linkConf.labelField ? getString(row, linkConf.labelField) || undefined : undefined,
      weight: linkConf.weightField ? getNumber(row, linkConf.weightField) : undefined,
      attributes: att,
    });
  }

  return {
    nodes: Array.from(nodeMap.values()),
    links,
  };
}

/**
 * Convenience: build a row-based mapping for the common pattern
 * node_id, node_name, node_att1_name, att1_value, node_att2_name, att2_value, link_id, link_label, ...
 * when each row is one link with optional source/target node and link attributes.
 */
export function createRowBasedMapping(options: {
  sourceField?: string;
  targetField?: string;
  sourceLabelField?: string;
  targetLabelField?: string;
  sourceTypeField?: string;
  targetTypeField?: string;
  linkIdField?: string;
  linkLabelField?: string;
  linkWeightField?: string;
  /** Pairs like [ { nameField: 'node_att1_name', valueField: 'att1_value' }, ... ] for link attributes. */
  linkAttributePairs?: AttributePair[];
  /** Pairs for source node attributes (e.g. from_att1_name, from_att1_value). */
  sourceNodeAttributePairs?: AttributePair[];
  /** Pairs for target node attributes (e.g. to_att1_name, to_att1_value). */
  targetNodeAttributePairs?: AttributePair[];
}): DataMappingConfig {
  return {
    links: {
      source: "rows",
      sourceField: options.sourceField ?? "fromNode",
      targetField: options.targetField ?? "toNode",
      sourceLabelField: options.sourceLabelField,
      targetLabelField: options.targetLabelField,
      sourceTypeField: options.sourceTypeField,
      targetTypeField: options.targetTypeField,
      linkIdField: options.linkIdField,
      linkLabelField: options.linkLabelField,
      linkWeightField: options.linkWeightField,
      linkAttributePairs: options.linkAttributePairs,
      sourceNodeAttributePairs: options.sourceNodeAttributePairs,
      targetNodeAttributePairs: options.targetNodeAttributePairs,
    },
  };
}
