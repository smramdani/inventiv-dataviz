/**
 * GraphConfig: layout, style, and behavior options for the generic graph engine.
 * Defaults match the current Legal Entities visual behavior.
 */

/** Supported node shapes; selection can be driven by node type (e.g. Entity vs Shareholder). */
export type NodeShape = "circle" | "rect" | "roundedRect" | "triangle";

/** Node/link styling and layout parameters. */
export interface GraphConfig {
  /** Link force distance (default 65). */
  linkDistance: number;
  /** Link force strength (default 1). */
  linkStrength: number;
  /** Many-body charge strength, negative = repel (default -45). */
  chargeStrength: number;
  /** Max distance for charge force (default 180). */
  chargeDistanceMax: number;
  /** Min distance for charge force (default 24). */
  chargeDistanceMin: number;
  /** Extra padding added to node radius for collision (default 4). */
  collisionRadiusPadding: number;
  /** Center force strength (default 0.15). */
  centerStrength: number;
  /** Radius for placing new nodes around parent when expanding (default 100). */
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
  /** Link stroke color (default #999). */
  linkStroke: string;
  /** Link stroke opacity (default 0.6). */
  linkStrokeOpacity: number;
  /** Link stroke width; if a number, fixed; if function, (weight) => width. */
  linkStrokeWidth: number | ((weight: number) => number);
  /** Label text color (default #333). */
  labelColor: string;
  /** Label font size for small nodes (radius <= 14) (default 9). */
  labelFontSizeSmall: number;
  /** Label font size for large nodes (default 10). */
  labelFontSizeLarge: number;
  /** Show link labels (default true). */
  showLinkLabel: boolean;
  /** Distance from arrow tip to place link label (default 50). */
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
  /** Arrow fill color (default #666). */
  arrowFill: string;
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
  linkDistance: 65,
  linkStrength: 1,
  chargeStrength: -45,
  chargeDistanceMax: 180,
  chargeDistanceMin: 24,
  collisionRadiusPadding: 4,
  centerStrength: 0.15,
  placeNewNodesRadius: 100,
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
  labelColor: "#333",
  labelFontSizeSmall: 9,
  labelFontSizeLarge: 10,
  showLinkLabel: true,
  linkLabelOffset: 50,
  linkLabelFontSize: 9,
  linkLabelFill: "white",
  linkLabelStroke: "#94a3b8",
  showArrows: true,
  arrowMarkerId: "arrow",
  /** Arrow head color – matches link stroke so arches are visually distinct from nodes. */
  arrowFill: "#334155",
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
