/**
 * Adapter: convert between GraphData and legacy Legal Entities format
 * (GraphNode, GraphLink with shares). Helpers to build GraphData for the engine.
 */

import type { GraphData, MappedNode, MappedLink } from "./types";

/** Legacy node shape (e.g. for Legal Entities visual). */
export interface LegacyGraphNode {
  id: string;
  label: string;
  type: "Entity" | "Shareholder";
}

/** Legacy link shape (e.g. for Legal Entities visual). */
export interface LegacyGraphLink {
  source: string;
  target: string;
  shares: number;
}

export interface LegacyFullGraph {
  nodes: LegacyGraphNode[];
  links: LegacyGraphLink[];
}

/** Type names that map to Entity; any other non-empty type is treated as Shareholder. */
const ENTITY_TYPES = new Set(["Entity", "entity", "Legal Entity", "Company", "Organisation", "Organization"]);

function mapType(type: string | undefined): "Entity" | "Shareholder" {
  if (!type || type.trim() === "") return "Entity";
  return ENTITY_TYPES.has(type.trim()) ? "Entity" : "Shareholder";
}

/**
 * Convert GraphData (from the mapper) to legacy FullGraph format.
 * - Node type string is mapped to "Entity" or "Shareholder".
 * - Link weight is used as shares (default 0 if missing).
 */
export function graphDataToLegacy(graph: GraphData): LegacyFullGraph {
  const nodes: LegacyGraphNode[] = graph.nodes.map((n: MappedNode) => ({
    id: n.id,
    label: n.label ?? n.id,
    type: mapType(n.type),
  }));

  const links: LegacyGraphLink[] = graph.links.map((l: MappedLink) => ({
    source: l.source,
    target: l.target,
    shares: typeof l.weight === "number" && Number.isFinite(l.weight) ? l.weight : 0,
  }));

  return { nodes, links };
}

/**
 * Convert legacy FullGraph to GraphData (for use with the generic engine).
 * Node type and link weight are preserved; no share % or arrow direction.
 */
export function legacyToGraphData(legacy: LegacyFullGraph): GraphData {
  const nodes: MappedNode[] = legacy.nodes.map((n) => ({
    id: n.id,
    label: n.label,
    type: n.type,
  }));
  const links = legacy.links.map((l) => ({
    source: l.source,
    target: l.target,
    weight: l.shares,
  }));
  return { nodes, links };
}

/**
 * Build GraphData for the engine from a legacy Legal Entities graph:
 * visible nodes/links only, share % on link labels, arrow at entity node.
 * Link weight is set to sharePct (0–100) so stroke width and arrow size
 * are proportional to the displayed percentage, not raw shares.
 */
export function buildLegalEntitiesGraphData(
  fullLegacy: LegacyFullGraph,
  visibleNodeIds: Set<string>
): GraphData {
  const nodeMap = new Map(fullLegacy.nodes.map((n) => [n.id, n]));
  const visibleNodes = fullLegacy.nodes.filter((n) => visibleNodeIds.has(n.id));
  const visibleLinks = fullLegacy.links.filter(
    (l) => visibleNodeIds.has(l.source) && visibleNodeIds.has(l.target)
  );

  const totalSharesByTarget = new Map<string, number>();
  for (const l of fullLegacy.links) {
    totalSharesByTarget.set(l.target, (totalSharesByTarget.get(l.target) ?? 0) + l.shares);
  }

  const nodes: MappedNode[] = visibleNodes.map((n) => ({
    id: n.id,
    label: n.label,
    type: n.type,
  }));

  const links = visibleLinks.map((l) => {
    const sourceNode = nodeMap.get(l.source);
    const targetNode = nodeMap.get(l.target);
    const total = totalSharesByTarget.get(l.target) ?? 1;
    const sharePct = total > 0 ? (l.shares / total) * 100 : 0;
    const arrowAt =
      sourceNode?.type === "Shareholder" && targetNode?.type === "Entity"
        ? "target"
        : sourceNode?.type === "Entity" && targetNode?.type === "Shareholder"
          ? "source"
          : "target";
    return {
      source: l.source,
      target: l.target,
      weight: sharePct,
      label: `${sharePct.toFixed(0)}%`,
      arrowAt: arrowAt as "source" | "target",
    };
  });

  return { nodes, links };
}
