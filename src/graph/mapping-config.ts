/**
 * Configuration for mapping raw JSON/table data to the normalized graph structure.
 * Supports node_id, node_name, node_att1_name, att1_value, link_id, link_label, etc.
 */

/** Describes how to read one attribute from a name-column and value-column pair. */
export interface AttributePair {
  /** Column that holds the attribute name (e.g. node_att1_name). */
  nameField: string;
  /** Column that holds the attribute value (e.g. att1_value). */
  valueField: string;
}

/** Mapping for node fields when source is an explicit nodes array. */
export interface NodeArrayMapping {
  /** Where nodes come from. */
  source: "nodes";
  /** Field containing node id (e.g. node_id). */
  idField: string;
  /** Field for display label (e.g. node_name). */
  labelField?: string;
  /** Field for node type/category (e.g. node_type). */
  typeField?: string;
  /** Name/value column pairs for generic attributes (e.g. node_att1_name → att1_value). */
  attributePairs?: AttributePair[];
  /** Fixed attribute key → column name (e.g. { country: "node_country" }). */
  attributeColumns?: Record<string, string>;
}

/** Mapping for link fields when source is an explicit links array. */
export interface LinkArrayMapping {
  source: "links";
  /** Field for source node id. */
  sourceField: string;
  /** Field for target node id. */
  targetField: string;
  /** Optional link id (e.g. link_id). */
  idField?: string;
  /** Optional link label (e.g. link_label). */
  labelField?: string;
  /** Optional numeric weight (e.g. link_weight, shares). */
  weightField?: string;
  attributePairs?: AttributePair[];
  attributeColumns?: Record<string, string>;
}

/** Mapping when nodes/links are inferred from a rows array (each row = one link). */
export interface RowBasedLinkMapping {
  source: "rows";
  /** Column for source node id (e.g. from_id, fromNode). */
  sourceField: string;
  /** Column for target node id (e.g. to_id, toNode). */
  targetField: string;
  /** Optional link id column. */
  linkIdField?: string;
  /** Optional link label column. */
  linkLabelField?: string;
  /** Optional link weight column (e.g. shares). */
  linkWeightField?: string;
  /** Optional: label for source node (e.g. from_name). */
  sourceLabelField?: string;
  /** Optional: label for target node (e.g. to_name). */
  targetLabelField?: string;
  /** Optional: type for source node (e.g. from_type). */
  sourceTypeField?: string;
  /** Optional: type for target node (e.g. to_type). */
  targetTypeField?: string;
  /** Attribute name/value pairs for the link (e.g. link_att1_name, link_att1_value). */
  linkAttributePairs?: AttributePair[];
  /** Attribute name/value pairs for the source node (e.g. from_att1_name, from_att1_value). */
  sourceNodeAttributePairs?: AttributePair[];
  /** Attribute name/value pairs for the target node (e.g. to_att1_name, to_att1_value). */
  targetNodeAttributePairs?: AttributePair[];
  /** Fixed key → column for link attributes. */
  linkAttributeColumns?: Record<string, string>;
  /** Fixed key → column for source node attributes. */
  sourceNodeAttributeColumns?: Record<string, string>;
  /** Fixed key → column for target node attributes. */
  targetNodeAttributeColumns?: Record<string, string>;
}

/** Mapping when nodes come from an explicit array; links may still be from rows. */
export type NodeMapping = NodeArrayMapping;

export type LinkMapping = LinkArrayMapping | RowBasedLinkMapping;

/** Full data mapping config: how to interpret raw input. */
export interface DataMappingConfig {
  /** How to read nodes (from input.nodes array). If omitted and input has rows, nodes are inferred from link endpoints. */
  nodes?: NodeMapping;
  /** How to read links (from input.links array or from input.rows). */
  links: LinkMapping;
}

/** Default field names for Legal Entities / common BI usage. */
export const DEFAULT_LEGAL_ENTITIES_MAPPING: DataMappingConfig = {
  links: {
    source: "rows",
    sourceField: "fromNode",
    targetField: "toNode",
    linkWeightField: "shares",
    sourceLabelField: "fromLabel",
    targetLabelField: "toLabel",
    sourceTypeField: "fromType",
    targetTypeField: "toType",
  },
};

/** Default field names for a generic nodes+links JSON. */
export const DEFAULT_GENERIC_MAPPING: DataMappingConfig = {
  nodes: {
    source: "nodes",
    idField: "id",
    labelField: "label",
    typeField: "type",
  },
  links: {
    source: "links",
    sourceField: "source",
    targetField: "target",
    labelField: "label",
    weightField: "weight",
  },
};
