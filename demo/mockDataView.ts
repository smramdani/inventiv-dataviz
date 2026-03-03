/**
 * Build a mock Power BI DataView from legacy graph data for the demo.
 * Demo only; not part of the library or production package.
 */

import type { LegalEntitiesGraph } from "../src/graph";

export function buildMockDataViewFromLegalEntitiesGraph(graph: LegalEntitiesGraph): { table: { rows: unknown[][] } } {
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  const rows = graph.links.map((l) => {
    const from = nodeById.get(l.source);
    const to = nodeById.get(l.target);
    return [
      l.source,
      l.target,
      l.shares,
      from?.label ?? l.source,
      to?.label ?? l.target,
      from?.type ?? "Entity",
      to?.type ?? "Entity",
    ];
  });
  return { table: { rows } };
}
