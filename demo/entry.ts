/**
 * Inventiv DataViz – Demo entry.
 * Registers widgets and injects demo data. Used only by the demo app (see demo/README.md).
 */

import powerbi from "powerbi-visuals-api";
import { Visual as LegalEntitiesGraphVisual } from "../src/visual";
import { GenericGraphVisual } from "../src/visual-generic";
import { createLegalEntitiesGraph, createGenericGraph } from "../src/web";
import { createRowBasedMapping } from "../src/graph";
import { getFakeGraph, getFakeGraphTechCompanies, getFakeDataSpecies, getFakeDataSentence } from "./fakeGraphData";
import { buildMockDataViewFromLegalEntitiesGraph } from "./mockDataView";
import type { GraphConfig } from "../src/graph";

(window as any).powerbi = powerbi;
(window as any).powerbi.visuals = (window as any).powerbi.visuals || {};
(window as any).powerbi.visuals.plugins = (window as any).powerbi.visuals.plugins || {};

// Legal Entities: default = tech companies (~30 nodes); anonymized small graph also available
const legalGraphTech = getFakeGraphTechCompanies();
const legalGraphAnonymized = getFakeGraph();
(window as any).__inventivDemoDataView = buildMockDataViewFromLegalEntitiesGraph(legalGraphTech);
(window as any).__inventivDemoLegalGraph = legalGraphTech;
(window as any).__inventivDemoDataViewAnonymized = buildMockDataViewFromLegalEntitiesGraph(legalGraphAnonymized);
(window as any).__inventivDemoLegalGraphAnonymized = legalGraphAnonymized;

/** Demo data for Generic Graph: rows [source, target, weight]. */
(window as any).__inventivDemoDataViewGeneric = {
  table: {
    rows: [
      ["A", "B", 100],
      ["B", "C", 50],
      ["C", "D", 80],
      ["A", "C", 30],
      ["B", "D", 20],
      ["D", "E", 60],
      ["C", "E", 40],
      ["E", "F", 90],
      ["A", "D", 10],
    ],
  },
};

/** Raw rows for Generic Graph web API (simple A–F network). */
(window as any).__inventivDemoGenericRows = [
  { source: "A", target: "B", weight: 100 },
  { source: "B", target: "C", weight: 50 },
  { source: "C", target: "D", weight: 80 },
  { source: "A", target: "C", weight: 30 },
  { source: "B", target: "D", weight: 20 },
  { source: "D", target: "E", weight: 60 },
  { source: "C", target: "E", weight: 40 },
  { source: "E", target: "F", weight: 90 },
  { source: "A", target: "D", weight: 10 },
];

/** Species / taxonomy: source, target, weight, label, sourceType, targetType. */
(window as any).__inventivDemoSpeciesRows = getFakeDataSpecies();
/** Sentence / POS: words and grammatical relations with sourceType/targetType (POS). */
(window as any).__inventivDemoSentenceRows = getFakeDataSentence();
/** Mapping for rows that include link label (e.g. species, sentence). */
(window as any).__inventivMappingWithLabel = createRowBasedMapping({
  sourceField: "source",
  targetField: "target",
  linkWeightField: "weight",
  linkLabelField: "label",
});
/** Mapping with node type from sourceType/targetType for shape/size/color by type. */
(window as any).__inventivMappingWithType = createRowBasedMapping({
  sourceField: "source",
  targetField: "target",
  linkWeightField: "weight",
  linkLabelField: "label",
  sourceTypeField: "sourceType",
  targetTypeField: "targetType",
});

/** Custom style for Legal Entities: violet/emerald palette. */
(window as any).__inventivCustomLegalConfig = {
  nodeFillClosedByType: { Shareholder: "#4b5563", Entity: "#ddd6fe" },
  nodeFillOpenByType: { Shareholder: "#059669", Entity: "#7c3aed" },
  nodeFillClosedDefault: "#ddd6fe",
  nodeFillOpenDefault: "#7c3aed",
  nodeStroke: "#fff",
  linkStroke: "#7c3aed",
  linkStrokeOpacity: 0.7,
  arrowFill: "#6d28d9",
  labelColor: "#1f2937",
  linkLabelStroke: "#a78bfa",
} as Partial<GraphConfig>;

/** Custom style for Generic Graph: sky/amber palette. */
(window as any).__inventivCustomGenericConfig = {
  nodeRadiusDefault: 18,
  nodeFillClosedDefault: "#0ea5e9",
  nodeFillOpenDefault: "#f59e0b",
  nodeStroke: "#fff",
  linkStroke: "#0ea5e9",
  linkStrokeOpacity: 0.65,
  arrowFill: "#0284c7",
  labelColor: "#0f172a",
  linkLabelFill: "#f0f9ff",
  linkLabelStroke: "#7dd3fc",
} as Partial<GraphConfig>;

/** Species demo: shapes and sizes by taxonomic rank (kingdom→rect, species→circle, subspecies→triangle). */
(window as any).__inventivSpeciesShapeConfig = {
  nodeShapeByType: {
    kingdom: "rect",
    phylum: "rect",
    class: "roundedRect",
    order: "roundedRect",
    family: "circle",
    genus: "circle",
    species: "circle",
    subspecies: "triangle",
  },
  nodeShapeDefault: "circle",
  nodeRadiusByType: {
    kingdom: 20,
    phylum: 18,
    class: 16,
    order: 14,
    family: 12,
    genus: 11,
    species: 10,
    subspecies: 9,
  },
  nodeRadiusDefault: 10,
  nodeFillClosedByType: {},
  nodeFillClosedDefault: "#2d5016",
  nodeFillOpenByType: {},
  nodeFillOpenDefault: "#4a7c23",
  linkStroke: "#2d5016",
  labelColor: "#1a3009",
} as Partial<GraphConfig>;

/** Sentence/POS demo: shapes by part of speech (noun=rect, verb=roundedRect, det/adj=circle, prep=triangle). */
(window as any).__inventivSentenceShapeConfig = {
  nodeShapeByType: {
    noun: "rect",
    verb: "roundedRect",
    det: "circle",
    adj: "circle",
    prep: "triangle",
  },
  nodeShapeDefault: "circle",
  nodeRadiusByType: { noun: 14, verb: 13, det: 10, adj: 10, prep: 11 },
  nodeRadiusDefault: 10,
  nodeFillClosedByType: {},
  nodeFillClosedDefault: "#1e3a5f",
  nodeFillOpenByType: {},
  nodeFillOpenDefault: "#3b82f6",
  linkStroke: "#64748b",
  labelColor: "#0f172a",
} as Partial<GraphConfig>;

(window as any).__inventivCreateLegalEntitiesGraph = createLegalEntitiesGraph;
(window as any).__inventivCreateGenericGraph = createGenericGraph;

const inventivLegalEntitiesGraph = {
  name: "inventivLegalEntitiesGraph",
  displayName: "Legal Entities Graph",
  class: "Visual",
  apiVersion: "5.3.0",
  create: (options?: any) => {
    if (!options?.element) throw new Error("Visual requires constructor options");
    return new LegalEntitiesGraphVisual(options);
  },
  custom: true,
};

const inventivGenericGraph = {
  name: "inventivGenericGraph",
  displayName: "Generic Graph",
  class: "GenericGraphVisual",
  apiVersion: "5.3.0",
  create: (options?: any) => {
    if (!options?.element) throw new Error("Visual requires constructor options");
    return new GenericGraphVisual(options);
  },
  custom: true,
};

(window as any).inventivLegalEntitiesGraph_DEBUG = inventivLegalEntitiesGraph;
(window as any).inventivLegalEntitiesGraph = inventivLegalEntitiesGraph;
(window as any).powerbi.visuals.plugins["inventivLegalEntitiesGraph"] = inventivLegalEntitiesGraph;

(window as any).inventivGenericGraph_DEBUG = inventivGenericGraph;
(window as any).inventivGenericGraph = inventivGenericGraph;
(window as any).powerbi.visuals.plugins["inventivGenericGraph"] = inventivGenericGraph;
