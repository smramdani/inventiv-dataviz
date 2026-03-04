/**
 * Generic graph engine: layout (positions + zoom), pan, drag, render.
 * No Power BI or Legal-Entities-specific logic; driven by GraphData + GraphConfig.
 */

import * as d3 from "d3";
import type { GraphData, MappedNode, MappedLink, LayoutState } from "./types";
import type { GraphConfig, NodeShape, LinkStyleContext } from "./config";

/** Node with position (x, y, optional fixed fx, fy). */
export type EngineNode = MappedNode & {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
};

/** Link with resolved fromNode/toNode for drawing (arrow at toNode). */
interface EngineLink {
  source: EngineNode;
  target: EngineNode;
  fromNode: EngineNode;
  toNode: EngineNode;
  label?: string;
  weight: number;
}

export interface GraphEngineRenderOptions {
  /** Node ids considered "open" for styling (e.g. fill color). */
  openedNodeIds?: Set<string>;
  /** Called when a node is clicked (not on drag). */
  onNodeClick?: (nodeId: string) => void;
  /** Node id we just expanded from (for open animation). */
  expandFromNodeId?: string;
  /** Previous positions to preserve layout across re-renders. */
  lastPositions?: Map<string, { x: number; y: number; fx?: number | null; fy?: number | null }>;
  /** Preserve zoom/pan across re-renders (e.g. when expanding nodes). If not set, view stays at default. */
  initialZoomTransform?: d3.ZoomTransform;
  /** Restore from a persisted layout (positions + zoom). Overrides lastPositions/initialZoomTransform when set. */
  initialLayoutState?: LayoutState;
  /** Called when layout changes (debounced). Use to persist state. */
  onLayoutChange?: (state: LayoutState) => void;
  /** Optional: called when "Tout Ouvrir" toolbar button is clicked (Legal Entities: expand all). */
  onOpenAll?: () => void;
  /** Optional: called when "Tout Fermer" toolbar button is clicked (Legal Entities: collapse to start). */
  onCloseAll?: () => void;
  /** Override container dimensions. */
  width?: number;
  height?: number;
}

export interface GraphEngineHandle {
  destroy(): void;
  fitGraph(): void;
  getLastPositions(): Map<string, { x: number; y: number; fx?: number | null; fy?: number | null }>;
  getZoomTransform(): d3.ZoomTransform;
  /** Serializable layout state (positions + zoom) for persistence. */
  getLayoutState(): LayoutState;
}

function getNodeRadius(node: MappedNode, config: GraphConfig): number {
  const type = node.type ?? "";
  return config.nodeRadiusByType[type] ?? config.nodeRadiusDefault;
}

function getNodeShape(node: MappedNode, config: GraphConfig): NodeShape {
  const type = node.type ?? "";
  return config.nodeShapeByType[type] ?? config.nodeShapeDefault;
}

function getNodeFill(node: MappedNode, opened: Set<string>, config: GraphConfig): string {
  const open = opened.has(node.id);
  const type = node.type ?? "";
  if (open) {
    return config.nodeFillOpenByType[type] ?? config.nodeFillOpenDefault;
  }
  return config.nodeFillClosedByType[type] ?? config.nodeFillClosedDefault;
}

/** Normalize weight to [0, 1] for scaling; avoids division by zero when min === max. */
function normalizedWeight(weight: number, minW: number, maxW: number): number {
  if (maxW <= minW) return 0.5;
  return Math.max(0, Math.min(1, (weight - minW) / (maxW - minW)));
}

/** Apply curve so small weights get more size (readable) and progression is softer. */
function applyWeightCurve(t: number, curve: "linear" | "sqrt" | undefined): number {
  if (curve === "sqrt") return Math.sqrt(t);
  return t;
}

function getLinkStrokeWidth(
  weight: number,
  minW: number,
  maxW: number,
  config: GraphConfig
): number {
  const minVal = config.linkStrokeWidthMin;
  const maxVal = config.linkStrokeWidthMax;
  if (minVal != null && maxVal != null && minVal !== maxVal) {
    const t = applyWeightCurve(normalizedWeight(weight, minW, maxW), config.weightToSizeCurve);
    return minVal + t * (maxVal - minVal);
  }
  if (typeof config.linkStrokeWidth === "function") {
    return config.linkStrokeWidth(weight);
  }
  return config.linkStrokeWidth;
}

function getArrowMarkerSize(
  weight: number,
  minW: number,
  maxW: number,
  config: GraphConfig
): number {
  const minVal = config.arrowMarkerSizeMin;
  const maxVal = config.arrowMarkerSizeMax;
  if (minVal != null && maxVal != null && minVal !== maxVal) {
    const t = applyWeightCurve(normalizedWeight(weight, minW, maxW), config.weightToSizeCurve);
    return minVal + t * (maxVal - minVal);
  }
  return 8;
}

/**
 * Render the graph into the container. Returns a handle to destroy, fit, and get positions.
 */
export function renderGraph(
  container: HTMLElement,
  data: GraphData,
  config: GraphConfig,
  options: GraphEngineRenderOptions = {}
): GraphEngineHandle {
  const {
    openedNodeIds = new Set(),
    onNodeClick,
    expandFromNodeId,
    lastPositions: lastPositionsOpt = new Map(),
    initialZoomTransform: initialZoomTransformOpt,
    initialLayoutState,
    onLayoutChange,
    onOpenAll,
    onCloseAll,
    width: optWidth,
    height: optHeight,
  } = options;

  const width = optWidth ?? container.clientWidth ?? 400;
  const height = optHeight ?? container.clientHeight ?? 400;

  d3.select(container).style("position", "relative");

  const idToNode = new Map<string, EngineNode>();
  data.nodes.forEach((n) => idToNode.set(n.id, { ...n }));
  const engineNodes: EngineNode[] = Array.from(idToNode.values());

  // Partial restore: use saved positions only for nodes that still exist; new nodes get default placement.
  // Use String(id) so lookup works after JSON round-trip (object keys are always strings).
  let lastPositions = lastPositionsOpt;
  let initialZoomTransform = initialZoomTransformOpt;
  if (initialLayoutState) {
    const savedPosCount = Object.keys(initialLayoutState.positions).length;
    lastPositions = new Map(
      Object.entries(initialLayoutState.positions).map(([id, p]) => [
        String(id),
        { x: p.x, y: p.y, fx: p.fx, fy: p.fy },
      ])
    );
    const z = initialLayoutState.zoom;
    initialZoomTransform = d3.zoomIdentity.translate(z.x, z.y).scale(z.k);
    if (typeof console !== "undefined" && console.debug) console.debug("[Inventiv DataViz] engine: initialLayoutState applied, savedPositions=", savedPosCount);
  } else if (typeof console !== "undefined" && console.debug) console.debug("[Inventiv DataViz] engine: no initialLayoutState");

  if (engineNodes.length === 0) {
    if (typeof console !== "undefined" && console.debug) console.debug("[Inventiv DataViz] renderGraph: 0 nodes, skip");
    return {
      destroy() {},
      fitGraph() {},
      getLastPositions: () => new Map(),
      getZoomTransform: () => d3.zoomIdentity,
      getLayoutState: (): LayoutState => ({ positions: {}, zoom: { k: 1, x: 0, y: 0 } }),
    };
  }
  if (typeof console !== "undefined" && console.debug) console.debug("[Inventiv DataViz] renderGraph: start", engineNodes.length, "nodes");

  // Build engine links with fromNode/toNode (arrow at toNode)
  const engineLinks: EngineLink[] = data.links
    .filter((l) => idToNode.has(l.source) && idToNode.has(l.target))
    .map((l) => {
      const source = idToNode.get(l.source)!;
      const target = idToNode.get(l.target)!;
      const arrowAt = l.arrowAt ?? "target";
      const fromNode = arrowAt === "target" ? source : target;
      const toNode = arrowAt === "target" ? target : source;
      return {
        source,
        target,
        fromNode,
        toNode,
        label: l.label,
        weight: typeof l.weight === "number" && Number.isFinite(l.weight) ? l.weight : 0,
      };
    });

  const minWeight =
    engineLinks.length === 0 ? 0 : Math.min(...engineLinks.map((l) => l.weight));
  const maxWeight =
    engineLinks.length === 0 ? 0 : Math.max(...engineLinks.map((l) => l.weight));

  // Layout: restore positions for nodes that have a saved position; place others (new or unknown) by default
  const refPos = expandFromNodeId ? lastPositions.get(String(expandFromNodeId)) : undefined;
  const newNodes: EngineNode[] = [];
  for (const d of engineNodes) {
    const prev = lastPositions.get(String(d.id));
    if (prev) {
      d.x = prev.x;
      d.y = prev.y;
      d.fx = prev.fx !== undefined && prev.fx !== null ? prev.fx : prev.x;
      d.fy = prev.fy !== undefined && prev.fy !== null ? prev.fy : prev.y;
    } else {
      newNodes.push(d); // no saved position: new node or node was removed from saved set
    }
  }
  if (typeof console !== "undefined" && console.debug) console.debug("[Inventiv DataViz] engine: restore result matched=", engineNodes.length - newNodes.length, "newNodes=", newNodes.length, "totalNodes=", engineNodes.length);

  const placeRadius = config.placeNewNodesRadius;
  const numNew = newNodes.length;
  for (let i = 0; i < numNew; i++) {
    const d = newNodes[i];
    const x0 = refPos?.x ?? width / 2;
    const y0 = refPos?.y ?? height / 2;
    const angle = numNew === 1 ? 0 : (2 * Math.PI * i) / numNew;
    d.x = x0 + placeRadius * Math.cos(angle);
    d.y = y0 + placeRadius * Math.sin(angle);
    d.fx = d.x;
    d.fy = d.y;
  }

  if (expandFromNodeId) {
    const parent = engineNodes.find((n) => n.id === expandFromNodeId);
    if (parent) {
      parent.fx = parent.x ?? width / 2;
      parent.fy = parent.y ?? height / 2;
    }
  }

  // Shared map of current positions for layout snapshot and restore.
  // Fill immediately so a zoom "end" triggered by initialZoomTransform below does not persist an empty layout.
  const currentLastPositions = new Map<string, { x: number; y: number; fx?: number | null; fy?: number | null }>();
  for (const d of engineNodes) {
    currentLastPositions.set(String(d.id), {
      x: d.x ?? 0,
      y: d.y ?? 0,
      fx: d.fx,
      fy: d.fy,
    });
  }

  // Clear container (use direct DOM to avoid D3 selecting wrong elements)
  const el = container as HTMLElement;
  while (el.firstChild) el.removeChild(el.firstChild);

  if (engineNodes.length === 1) {
    d3.select(container)
      .append("div")
      .attr("class", "explore-hint")
      .style("position", "absolute")
      .style("left", "8px")
      .style("top", "8px")
      .style("font-size", "12px")
      .style("color", "#666")
      .style("pointer-events", "none")
      .text("Click the node to explore connections →");
  }

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [0, 0, width, height]);

  const g = svg.append("g").attr("class", "zoom-layer");

  // Preserve zoom/pan across re-renders (e.g. when expanding a node) so the canvas does not jump
  const initialTransform = initialZoomTransform ?? d3.zoomIdentity;
  let zoomTransform = initialTransform;
  function getLayoutSnapshot() {
    return {
      positions: Object.fromEntries(currentLastPositions),
      zoom: { k: zoomTransform.k, x: zoomTransform.x, y: zoomTransform.y },
      dataFingerprint: engineNodes.map((d) => d.id).sort().join(","),
    };
  }
  function flushLayoutChange() {
    if (onLayoutChange) {
      if (typeof console !== "undefined" && console.debug) console.debug("[Inventiv DataViz] onLayoutChange: flush");
      onLayoutChange(getLayoutSnapshot());
    }
  }
  const zoom = d3
    .zoom<SVGSVGElement, unknown>()
    .scaleExtent(config.zoomExtent)
    .on("start", () => svg.style("cursor", "grabbing"))
    .on("end", () => {
      svg.style("cursor", "grab");
      flushLayoutChange();
    })
    .on("zoom", (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
      g.attr("transform", event.transform.toString());
      zoomTransform = event.transform;
    });
  svg.style("cursor", "grab").call(zoom);
  if (initialZoomTransform) {
    g.attr("transform", initialZoomTransform.toString());
    svg.call(zoom.transform, initialZoomTransform);
    zoomTransform = initialZoomTransform;
  }

  // Arrow marker(s): one per link when size scales by weight, else one shared marker
  const defs = svg.append("defs");
  function getLinkStroke(link: EngineLink): string {
    return typeof config.linkStroke === "function" ? config.linkStroke(link) : config.linkStroke;
  }
  function getArrowFill(link: EngineLink): string {
    return typeof config.arrowFill === "function" ? config.arrowFill(link) : config.arrowFill;
  }
  if (config.showArrows) {
    const scaleArrowByWeight =
      config.arrowMarkerSizeMin != null &&
      config.arrowMarkerSizeMax != null &&
      config.arrowMarkerSizeMin !== config.arrowMarkerSizeMax;
    if (scaleArrowByWeight && engineLinks.length > 0) {
      engineLinks.forEach((link, i) => {
        const size = getArrowMarkerSize(link.weight, minWeight, maxWeight, config);
        defs
          .append("marker")
          .attr("id", `${config.arrowMarkerId}-${i}`)
          .attr("viewBox", "0 -5 10 10")
          .attr("refX", 10)
          .attr("refY", 0)
          .attr("markerWidth", size)
          .attr("markerHeight", size)
          .attr("orient", "auto")
          .append("path")
          .attr("d", "M0,-4L10,0L0,4")
          .attr("fill", getArrowFill(link));
      });
    } else {
      const size = 8;
      const defaultArrowFill = typeof config.arrowFill === "string" ? config.arrowFill : (engineLinks[0] ? getArrowFill(engineLinks[0]) : "#666");
      defs
        .append("marker")
        .attr("id", config.arrowMarkerId)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", size)
        .attr("markerHeight", size)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-4L10,0L0,4")
        .attr("fill", defaultArrowFill);
    }
  }

  const linkGroup = g.append("g").attr("class", "links");
  const scaleArrowByWeight =
    config.showArrows &&
    config.arrowMarkerSizeMin != null &&
    config.arrowMarkerSizeMax != null &&
    config.arrowMarkerSizeMin !== config.arrowMarkerSizeMax;
  const linkSel = linkGroup
    .selectAll<SVGLineElement, EngineLink>("line")
    .data(engineLinks)
    .join("line")
    .attr("stroke", (d) => getLinkStroke(d))
    .attr("stroke-opacity", config.linkStrokeOpacity)
    .attr(
      "stroke-width",
      (d) => getLinkStrokeWidth(d.weight, minWeight, maxWeight, config)
    )
    .attr(
      "marker-end",
      config.showArrows
        ? (d, i) => (scaleArrowByWeight ? `url(#${config.arrowMarkerId}-${i})` : `url(#${config.arrowMarkerId})`)
        : null
    );

  const linkLabelSel = linkGroup
    .selectAll<SVGGElement, EngineLink>("g.link-label")
    .data(engineLinks)
    .join("g")
    .attr("class", "link-label")
    .attr("pointer-events", "none");
  if (config.showLinkLabel) {
    linkLabelSel
      .append("rect")
      .attr("x", -14)
      .attr("y", -7)
      .attr("width", 28)
      .attr("height", 14)
      .attr("rx", 2)
      .attr("fill", config.linkLabelFill)
      .attr("stroke", config.linkLabelStroke);
    linkLabelSel
      .append("text")
      .attr("font-size", config.linkLabelFontSize)
      .attr("fill", config.labelColor)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text((d) => d.label ?? "");
  }

  let justDragged = false;
  const nodeSel = g
    .append("g")
    .attr("class", "nodes")
    .selectAll<SVGGElement, EngineNode>("g")
    .data(engineNodes)
    .join("g")
    .attr("cursor", "grab")
    .call(
      d3
        .drag<SVGGElement, EngineNode>()
        .on("start", (event, d) => {
          event.sourceEvent.stopPropagation();
          justDragged = false;
          for (const n of engineNodes) {
            n.fx = n.x ?? 0;
            n.fy = n.y ?? 0;
          }
          nodeSel.filter((n) => n === d).style("cursor", "grabbing");
        })
        .on("drag", (event, d) => {
          justDragged = true;
          d.x = d.fx = event.x;
          d.y = d.fy = event.y;
          updateVisual();
        })
        .on("end", (event, d) => {
          nodeSel.filter((n) => n === d).style("cursor", null);
          d.x = d.fx = event.x;
          d.y = d.fy = event.y;
          currentLastPositions.set(String(d.id), { x: event.x, y: event.y, fx: event.x, fy: event.y });
          updateVisual();
          flushLayoutChange();
        })
    )
    .on("click", (event, d) => {
      if (justDragged) return;
      onNodeClick?.(d.id);
    });

  // Append shape per node (circle, rect, roundedRect, triangle) from config.nodeShapeByType / nodeShapeDefault
  nodeSel.each(function (this: SVGGElement, d: EngineNode) {
    const sel = d3.select<SVGGElement, EngineNode>(this);
    const r = getNodeRadius(d, config);
    const shape = getNodeShape(d, config);
    if (shape === "circle") {
      sel.append("circle").attr("r", r);
    } else if (shape === "rect") {
      sel.append("rect").attr("x", -r).attr("y", -r).attr("width", 2 * r).attr("height", 2 * r);
    } else if (shape === "roundedRect") {
      const rx = Math.min(config.nodeShapeRoundedRectRadius ?? 6, r);
      sel
        .append("rect")
        .attr("x", -r)
        .attr("y", -r)
        .attr("width", 2 * r)
        .attr("height", 2 * r)
        .attr("rx", rx)
        .attr("ry", rx);
    } else {
      // triangle (equilateral, point up)
      const pts = `0,${-r} ${r * 0.866},${r / 2} ${-r * 0.866},${r / 2}`;
      sel.append("polygon").attr("points", pts);
    }
  });

  // Shape elements inherit parent <g> datum (EngineNode); cast so attr/filter see the correct type
  const shapeSel = nodeSel.select("circle, rect, polygon") as d3.Selection<
    SVGElement,
    EngineNode,
    SVGGElement,
    unknown
  >;
  shapeSel
    .attr("fill", (d) => getNodeFill(d, openedNodeIds, config))
    .attr("stroke", config.nodeStroke)
    .attr("stroke-width", config.nodeStrokeWidth);

  if (expandFromNodeId) {
    const closedFill = (d: EngineNode) =>
      config.nodeFillClosedByType[d.type ?? ""] ?? config.nodeFillClosedDefault;
    shapeSel
      .filter((d) => d.id === expandFromNodeId)
      .attr("fill", closedFill)
      .transition()
      .duration(280)
      .attr("fill", (d) => getNodeFill(d, openedNodeIds, config));
  }

  const labelFontSize = (d: EngineNode) =>
    getNodeRadius(d, config) <= 14 ? config.labelFontSizeSmall : config.labelFontSizeLarge;
  nodeSel
    .append("text")
    .text((d) => d.label ?? d.id)
    .attr("font-size", labelFontSize)
    .attr("dx", (d) => getNodeRadius(d, config) + (config.nodeLabelOffset ?? 5))
    .attr("dy", 4)
    .attr("fill", config.labelColor)
    .clone(true)
    .lower()
    .attr("stroke", "#fff")
    .attr("stroke-width", 3);

  function updateVisual() {
    linkSel.each(function (this: SVGLineElement, d: EngineLink) {
      const x1 = d.fromNode.x ?? 0;
      const y1 = d.fromNode.y ?? 0;
      let x2 = d.toNode.x ?? 0;
      let y2 = d.toNode.y ?? 0;
      const dx = x2 - x1;
      const dy = y2 - y1;
      const len = Math.hypot(dx, dy) || 1;
      const toRadius = getNodeRadius(d.toNode, config);
      x2 -= (dx / len) * toRadius;
      y2 -= (dy / len) * toRadius;
      d3.select<SVGLineElement, EngineLink>(this).attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
    });
    if (config.showLinkLabel) {
      const offset = config.linkLabelOffset;
      linkLabelSel.each(function (this: SVGGElement, d: EngineLink) {
        const x1 = d.fromNode.x ?? 0;
        const y1 = d.fromNode.y ?? 0;
        let x2 = d.toNode.x ?? 0;
        let y2 = d.toNode.y ?? 0;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const toRadius = getNodeRadius(d.toNode, config);
        x2 -= (dx / len) * toRadius;
        y2 -= (dy / len) * toRadius;
        const labelX = x2 + ((x1 - x2) / len) * offset;
        const labelY = y2 + ((y1 - y2) / len) * offset;
        d3.select<SVGGElement, EngineLink>(this).attr("transform", `translate(${labelX},${labelY})`);
      });
    }
    nodeSel.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    for (const d of engineNodes) {
      currentLastPositions.set(String(d.id), {
        x: d.x ?? 0,
        y: d.y ?? 0,
        fx: d.fx,
        fy: d.fy,
      });
    }
  }
  updateVisual();

  let toolbarDiv: d3.Selection<HTMLDivElement, unknown, null, undefined> | null = null;

  function addToolbar() {
    toolbarDiv = d3
      .select(container)
      .append("div")
      .attr("class", "zoom-toolbar")
      .style("position", "absolute")
      .style("top", "8px")
      .style("right", "8px")
      .style("display", "flex")
      .style("gap", "4px")
      .style("z-index", "10");
    toolbarDiv
      .append("button")
      .attr("type", "button")
      .attr("title", "Zoom in")
      .text("+")
      .on("click", () => svg.call(zoom.scaleBy, 1.3));
    toolbarDiv
      .append("button")
      .attr("type", "button")
      .attr("title", "Zoom out")
      .text("−")
      .on("click", () => svg.call(zoom.scaleBy, 1 / 1.3));
    toolbarDiv
      .append("button")
      .attr("type", "button")
      .attr("title", "Fit graph")
      .text("Fit")
      .on("click", fitGraph);
    if (onOpenAll) {
      toolbarDiv
        .append("button")
        .attr("type", "button")
        .attr("title", "Tout Ouvrir")
        .text("Tout Ouvrir")
        .on("click", onOpenAll);
    }
    if (onCloseAll) {
      toolbarDiv
        .append("button")
        .attr("type", "button")
        .attr("title", "Tout Fermer")
        .text("Tout Fermer")
        .on("click", onCloseAll);
    }
  }

  function fitGraph() {
    const padding = 50;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    for (const d of engineNodes) {
      const r = getNodeRadius(d, config);
      const x = d.x ?? 0;
      const y = d.y ?? 0;
      minX = Math.min(minX, x - r);
      maxX = Math.max(maxX, x + r);
      minY = Math.min(minY, y - r);
      maxY = Math.max(maxY, y + r);
    }
    const boxW = maxX - minX || 1;
    const boxH = maxY - minY || 1;
    const scale = Math.min((width - 2 * padding) / boxW, (height - 2 * padding) / boxH, config.zoomExtent[1]);
    const k = Math.max(config.zoomExtent[0], scale);
    const tx = width / 2 - (k * (minX + maxX)) / 2;
    const ty = height / 2 - (k * (minY + maxY)) / 2;
    const t = d3.zoomIdentity.translate(tx, ty).scale(k);
    zoomTransform = t;
    svg.call(zoom.transform, t);
    g.attr("transform", t.toString());
  }

  addToolbar();

  if (typeof console !== "undefined" && console.debug) console.debug("[Inventiv DataViz] renderGraph: done", engineNodes.length, "nodes");
  return {
    destroy() {
      svg.remove();
      toolbarDiv?.remove();
    },
    fitGraph,
    getLastPositions: () => new Map(currentLastPositions),
    getZoomTransform: () => zoomTransform,
    getLayoutState: (): LayoutState => ({
      positions: Object.fromEntries(currentLastPositions),
      zoom: { k: zoomTransform.k, x: zoomTransform.x, y: zoomTransform.y },
    }),
  };
}
