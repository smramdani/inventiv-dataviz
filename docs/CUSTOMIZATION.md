# Customizing the graphs

You can customize the look and behaviour of both **Generic Graph** and **Legal Entities Graph** by passing a **`config`** object (partial: only the options you want to override). This page documents every configurable parameter and gives code examples.

**What you can configure:** node **shapes** (circle, rect, roundedRect, triangle), **colors** (nodes, links, arrows, labels, label boxes), **sizes and distances** (node radius, link/arrow thickness, font sizes, label offset, zoom), **auto layout** (bouton « Organiser » : distance entre nœuds, répulsion, collision), and **visibility** (arrows, link labels). See the [full config reference](#6-full-config-reference-quick-table) and the [code examples](#7-complete-code-examples) at the end.

---

## 1. How to pass custom config

**Web API:** pass `config` in the third argument.

```js
InventivDataviz.createGenericGraph(container, data, {
  config: {
    nodeShapeDefault: "roundedRect",
    labelColor: "#1a1a1a",
  },
});

InventivDataviz.createLegalEntitiesGraph(container, data, {
  config: {
    nodeFillOpenByType: { Entity: "#7c3aed", Shareholder: "#059669" },
    linkStroke: "#6d28d9",
  },
});
```

**ESM:** same idea with the options object.

```js
import { createGenericGraph } from "./dist/inventiv-dataviz.esm.js";
createGenericGraph(containerEl, { rows: [...] }, { config: { ... } });
```

Only the keys you set are overridden; the rest stay at the default.

---

## 2. Node shapes

Supported shapes: **`circle`**, **`rect`**, **`roundedRect`**, **`triangle`**.

| Shape         | Description                          |
|---------------|--------------------------------------|
| `circle`      | Circle (default for generic graph). |
| `rect`        | Square/rectangle (same width and height from node radius). |
| `roundedRect` | Rectangle with rounded corners.     |
| `triangle`    | Equilateral triangle (point up).     |

*Note: there is no separate “rounded triangle” or “rounded square”; use `roundedRect` for rounded rectangles (or squares when radius is equal on both axes).*

**Parameters:**

| Parameter | Type | Description |
|-----------|------|--------------|
| `nodeShapeDefault` | `"circle" \| "rect" \| "roundedRect" \| "triangle"` | Shape when node has no type or type is not in `nodeShapeByType`. |
| `nodeShapeByType` | `Record<string, NodeShape>` | Shape per node type (e.g. `Entity` → `roundedRect`, `Shareholder` → `circle`). |
| `nodeShapeRoundedRectRadius` | `number` | Corner radius for `roundedRect` (default `6`). |

**Example – shapes by type (e.g. taxonomy or POS):**

```js
createGenericGraph(container, data, {
  mapping: createRowBasedMapping({
    sourceField: "source",
    targetField: "target",
    sourceTypeField: "sourceType",  // e.g. "noun", "verb"
    targetTypeField: "targetType",
  }),
  config: {
    nodeShapeByType: {
      noun: "rect",
      verb: "roundedRect",
      det: "circle",
      prep: "triangle",
    },
    nodeShapeDefault: "circle",
    nodeShapeRoundedRectRadius: 8,
  },
});
```

**Example – all nodes same shape:**

```js
config: {
  nodeShapeDefault: "roundedRect",
  nodeShapeRoundedRectRadius: 10,
}
```

---

## 3. Colors

### Nodes

| Parameter | Description |
|-----------|-------------|
| `nodeFillOpenByType` | Fill when node is “open” (e.g. expanded), by type. |
| `nodeFillOpenDefault` | Default open fill when type not in map. |
| `nodeFillClosedByType` | Fill when node is “closed”, by type (Legal Entities: gray before click). |
| `nodeFillClosedDefault` | Default closed fill. |
| `nodeStroke` | Border color of the node shape. |
| `nodeStrokeWidth` | Border width (e.g. `2`). |

### Links (edges) and arrows

| Parameter | Description |
|-----------|-------------|
| `linkStroke` | Color of the link line. Can be a string or a function `(link) => color` where `link` has `fromNode.type` and `toNode.type` (e.g. to color by Personne physique → Entité: green, Entité → Entité: blue). |
| `linkStrokeOpacity` | Opacity of the link (e.g. `0.7`). |
| `arrowFill` | Color of the arrow head. Can be a string or a function `(link) => color` for per-link arrow color. |

### Labels

| Parameter | Description |
|-----------|-------------|
| `labelColor` | Color of **node labels** and **link label text**. |
| `nodeLabelOffset` | Horizontal distance from node edge to node label (default `5`). Increase to move the label farther from the node. |
| `linkLabelFill` | Background of the link label box (e.g. `"white"`). |
| `linkLabelStroke` | Border of the link label box. |

**Example – custom palette (e.g. violet/emerald):**

```js
config: {
  nodeFillClosedByType: { Shareholder: "#4b5563", Entity: "#ddd6fe" },
  nodeFillOpenByType:   { Shareholder: "#059669", Entity: "#7c3aed" },
  nodeFillClosedDefault: "#ddd6fe",
  nodeFillOpenDefault:   "#7c3aed",
  nodeStroke: "#fff",
  linkStroke: "#7c3aed",
  linkStrokeOpacity: 0.7,
  arrowFill: "#6d28d9",
  labelColor: "#1f2937",
  linkLabelFill: "white",
  linkLabelStroke: "#a78bfa",
}
```

---

## 4. Sizes and distances

### Node size

| Parameter | Description |
|-----------|-------------|
| `nodeRadiusDefault` | Default node radius (e.g. `18`). |
| `nodeRadiusByType` | Radius per type (e.g. `Shareholder: 12`, `Entity: 22`). |

### Links and arrows (thickness / size)

| Parameter | Description |
|-----------|-------------|
| `linkStrokeWidthMin` | Min link thickness when scaling by weight (e.g. shares %). |
| `linkStrokeWidthMax` | Max link thickness. |
| `arrowMarkerSizeMin` | Min arrow head size (SVG units). |
| `arrowMarkerSizeMax` | Max arrow head size. |
| `weightToSizeCurve` | `"linear"` or `"sqrt"` – curve for mapping weight to thickness/size; `"sqrt"` keeps small weights visible. |

### Labels

| Parameter | Description |
|-----------|-------------|
| `nodeLabelOffset` | Distance from node edge to node label (default 5). |
| `labelFontSizeSmall` | Font size for small nodes (radius ≤ 14). |
| `labelFontSizeLarge` | Font size for larger nodes. |
| `linkLabelFontSize` | Font size of the text on link labels. |
| `linkLabelOffset` | Distance from arrow tip to link label (default `70`). |

### Layout (placement initial et zoom)

| Parameter | Description |
|-----------|-------------|
| `placeNewNodesRadius` | Radius of the circle used to place new nodes when expanding (e.g. `130`). |
| `zoomExtent` | `[minScale, maxScale]` for zoom (e.g. `[0.2, 4]`). |

---

## 4.5 Auto layout (bouton « Organiser »)

Le bouton **Organiser** dans la toolbar lance un calcul de layout en une fois (simulation de forces) puis fige les positions. Les paramètres suivants contrôlent ce comportement ; ils sont tous **configurables** via `config` :

| Parameter | Description | Default |
|-----------|-------------|---------|
| `linkDistance` | Distance idéale entre deux nœuds connectés. Plus la valeur est grande, plus les voisins sont éloignés. | `180` |
| `linkStrength` | Force du lien (0–1). `1` = les nœuds connectés tendent à respecter `linkDistance`. | `1` |
| `chargeStrength` | Répulsion entre tous les nœuds (valeur négative). Plus la valeur est négative (ex. `-200`), plus les nœuds se repoussent. | `-180` |
| `chargeDistanceMax` | Distance max à laquelle la répulsion agit. | `320` |
| `chargeDistanceMin` | Distance min en dessous de laquelle la répulsion est plafonnée. | `32` |
| `collisionRadiusPadding` | Marge ajoutée au rayon du nœud pour la détection de collision (évite le chevauchement). Plus la valeur est grande, plus les nœuds restent éloignés. | `16` |
| `centerStrength` | Attraction vers le centre du conteneur (0–1). Plus faible = le graphe peut s’étaler davantage. | `0.1` |

**Exemple – layout plus compact :**

```js
config: {
  linkDistance: 100,
  chargeStrength: -80,
  collisionRadiusPadding: 8,
}
```

**Exemple – layout plus espacé :**

```js
config: {
  linkDistance: 220,
  chargeStrength: -220,
  chargeDistanceMax: 400,
  collisionRadiusPadding: 20,
}
```

**Example – balanced arrows and link thickness:**

```js
config: {
  linkStrokeWidthMin: 2,
  linkStrokeWidthMax: 5,
  arrowMarkerSizeMin: 6,
  arrowMarkerSizeMax: 8,
  weightToSizeCurve: "sqrt",
}
```

**Example – larger nodes and labels:**

```js
config: {
  nodeRadiusDefault: 20,
  nodeRadiusByType: { Entity: 24, Shareholder: 14 },
  labelFontSizeSmall: 10,
  labelFontSizeLarge: 12,
  linkLabelFontSize: 10,
}
```

---

## 5. Visibility and behaviour

| Parameter | Description |
|-----------|-------------|
| `showArrows` | Show arrow heads on links (default `true`). |
| `showLinkLabel` | Show labels on links (default `true`). |
| `fixNodesAfterExpand` | Keep node positions fixed after expand (default `true`). |

---

## 6. Full config reference (quick table)

| Category | Parameters |
|----------|------------|
| **Shapes** | `nodeShapeDefault`, `nodeShapeByType`, `nodeShapeRoundedRectRadius` |
| **Node size** | `nodeRadiusDefault`, `nodeRadiusByType` |
| **Node colors** | `nodeFillOpenByType`, `nodeFillOpenDefault`, `nodeFillClosedByType`, `nodeFillClosedDefault`, `nodeStroke`, `nodeStrokeWidth` |
| **Link/arrow** | `linkStroke`, `linkStrokeOpacity`, `linkStrokeWidthMin`, `linkStrokeWidthMax`, `arrowFill`, `arrowMarkerSizeMin`, `arrowMarkerSizeMax`, `weightToSizeCurve` |
| **Labels** | `labelColor`, `nodeLabelOffset`, `labelFontSizeSmall`, `labelFontSizeLarge`, `linkLabelOffset`, `linkLabelFontSize`, `linkLabelFill`, `linkLabelStroke` |
| **Visibility** | `showArrows`, `showLinkLabel` |
| **Layout/zoom** | `placeNewNodesRadius`, `zoomExtent`, `fixNodesAfterExpand` |
| **Organiser (auto layout)** | `linkDistance`, `linkStrength`, `chargeStrength`, `chargeDistanceMax`, `chargeDistanceMin`, `collisionRadiusPadding`, `centerStrength` |

---

## 7. Complete code examples

### Example 1 – Generic graph, all circles, custom colors

```js
InventivDataviz.createGenericGraph(document.getElementById("graph"), {
  rows: [
    { source: "A", target: "B", weight: 10 },
    { source: "B", target: "C", weight: 20 },
  ],
}, {
  config: {
    nodeRadiusDefault: 18,
    nodeFillOpenDefault: "#0ea5e9",
    nodeFillClosedDefault: "#0369a1",
    nodeStroke: "#fff",
    linkStroke: "#0ea5e9",
    arrowFill: "#0284c7",
    labelColor: "#0f172a",
  },
  layoutKey: "my-generic-graph",
});
```

### Example 2 – Generic graph, shapes by type (e.g. from a “type” column)

```js
// Data rows have sourceType / targetType (e.g. "noun", "verb")
createGenericGraph(container, { rows: dataRows }, {
  mapping: createRowBasedMapping({
    sourceField: "source",
    targetField: "target",
    sourceTypeField: "sourceType",
    targetTypeField: "targetType",
  }),
  config: {
    nodeShapeByType: {
      noun: "rect",
      verb: "roundedRect",
      adj: "circle",
      prep: "triangle",
    },
    nodeShapeDefault: "circle",
    nodeRadiusByType: { noun: 14, verb: 13, adj: 10, prep: 11 },
    nodeRadiusDefault: 10,
    nodeFillOpenDefault: "#3b82f6",
    linkStroke: "#64748b",
    labelColor: "#1e293b",
  },
});
```

### Example 3 – Legal Entities, custom palette and arrow/link sizing

```js
InventivDataviz.createLegalEntitiesGraph(container, legacyGraphData, {
  config: {
    nodeFillOpenByType:   { Shareholder: "#059669", Entity: "#7c3aed" },
    nodeFillClosedByType: { Shareholder: "#4b5563", Entity: "#ddd6fe" },
    nodeStroke: "#fff",
    linkStroke: "#7c3aed",
    linkStrokeOpacity: 0.7,
    linkStrokeWidthMin: 2,
    linkStrokeWidthMax: 5,
    arrowFill: "#6d28d9",
    arrowMarkerSizeMin: 6,
    arrowMarkerSizeMax: 8,
    weightToSizeCurve: "sqrt",
    labelColor: "#1f2937",
    linkLabelFill: "#f5f3ff",
    linkLabelStroke: "#a78bfa",
  },
  layoutKey: "legal-entities-report",
});
```

### Example 4 – Minimal overrides (only labels and link color)

```js
config: {
  labelColor: "#334155",
  linkStroke: "#64748b",
  linkLabelFontSize: 10,
}
```

---

## 8. Other parameters you might need

- **Layout persistence:** use `layoutKey` in options (not in `config`) so the graph’s layout is saved and restored. See [LAYOUT_PERSISTENCE_PLAN.md](LAYOUT_PERSISTENCE_PLAN.md).
- **Mapping:** for row-based data with types or link labels, use `mapping` (e.g. `createRowBasedMapping({ sourceTypeField, targetTypeField, linkLabelField })`). See [DATA_MAPPING.md](DATA_MAPPING.md).

### Have we missed any configurable parameters?

The sections above cover all parameters that currently affect rendering and behaviour:

- **Shapes:** `nodeShapeDefault`, `nodeShapeByType`, `nodeShapeRoundedRectRadius`.
- **Colors:** node fill (open/closed, by type), `nodeStroke`, `nodeStrokeWidth`, `linkStroke`, `linkStrokeOpacity`, `arrowFill`, `labelColor`, `linkLabelFill`, `linkLabelStroke`.
- **Sizes/distances:** `nodeRadiusDefault`, `nodeRadiusByType`, `linkStrokeWidthMin/Max`, `arrowMarkerSizeMin/Max`, `weightToSizeCurve`, `nodeLabelOffset`, `labelFontSizeSmall/Large`, `linkLabelFontSize`, `linkLabelOffset`, `placeNewNodesRadius`, `zoomExtent`.
- **Organiser (auto layout):** `linkDistance`, `linkStrength`, `chargeStrength`, `chargeDistanceMax`, `chargeDistanceMin`, `collisionRadiusPadding`, `centerStrength` — utilisés par le bouton « Organiser ».
- **Visibility:** `showArrows`, `showLinkLabel`, `fixNodesAfterExpand`.

If you need a parameter that is not in this list (e.g. another shape such as diamond or hexagon, or a different label position), you can open an issue or contact the project team; the config and engine can be extended.
