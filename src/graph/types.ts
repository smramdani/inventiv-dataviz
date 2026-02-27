/**
 * Generic graph data types with optional attributes for nodes and links.
 * Used as the normalized output of the data binding/mapping system.
 */

/** A node with required id and optional label, type, and arbitrary attributes. */
export interface MappedNode {
  id: string;
  label?: string;
  type?: string;
  /** Generic key-value attributes (e.g. country, sector, custom fields). */
  attributes?: Record<string, unknown>;
}

/** A link with required source/target node ids and optional id, label, weight, and attributes. */
export interface MappedLink {
  source: string;
  target: string;
  id?: string;
  label?: string;
  weight?: number;
  /** Which end the arrow points to (default 'target'). Used by engine for directed edges. */
  arrowAt?: "source" | "target";
  /** Generic key-value attributes (e.g. sharePct, role, custom fields). */
  attributes?: Record<string, unknown>;
}

/** Normalized graph structure produced by the mapper. */
export interface GraphData {
  nodes: MappedNode[];
  links: MappedLink[];
}

/** Raw row/object shape from JSON or table input (string-indexed). */
export type DataRow = Record<string, unknown>;

/** Input can be rows only, or explicit nodes + links arrays. */
export interface RawGraphInput {
  /** Table-style: each row typically represents a link (edge) with optional node/link fields. */
  rows?: DataRow[];
  /** Explicit nodes array (e.g. from a "nodes" table or JSON key). */
  nodes?: DataRow[];
  /** Explicit links array (e.g. from a "links" table or JSON key). */
  links?: DataRow[];
}
