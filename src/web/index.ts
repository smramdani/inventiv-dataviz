/**
 * Web widget API: embed Generic Graph and Legal Entities Graph in any web page.
 * No Power BI dependency; use the same graph engine and config.
 */

import type {
  GraphData,
  RawGraphInput,
  DataMappingConfig,
  GraphConfig,
  LayoutState,
} from "../graph";
import {
  renderGraph,
  mapInputToGraph,
  createRowBasedMapping,
  buildLegalEntitiesGraphData,
  DEFAULT_GRAPH_CONFIG,
  DEFAULT_GENERIC_GRAPH_CONFIG,
  type LegalEntitiesGraph,
} from "../graph";

const LAYOUT_STORAGE_PREFIX = "inventiv-dataviz-layout-";

/** Stable fingerprint for the current graph so we never apply another graph's layout. */
function computeDataFingerprint(nodeIds: string[]): string {
  return [...nodeIds].sort().join(",");
}

const LAYOUT_DEBUG = true; // set to false to reduce console noise

function loadLayoutFromStorage(key: string): LayoutState | undefined {
  try {
    if (typeof localStorage === "undefined") {
      if (LAYOUT_DEBUG) console.warn("[Inventiv DataViz] loadLayout: localStorage unavailable");
      return undefined;
    }
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (LAYOUT_DEBUG) console.debug("[Inventiv DataViz] loadLayout: no data for key", key);
      return undefined;
    }
    const parsed = JSON.parse(raw) as LayoutState;
    if (!parsed || typeof parsed.positions !== "object" || !parsed.zoom || typeof parsed.zoom.k !== "number") {
      if (LAYOUT_DEBUG) console.warn("[Inventiv DataViz] loadLayout: invalid shape for key", key, parsed);
      return undefined;
    }
    const posCount = Object.keys(parsed.positions).length;
    if (LAYOUT_DEBUG) console.debug("[Inventiv DataViz] loadLayout: restored", key, "positions:", posCount, "visibleNodeIds:", parsed.visibleNodeIds?.length ?? 0);
    return parsed;
  } catch (e) {
    if (LAYOUT_DEBUG) console.warn("[Inventiv DataViz] loadLayout: parse error for key", key, e);
    return undefined;
  }
}

function saveLayoutToStorage(key: string, state: LayoutState): void {
  try {
    if (typeof localStorage === "undefined") {
      if (LAYOUT_DEBUG) console.warn("[Inventiv DataViz] saveLayout: localStorage unavailable");
      return;
    }
    const posCount = Object.keys(state.positions).length;
    localStorage.setItem(key, JSON.stringify(state));
    if (LAYOUT_DEBUG) console.debug("[Inventiv DataViz] saveLayout: saved", key, "positions:", posCount);
  } catch (e) {
    if (LAYOUT_DEBUG) console.warn("[Inventiv DataViz] saveLayout: failed for key", key, e);
  }
}

export interface WebGraphHandle {
  destroy(): void;
  updateData(data: GraphData | RawGraphInput | LegalEntitiesGraph): void;
  updateOptions?(options: Record<string, unknown>): void;
}

/** Options for createGenericGraph. */
export interface GenericGraphOptions {
  /** Partial config to merge with defaults. */
  config?: Partial<GraphConfig>;
  /** Mapping when data is RawGraphInput (rows). */
  mapping?: DataMappingConfig;
  /**
   * Unique identifier for this graph instance. Used to store/load layout in localStorage so
   * each graph has its own layout. Must be stable and not derived from node IDs (so layout
   * is preserved when data is partially updated). Example: report id, dashboard view id.
   */
  layoutKey?: string;
  /** Restore from this state instead of localStorage. */
  initialLayoutState?: LayoutState;
  /** Called when layout changes (debounced). Use for custom persistence. */
  onLayoutChange?: (state: LayoutState) => void;
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
  const initialLayout =
    options.initialLayoutState ??
    (options.layoutKey ? loadLayoutFromStorage(LAYOUT_STORAGE_PREFIX + options.layoutKey) : undefined);
  const persistLayout = (state: LayoutState) => {
    if (options.layoutKey) saveLayoutToStorage(LAYOUT_STORAGE_PREFIX + options.layoutKey, state);
    options.onLayoutChange?.(state);
  };
  let handle = renderGraph(container, graphData, config, {
    initialLayoutState: initialLayout,
    onLayoutChange: persistLayout,
  });

  return {
    destroy() {
      handle.destroy();
    },
      updateData(newData: GraphData | RawGraphInput | LegalEntitiesGraph) {
      const lastPositions = handle.getLastPositions();
      const lastZoom = handle.getZoomTransform();
      handle.destroy();
      let next: GraphData;
      if ("nodes" in newData && "links" in newData && Array.isArray((newData as GraphData).nodes)) {
        next = newData as GraphData;
      } else if ("rows" in newData || "links" in newData) {
        const mapping = options.mapping ?? createRowBasedMapping({ sourceField: "source", targetField: "target", linkWeightField: "weight" });
        next = mapInputToGraph(newData as RawGraphInput, mapping);
      } else {
        const legalData = newData as unknown as LegalEntitiesGraph;
        const allIds = new Set(legalData.nodes.map((n) => n.id));
        next = buildLegalEntitiesGraphData(legalData, allIds);
      }
      handle = renderGraph(container, next, config, {
        lastPositions,
        initialZoomTransform: lastZoom,
        onLayoutChange: persistLayout,
      });
    },
    updateOptions(opts: GenericGraphOptions) {
      if (opts.config) Object.assign(config, opts.config);
      if (opts.mapping) options.mapping = opts.mapping;
      if (opts.layoutKey !== undefined) options.layoutKey = opts.layoutKey;
      if (opts.initialLayoutState !== undefined) options.initialLayoutState = opts.initialLayoutState;
      if (opts.onLayoutChange !== undefined) options.onLayoutChange = opts.onLayoutChange;
    },
  };
}

/** Options for createLegalEntitiesGraph. */
export interface LegalEntitiesGraphOptions {
  /** Node id to show first (default: first node in data). */
  defaultStartNodeId?: string;
  /** Partial config to merge with Legal Entities defaults. */
  config?: Partial<GraphConfig>;
  /**
   * Unique identifier for this graph instance. Used to store/load layout (positions, zoom,
   * opened nodes). Must be stable and not derived from node IDs. Example: report id.
   */
  layoutKey?: string;
  /** Restore from this state instead of localStorage. */
  initialLayoutState?: LayoutState;
  /** Called when layout changes (debounced). */
  onLayoutChange?: (state: LayoutState) => void;
}

/**
 * Create a Legal Entities / Shareholders graph in the container.
 * Supports expand-on-click; data is the full Legal Entities graph (nodes + links with shares).
 */
export function createLegalEntitiesGraph(
  container: HTMLElement,
  data: LegalEntitiesGraph,
  options: LegalEntitiesGraphOptions = {}
): WebGraphHandle {
  const defaultStartId = options.defaultStartNodeId ?? data.nodes[0]?.id ?? "";
  const storageKey = options.layoutKey ? LAYOUT_STORAGE_PREFIX + options.layoutKey : null;
  const initialLayout =
    options.initialLayoutState ??
    (storageKey ? loadLayoutFromStorage(storageKey) : undefined);
  if (LAYOUT_DEBUG && options.layoutKey) console.debug("[Inventiv DataViz] LegalEntities: layoutKey=", options.layoutKey, "initialLayout=", initialLayout ? "yes" : "no");
  let visibleNodeIds = new Set<string>(defaultStartId ? [defaultStartId] : []);
  let openedNodeIds = new Set<string>(); // Start closed (gray) until user clicks; restore from layout if present
  if (initialLayout?.visibleNodeIds?.length) visibleNodeIds = new Set(initialLayout.visibleNodeIds);
  if (initialLayout?.openedNodeIds?.length) openedNodeIds = new Set(initialLayout.openedNodeIds);
  let lastPositions = new Map<string, { x: number; y: number; fx?: number | null; fy?: number | null }>();
  let lastZoomTransform: ReturnType<ReturnType<typeof renderGraph>["getZoomTransform"]> | undefined;
  const config: GraphConfig = { ...DEFAULT_GRAPH_CONFIG, ...options.config };

  const persistLayout = (state: LayoutState) => {
    const full: LayoutState = {
      ...state,
      visibleNodeIds: Array.from(visibleNodeIds),
      openedNodeIds: Array.from(openedNodeIds),
      dataFingerprint: computeDataFingerprint(data.nodes.map((n) => n.id)),
    };
    if (options.layoutKey) saveLayoutToStorage(LAYOUT_STORAGE_PREFIX + options.layoutKey, full);
    if (LAYOUT_DEBUG && options.layoutKey) console.debug("[Inventiv DataViz] LegalEntities: persistLayout called, visibleNodeIds=", visibleNodeIds.size);
    options.onLayoutChange?.(full);
  };

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
      initialLayoutState: initialLayout,
      onLayoutChange: persistLayout,
    });
  })();

  function render(expandFromNodeId?: string) {
    const graphData = buildLegalEntitiesGraphData(data, visibleNodeIds);
    if (typeof console !== "undefined" && console.debug) console.debug("[Inventiv DataViz] LegalEntities render", graphData.nodes.length, "nodes", expandFromNodeId ? "expand:" + expandFromNodeId : "initial");
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
      onLayoutChange: persistLayout,
    });
  }

  return {
    destroy() {
      engineHandle?.destroy();
      engineHandle = null;
    },
      updateData(newData: GraphData | RawGraphInput | LegalEntitiesGraph) {
      const legalData = newData as LegalEntitiesGraph;
      if (!legalData.nodes?.length || !legalData.links) return;
      data = legalData;
      const startId = options.defaultStartNodeId ?? legalData.nodes[0]?.id ?? "";
      visibleNodeIds = new Set(startId ? [startId] : []);
      openedNodeIds = new Set(startId ? [startId] : []);
      lastPositions = new Map();
      render();
    },
    updateOptions(opts: LegalEntitiesGraphOptions) {
      if (opts.defaultStartNodeId !== undefined) options.defaultStartNodeId = opts.defaultStartNodeId;
      if (opts.config) Object.assign(config, opts.config);
      if (opts.layoutKey !== undefined) options.layoutKey = opts.layoutKey;
      if (opts.initialLayoutState !== undefined) options.initialLayoutState = opts.initialLayoutState;
      if (opts.onLayoutChange !== undefined) options.onLayoutChange = opts.onLayoutChange;
    },
  };
}

// Re-export types for consumers
export type {
  GraphData,
  RawGraphInput,
  LegalEntitiesGraph,
  GraphConfig,
  DataMappingConfig,
  LayoutState,
} from "../graph";
