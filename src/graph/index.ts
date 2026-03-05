/**
 * Generic graph data binding and mapping.
 * Maps raw JSON/table input to normalized graph structure (nodes + links with optional attributes).
 */

export type {
  MappedNode,
  MappedLink,
  GraphData,
  DataRow,
  RawGraphInput,
  LayoutState,
} from "./types";

export type {
  DataMappingConfig,
  NodeArrayMapping,
  LinkArrayMapping,
  RowBasedLinkMapping,
  AttributePair,
  NodeMapping,
  LinkMapping,
} from "./mapping-config";

export {
  DEFAULT_LEGAL_ENTITIES_MAPPING,
  DEFAULT_GENERIC_MAPPING,
} from "./mapping-config";

export { mapInputToGraph, createRowBasedMapping } from "./mapper";

export {
  legalEntitiesToGraphData,
  buildLegalEntitiesGraphData,
  type LegalEntitiesGraph,
  type LegalEntitiesNode,
  type LegalEntitiesLink,
} from "./adapter";

export type { GraphConfig, NodeShape, LinkStyleContext, InfoCardStyle } from "./config";
export { DEFAULT_GRAPH_CONFIG, DEFAULT_GENERIC_GRAPH_CONFIG, DEFAULT_INFO_CARD_STYLE } from "./config";

export {
  renderGraph,
  type GraphEngineHandle,
  type GraphEngineRenderOptions,
  type EngineNode,
  type LinkSelectionInfo,
} from "./engine";
