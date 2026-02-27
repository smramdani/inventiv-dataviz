/**
 * Web widget API: embed Generic Graph and Legal Entities Graph in any web page.
 * No Power BI dependency; use the same graph engine and config.
 */

import type { GraphData, RawGraphInput, DataMappingConfig, GraphConfig } from "../graph";
import {
  renderGraph,
  mapInputToGraph,
  createRowBasedMapping,
  buildLegalEntitiesGraphData,
  DEFAULT_GRAPH_CONFIG,
  DEFAULT_GENERIC_GRAPH_CONFIG,
  type LegacyFullGraph,
} from "../graph";

export interface WebGraphHandle {
  destroy(): void;
  updateData(data: GraphData | RawGraphInput | LegacyFullGraph): void;
  updateOptions?(options: Record<string, unknown>): void;
}

/** Options for createGenericGraph. */
export interface GenericGraphOptions {
  /** Partial config to merge with defaults. */
  config?: Partial<GraphConfig>;
  /** Mapping when data is RawGraphInput (rows). */
  mapping?: DataMappingConfig;
}

/**
 * Create a generic graph in the container. Data can be GraphData or raw rows/links.
 * Returns a handle to destroy or update data.
 */
export function createGenericGraph(
  container: HTMLElement,
  data: GraphData | RawGraphInput,
  options: GenericGraphOptions = {}
): WebGraphHandle {
  let graphData: GraphData;
  if ("nodes" in data && "links" in data && Array.isArray(data.nodes) && Array.isArray(data.links)) {
    graphData = data as GraphData;
  } else {
    const mapping = options.mapping ?? createRowBasedMapping({ sourceField: "source", targetField: "target", linkWeightField: "weight" });
    graphData = mapInputToGraph(data as RawGraphInput, mapping);
  }

  const config: GraphConfig = { ...DEFAULT_GENERIC_GRAPH_CONFIG, ...options.config };
  let handle = renderGraph(container, graphData, config, {});

  return {
    destroy() {
      handle.destroy();
    },
    updateData(newData: GraphData | RawGraphInput | LegacyFullGraph) {
      const lastPositions = handle.getLastPositions();
      handle.destroy();
      let next: GraphData;
      if ("nodes" in newData && "links" in newData && Array.isArray((newData as GraphData).nodes)) {
        next = newData as GraphData;
      } else if ("rows" in newData || "links" in newData) {
        const mapping = options.mapping ?? createRowBasedMapping({ sourceField: "source", targetField: "target", linkWeightField: "weight" });
        next = mapInputToGraph(newData as RawGraphInput, mapping);
      } else {
        const legacy = newData as unknown as LegacyFullGraph;
        const allIds = new Set(legacy.nodes.map((n) => n.id));
        next = buildLegalEntitiesGraphData(legacy, allIds);
      }
      handle = renderGraph(container, next, config, { lastPositions });
    },
    updateOptions(opts: GenericGraphOptions) {
      if (opts.config) Object.assign(config, opts.config);
      if (opts.mapping) options.mapping = opts.mapping;
    },
  };
}

/** Options for createLegalEntitiesGraph. */
export interface LegalEntitiesGraphOptions {
  /** Node id to show first (default: first node in data). */
  defaultStartNodeId?: string;
  /** Partial config to merge with Legal Entities defaults. */
  config?: Partial<GraphConfig>;
}

/**
 * Create a Legal Entities / Shareholders graph in the container.
 * Supports expand-on-click; data is the full legacy graph.
 */
export function createLegalEntitiesGraph(
  container: HTMLElement,
  data: LegacyFullGraph,
  options: LegalEntitiesGraphOptions = {}
): WebGraphHandle {
  const defaultStartId = options.defaultStartNodeId ?? data.nodes[0]?.id ?? "";
  let visibleNodeIds = new Set<string>(defaultStartId ? [defaultStartId] : []);
  let openedNodeIds = new Set<string>(defaultStartId ? [defaultStartId] : []);
  let lastPositions = new Map<string, { x: number; y: number; fx?: number | null; fy?: number | null }>();
  let lastZoomTransform: ReturnType<ReturnType<typeof renderGraph>["getZoomTransform"]> | undefined;
  const config: GraphConfig = { ...DEFAULT_GRAPH_CONFIG, ...options.config };

  function getNeighborIds(nodeId: string): Set<string> {
    const out = new Set<string>();
    for (const l of data.links) {
      if (l.source === nodeId) out.add(l.target);
      if (l.target === nodeId) out.add(l.source);
    }
    return out;
  }

  function openNode(nodeId: string) {
    openedNodeIds.add(nodeId);
    getNeighborIds(nodeId).forEach((id) => visibleNodeIds.add(id));
    visibleNodeIds.add(nodeId);
    render(nodeId);
  }

  let engineHandle: ReturnType<typeof renderGraph> | null = (() => {
    const graphData = buildLegalEntitiesGraphData(data, visibleNodeIds);
    if (graphData.nodes.length === 0) return null;
    return renderGraph(container, graphData, config, {
      openedNodeIds,
      onNodeClick: openNode,
      lastPositions,
    });
  })();

  function render(expandFromNodeId?: string) {
    const graphData = buildLegalEntitiesGraphData(data, visibleNodeIds);
    if (graphData.nodes.length === 0) {
      engineHandle = null;
      return;
    }
    if (engineHandle) {
      lastPositions = engineHandle.getLastPositions();
      lastZoomTransform = engineHandle.getZoomTransform();
      engineHandle.destroy();
      engineHandle = null;
    }
    engineHandle = renderGraph(container, graphData, config, {
      openedNodeIds,
      onNodeClick: openNode,
      expandFromNodeId,
      lastPositions,
      initialZoomTransform: lastZoomTransform,
    });
  }

  return {
    destroy() {
      engineHandle?.destroy();
      engineHandle = null;
    },
    updateData(newData: GraphData | RawGraphInput | LegacyFullGraph) {
      const legacy = newData as LegacyFullGraph;
      if (!legacy.nodes?.length || !legacy.links) return;
      data = legacy;
      const startId = options.defaultStartNodeId ?? legacy.nodes[0]?.id ?? "";
      visibleNodeIds = new Set(startId ? [startId] : []);
      openedNodeIds = new Set(startId ? [startId] : []);
      lastPositions = new Map();
      render();
    },
    updateOptions(opts: LegalEntitiesGraphOptions) {
      if (opts.defaultStartNodeId !== undefined) options.defaultStartNodeId = opts.defaultStartNodeId;
      if (opts.config) Object.assign(config, opts.config);
    },
  };
}

// Re-export types for consumers
export type { GraphData, RawGraphInput, LegacyFullGraph, GraphConfig, DataMappingConfig } from "../graph";
