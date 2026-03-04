/**
 * GraphConfig: layout, style, and behavior options for the generic graph engine.
 * Defaults match the current Legal Entities visual behavior.
 */

/** Supported node shapes; selection can be driven by node type (e.g. Entity vs Shareholder). */
export type NodeShape = "circle" | "rect" | "roundedRect" | "triangle";

/** Context passed to per-link style functions (e.g. color by source/target type). */
export interface LinkStyleContext {
  fromNode: { type?: string };
  toNode: { type?: string };
}

/** Node/link styling and layout parameters. */
export interface GraphConfig {
  /** Ideal distance between connected nodes (button "Organiser"). Default 180. */
  linkDistance: number;
  /** Link force strength 0–1 (Organiser). Default 1. */
  linkStrength: number;
  /** Many-body charge strength, negative = repel (Organiser). Default -180. */
  chargeStrength: number;
  /** Max distance for charge force (Organiser). Default 320. */
  chargeDistanceMax: number;
  /** Min distance for charge force (Organiser). Default 32. */
  chargeDistanceMin: number;
  /** Extra padding added to node radius for collision, avoids overlap (Organiser). Default 16. */
  collisionRadiusPadding: number;
  /** Center force strength 0–1 (Organiser). Default 0.1. */
  centerStrength: number;
  /** Radius for placing new nodes when expanding. Default 160. */
  placeNewNodesRadius: number;
  /** Node radius by type; fallback to nodeRadiusDefault. */
  nodeRadiusByType: Record<string, number>;
  /** Default node radius when type not in nodeRadiusByType (default 22). */
  nodeRadiusDefault: number;
  /** Node shape by type (e.g. Entity → roundedRect, Shareholder → circle); fallback to nodeShapeDefault. */
  nodeShapeByType: Record<string, NodeShape>;
  /** Default node shape when type not in nodeShapeByType (default "circle"). */
  nodeShapeDefault: NodeShape;
  /** Corner radius for roundedRect shape when not specified per-type (default 6). */
  nodeShapeRoundedRectRadius: number;
  /** Node fill when closed, by type; fallback to nodeFillClosedDefault. */
  nodeFillClosedByType: Record<string, string>;
  /** Default node fill when closed (default #bdbdbd). */
  nodeFillClosedDefault: string;
  /** Node fill when open, by type; fallback to nodeFillOpenDefault. */
  nodeFillOpenByType: Record<string, string>;
  /** Default node fill when open (default #4a90d9). */
  nodeFillOpenDefault: string;
  /** Node stroke color (default #fff). */
  nodeStroke: string;
  /** Node stroke width (default 2). */
  nodeStrokeWidth: number;
  /** Link stroke color, or function (link) => color for per-link color (e.g. by source/target type). */
  linkStroke: string | ((link: LinkStyleContext) => string);
  /** Link stroke opacity (default 0.6). */
  linkStrokeOpacity: number;
  /** Link stroke width; if a number, fixed; if function, (weight) => width. Ignored when linkStrokeWidthMin/Max are set. */
  linkStrokeWidth: number | ((weight: number) => number);
  /** Min link stroke width when scaling by weight (e.g. shares). Used with linkStrokeWidthMax. */
  linkStrokeWidthMin?: number;
  /** Max link stroke width when scaling by weight. With linkStrokeWidthMin, thickness scales between min and max. */
  linkStrokeWidthMax?: number;
  /** Label text color (default #333). */
  labelColor: string;
  /** Horizontal offset from node edge to node label (default 5). Larger = label farther from node. */
  nodeLabelOffset: number;
  /** Label font size for small nodes (radius <= 14) (default 9). */
  labelFontSizeSmall: number;
  /** Label font size for large nodes (default 10). */
  labelFontSizeLarge: number;
  /** Show link labels (default true). */
  showLinkLabel: boolean;
  /** Distance from arrow tip to place link label (default 70). */
  linkLabelOffset: number;
  /** Link label font size (default 9). */
  linkLabelFontSize: number;
  /** Link label background (default white). */
  linkLabelFill: string;
  /** Link label stroke (default #bbb). */
  linkLabelStroke: string;
  /** Show arrows on links (default true). */
  showArrows: boolean;
  /** SVG marker id for arrow (default 'arrow'). */
  arrowMarkerId: string;
  /** Arrow fill color, or function (link) => color for per-link arrow color. */
  arrowFill: string | ((link: LinkStyleContext) => string);
  /**
   * Min arrow marker size (SVG units) when scaling by weight.
   * With arrowMarkerSizeMax, size is mapped linearly from min weight to max weight (e.g. 0–100% for Legal Entities).
   * Increase for a higher floor (small % arrows stay readable); decrease max so arrows don’t overpower nodes.
   */
  arrowMarkerSizeMin?: number;
  /**
   * Max arrow marker size (SVG units) when scaling by weight.
   * With arrowMarkerSizeMin, size is mapped; set lower for a more balanced look vs node size.
   */
  arrowMarkerSizeMax?: number;
  /**
   * Curve for mapping weight to link thickness and arrow size.
   * - "linear": t = (weight-min)/(max-min); can make small arrows too small and big ones too big.
   * - "sqrt": t = sqrt((weight-min)/(max-min)); boosts small weights so small arrows stay visible, softens high end.
   */
  weightToSizeCurve?: "linear" | "sqrt";
  /** Zoom scale extent [min, max] (default [0.2, 4]). */
  zoomExtent: [number, number];
  /** Fix node positions after expand so they don't drift (default true). */
  fixNodesAfterExpand: boolean;
}

function linkStrokeWidthFromWeight(weight: number): number {
  return Math.min(4, 1 + (weight || 0) / 2000);
}

/** Default config matching current Legal Entities visual. */
export const DEFAULT_GRAPH_CONFIG: GraphConfig = {
  linkDistance: 180,
  linkStrength: 1,
  chargeStrength: -180,
  chargeDistanceMax: 320,
  chargeDistanceMin: 32,
  collisionRadiusPadding: 16,
  centerStrength: 0.1,
  placeNewNodesRadius: 160,
  nodeRadiusByType: {
    Shareholder: 12,
    Entity: 22,
  },
  nodeRadiusDefault: 22,
  nodeShapeByType: {
    Shareholder: "circle",
    Entity: "roundedRect",
  },
  nodeShapeDefault: "circle",
  nodeShapeRoundedRectRadius: 6,
  nodeFillClosedByType: {
    Shareholder: "#5a5a5a",
    Entity: "#bdbdbd",
  },
  nodeFillClosedDefault: "#bdbdbd",
  nodeFillOpenByType: {
    Shareholder: "#5cb85c",
    Entity: "#4a90d9",
  },
  nodeFillOpenDefault: "#4a90d9",
  nodeStroke: "#fff",
  nodeStrokeWidth: 2,
  /** Link/arch color – distinct from node fills (blue/green/gray) so edges are clearly visible and customizable. */
  linkStroke: "#475569",
  linkStrokeOpacity: 0.7,
  linkStrokeWidth: linkStrokeWidthFromWeight,
  linkStrokeWidthMin: 2,
  linkStrokeWidthMax: 4,
  labelColor: "#333",
  nodeLabelOffset: 5,
  labelFontSizeSmall: 9,
  labelFontSizeLarge: 10,
  showLinkLabel: true,
  linkLabelOffset: 70,
  linkLabelFontSize: 9,
  linkLabelFill: "white",
  linkLabelStroke: "#94a3b8",
  showArrows: true,
  arrowMarkerId: "arrow",
  /** Arrow head color – matches link stroke so arches are visually distinct from nodes. */
  arrowFill: "#334155",
  /** Arrow size: min/max with weightToSizeCurve "sqrt" so small % stay visible and big % less dominant. */
  arrowMarkerSizeMin: 6.5,
  arrowMarkerSizeMax: 7.5,
  weightToSizeCurve: "sqrt",
  zoomExtent: [0.2, 4],
  fixNodesAfterExpand: true,
};

/** Generic graph defaults (neutral colors, no type-specific styling; all circles). */
export const DEFAULT_GENERIC_GRAPH_CONFIG: GraphConfig = {
  ...DEFAULT_GRAPH_CONFIG,
  nodeRadiusByType: {},
  nodeRadiusDefault: 16,
  nodeShapeByType: {},
  nodeShapeDefault: "circle",
  nodeShapeRoundedRectRadius: 6,
  nodeFillClosedByType: {},
  nodeFillClosedDefault: "#bdbdbd",
  nodeFillOpenByType: {},
  nodeFillOpenDefault: "#4a90d9",
};
