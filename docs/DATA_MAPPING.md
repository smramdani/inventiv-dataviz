# Generic data binding and mapping

The graph widgets use a **generic data binding and mapping system** to load graph structure and attributes from a list of JSON structures (or table-shaped data). The same system supports both **generic graphs** and **specialized** ones (e.g. Legal Entities / Shareholders).

## Normalized graph shape

After mapping, data is in this form:

- **Nodes**: `id`, optional `label`, optional `type`, optional `attributes` (key-value).
- **Links**: `source`, `target`, optional `id`, `label`, `weight`, optional `attributes`.

So you can have:

- `node_id`, `node_name`, `node_att1_name`, `att1_value`, `node_att2_name`, `att2_value`, …
- `link_id`, `link_label`, `link_att1_name`, `link_att1_value`, …

and map them to the internal graph structure.

## Input shapes

1. **Row-based**  
   Each row = one link (edge). Columns describe source node, target node, and optionally link fields and node/link attributes. Nodes are inferred from unique source/target ids; node label/type/attributes come from the row (e.g. first occurrence per node).

2. **Structured**  
   Separate `nodes` and `links` arrays. Each element is an object; mapping config says which fields are id, label, type, and which are attribute name/value pairs or fixed attribute columns.

## Mapping config

- **Row-based** (`links.source === "rows"`):  
  - `sourceField`, `targetField` (required).  
  - Optional: `sourceLabelField`, `targetLabelField`, `sourceTypeField`, `targetTypeField`, `linkIdField`, `linkLabelField`, `linkWeightField`.  
  - Optional: `sourceNodeAttributePairs`, `targetNodeAttributePairs`, `linkAttributePairs` (each is `{ nameField, valueField }[]` for name/value columns).  
  - Optional: `sourceNodeAttributeColumns`, `targetNodeAttributeColumns`, `linkAttributeColumns` (key → column name).

- **Structured** (`links.source === "links"`):  
  - Links: `sourceField`, `targetField`, optional `idField`, `labelField`, `weightField`, `attributePairs`, `attributeColumns`.  
  - Nodes: `nodes.source === "nodes"` with `idField`, `labelField`, `typeField`, `attributePairs`, `attributeColumns`.

## Edge width and arrow size

**Thickness** and **arrow size** are driven by each link’s **`weight`**, scaled **linearly** between config min and max. Map your numeric column to that weight:

- **Row-based:** set **`linkWeightField`** to the column name (e.g. `"volume"`, `"shares"`). Default is `"weight"`.
- **Structured (nodes + links):** each link should have a **`weight`** property, or use **`weightField`** in the link mapping (e.g. `"shares"`).
- **Legal Entities:** the adapter uses **share % (0–100)** as weight so the visual matches the label; no extra mapping.

**Tuning size vs nodes:** Set **`arrowMarkerSizeMin`** / **`arrowMarkerSizeMax`** and **`linkStrokeWidthMin`** / **`linkStrokeWidthMax`**. Use **`weightToSizeCurve: "sqrt"`** so small % stay visible and high % don’t dominate (linear can make small arrows tiny and big ones huge). Example:

```ts
createLegalEntitiesGraph(container, data, {
  config: {
    arrowMarkerSizeMin: 6.5,
    arrowMarkerSizeMax: 7.5,
    linkStrokeWidthMin: 2,
    linkStrokeWidthMax: 4,
    weightToSizeCurve: "sqrt",
  },
});
```

One example (rows):

```ts
createRowBasedMapping({
  sourceField: "source",
  targetField: "target",
  linkWeightField: "volume",  // your column → link.weight → edge width & arrow size
});
```

## Example: row-based with attribute pairs

Input rows (e.g. from Power BI or JSON):

```json
[
  { "fromNode": "n1", "toNode": "n2", "fromLabel": "Acme", "toLabel": "Beta", "fromType": "Entity", "toType": "Entity", "shares": 1000, "link_att1_name": "contract", "link_att1_value": "2024" },
  { "fromNode": "n3", "toNode": "n1", "fromLabel": "John", "toLabel": "Acme", "fromType": "Shareholder", "toType": "Entity", "shares": 500 }
]
```

Config:

```ts
import { createRowBasedMapping, mapInputToGraph } from "./src/graph";

const config = createRowBasedMapping({
  sourceField: "fromNode",
  targetField: "toNode",
  sourceLabelField: "fromLabel",
  targetLabelField: "toLabel",
  sourceTypeField: "fromType",
  targetTypeField: "toType",
  linkWeightField: "shares",
  linkAttributePairs: [
    { nameField: "link_att1_name", valueField: "link_att1_value" },
  ],
});

const graph = mapInputToGraph({ rows: inputRows }, config);
// graph.nodes: MappedNode[] (id, label, type, attributes?)
// graph.links: MappedLink[] (source, target, weight, attributes?)
```

## Example: node_att1_name / att1_value style

If each row has columns like `node_att1_name`, `att1_value`, `node_att2_name`, `att2_value` for **source node** attributes:

```ts
const config = createRowBasedMapping({
  sourceField: "node_id",
  targetField: "target_id",
  sourceLabelField: "node_name",
  sourceNodeAttributePairs: [
    { nameField: "node_att1_name", valueField: "att1_value" },
    { nameField: "node_att2_name", valueField: "att2_value" },
  ],
});
```

Use the same pattern for `targetNodeAttributePairs` (e.g. `to_att1_name`, `to_att1_value`) and `linkAttributePairs` (e.g. `link_att1_name`, `link_att1_value`).

## Using with the Legal Entities visual

Convert mapped data to the legacy format expected by the current visual:

```ts
import { mapInputToGraph, graphDataToLegacy } from "./src/graph";

const graphData = mapInputToGraph(rawInput, config);
const legacyGraph = graphDataToLegacy(graphData);
// legacyGraph.nodes: { id, label, type: "Entity" | "Shareholder" }[]
// legacyGraph.links: { source, target, shares }[]
```

Then pass `legacyGraph` to the visual’s internal graph model (when the visual is refactored to accept it).

## API summary

- **`mapInputToGraph(input, config): GraphData`** – Map raw input to normalized nodes/links and attributes.
- **`createRowBasedMapping(options): DataMappingConfig`** – Build row-based config (each row = one link, optional node/link attribute pairs).
- **`graphDataToLegacy(graph): LegacyFullGraph`** – Convert GraphData to the legacy Legal Entities shape (Entity/Shareholder, shares).
- **`DEFAULT_GENERIC_MAPPING`** / **`DEFAULT_LEGAL_ENTITIES_MAPPING`** – Predefined configs for generic and Legal Entities use cases.

All types and config interfaces are exported from `src/graph/index.ts`.
