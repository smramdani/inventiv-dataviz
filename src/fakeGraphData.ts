/**
 * PoC: Fake graph data – 20 nodes (Legal Entities + Persons) and edges (shares).
 * Legal Entities: "Corporate Name (Country)". Persons: "FirstName LastName".
 */

export interface GraphNode {
  id: string;
  label: string;
  type: "Entity" | "Shareholder";
}

export interface GraphLink {
  source: string;
  target: string;
  shares: number;
}

export interface FullGraph {
  nodes: GraphNode[];
  links: GraphLink[];
}

function node(id: string, label: string, type: "Entity" | "Shareholder"): GraphNode {
  return { id, label, type };
}

function link(source: string, target: string, shares: number): GraphLink {
  return { source, target, shares };
}

/** Full graph: 20 nodes. Legal Entities = "Name (Country)", Persons = "First Last". */
export function getFakeGraph(): FullGraph {
  const nodes: GraphNode[] = [
    node("n1", "Saint Gobain (France)", "Entity"),
    node("n2", "Beta Holdings (UK)", "Entity"),
    node("n3", "Gamma Inc (USA)", "Entity"),
    node("n4", "Delta Ltd (Germany)", "Entity"),
    node("n5", "Epsilon SA (Luxembourg)", "Entity"),
    node("n6", "Zeta Group (Netherlands)", "Entity"),
    node("n7", "Sigma Ventures (Ireland)", "Entity"),
    node("n8", "Omega Partners (Switzerland)", "Entity"),
    node("n9", "John Doe", "Shareholder"),
    node("n10", "Jane Smith", "Shareholder"),
    node("n11", "Pierre Martin", "Shareholder"),
    node("n12", "Anna Weber", "Shareholder"),
    node("n13", "Thomas Brown", "Shareholder"),
    node("n14", "Maria Garcia", "Shareholder"),
    node("n15", "James Wilson", "Shareholder"),
    node("n16", "Alex Kerr", "Shareholder"),
    node("n17", "Sophie Dubois", "Shareholder"),
    node("n18", "Michael Chen", "Shareholder"),
    node("n19", "Emma Fischer", "Shareholder"),
    node("n20", "David O'Brien", "Shareholder"),
  ];

  // Shareholding rules: only Person→Entity and Entity→Entity. No Person→Person, no Entity→Person.
  // Convention: source = shareholder, target = entity.
  const links: GraphLink[] = [
    link("n9", "n1", 2500),
    link("n11", "n1", 5000),
    link("n1", "n2", 1000),
    link("n10", "n2", 3000),
    link("n11", "n2", 2000),
    link("n2", "n3", 1500),
    link("n12", "n3", 4000),
    link("n13", "n3", 1000),
    link("n3", "n4", 800),
    link("n14", "n4", 3500),
    link("n15", "n4", 1200),
    link("n4", "n5", 600),
    link("n16", "n5", 2000),
    link("n5", "n6", 900),
    link("n17", "n6", 1800),
    link("n18", "n6", 2200),
    link("n6", "n7", 700),
    link("n19", "n7", 1100),
    link("n7", "n8", 500),
    link("n20", "n8", 4500),
    link("n9", "n8", 600),
  ];

  return { nodes, links };
}

/** Default node to show first when exploring (must be in nodes). */
export const DEFAULT_START_NODE_ID = "n1";
