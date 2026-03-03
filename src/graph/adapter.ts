/**
 * Adapter: convert between GraphData and the Legal Entities input format
 * (nodes with Entity/Shareholder type, links with shares). Build GraphData for the engine.
 */

import type { GraphData, MappedNode, MappedLink } from "./types";

/** Legal Entities node shape (id, label, type Entity | Shareholder). */
export interface LegalEntitiesNode {
  id: string;
  label: string;
  type: "Entity" | "Shareholder";
}

/** Legal Entities link shape (source, target, shares). */
export interface LegalEntitiesLink {
  source: string;
  target: string;
  shares: number;
}

/** Input format for createLegalEntitiesGraph: nodes and links with shares. */
export interface LegalEntitiesGraph {
  nodes: LegalEntitiesNode[];
  links: LegalEntitiesLink[];
}

/**
 * Convert Legal Entities graph input to GraphData (for use with the generic engine).
 * Node type and link weight are preserved; no share % or arrow direction.
 */
export function legalEntitiesToGraphData(graph: LegalEntitiesGraph): GraphData {
  const nodes: MappedNode[] = graph.nodes.map((n) => ({
    id: n.id,
    label: n.label,
    type: n.type,
  }));
  const links = graph.links.map((l) => ({
    source: l.source,
    target: l.target,
    weight: l.shares,
  }));
  return { nodes, links };
}

/**
 * Build GraphData for the engine from a Legal Entities graph:
 * visible nodes/links only, share % on link labels, arrow at entity node.
 * Link weight is set to sharePct (0–100) so stroke width and arrow size
 * are proportional to the displayed percentage, not raw shares.
 */
export function buildLegalEntitiesGraphData(
  fullGraph: LegalEntitiesGraph,
  visibleNodeIds: Set<string>
): GraphData {
  const nodeMap = new Map(fullGraph.nodes.map((n) => [n.id, n]));
  const visibleNodes = fullGraph.nodes.filter((n) => visibleNodeIds.has(n.id));
  const visibleLinks = fullGraph.links.filter(
    (l) => visibleNodeIds.has(l.source) && visibleNodeIds.has(l.target)
  );

  const totalSharesByTarget = new Map<string, number>();
  for (const l of fullGraph.links) {
    totalSharesByTarget.set(l.target, (totalSharesByTarget.get(l.target) ?? 0) + l.shares);
  }

  const nodes: MappedNode[] = visibleNodes.map((n) => ({
    id: n.id,
    label: n.label,
    type: n.type,
  }));

  const links = visibleLinks.map((l) => {
    const sourceNode = nodeMap.get(l.source);
    const targetNode = nodeMap.get(l.target);
    const total = totalSharesByTarget.get(l.target) ?? 1;
    const sharePct = total > 0 ? (l.shares / total) * 100 : 0;
    const arrowAt =
      sourceNode?.type === "Shareholder" && targetNode?.type === "Entity"
        ? "target"
        : sourceNode?.type === "Entity" && targetNode?.type === "Shareholder"
          ? "source"
          : "target";
    return {
      source: l.source,
      target: l.target,
      weight: sharePct,
      label: `${sharePct.toFixed(0)}%`,
      arrowAt: arrowAt as "source" | "target",
    };
  });

  return { nodes, links };
}
