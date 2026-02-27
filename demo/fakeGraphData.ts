/**
 * Demo graph data – Legal Entities & Shareholders, Species, Sentence/POS.
 * Used only by the demo app; not part of the library or production package.
 * Legal entity names are anonymized or illustrative (fake data for known brands).
 */

import type { LegacyFullGraph } from "../src/graph";

function node(id: string, label: string, type: "Entity" | "Shareholder") {
  return { id, label, type };
}

function link(source: string, target: string, shares: number) {
  return { source, target, shares };
}

/** Anonymized corporate structure (privacy-safe). */
export function getFakeGraph(): LegacyFullGraph {
  const nodes: LegacyFullGraph["nodes"] = [
    node("n1", "Global Holdings (France)", "Entity"),
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

  const links: LegacyFullGraph["links"] = [
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

/** Fake tech / conglomerate structure (~30 nodes): Alphabet, Meta, Tesla, SpaceX, etc. */
export function getFakeGraphTechCompanies(): LegacyFullGraph {
  const nodes: LegacyFullGraph["nodes"] = [
    node("t1", "Alphabet Inc", "Entity"),
    node("t2", "Google LLC", "Entity"),
    node("t3", "YouTube", "Entity"),
    node("t4", "Waymo", "Entity"),
    node("t5", "DeepMind", "Entity"),
    node("t6", "Meta Platforms", "Entity"),
    node("t7", "Facebook", "Entity"),
    node("t8", "Instagram", "Entity"),
    node("t9", "WhatsApp", "Entity"),
    node("t10", "Tesla Inc", "Entity"),
    node("t11", "SpaceX", "Entity"),
    node("t12", "Starlink", "Entity"),
    node("t13", "The Boring Company", "Entity"),
    node("t14", "Neuralink", "Entity"),
    node("t15", "X Corp", "Entity"),
    node("t16", "Larry Page", "Shareholder"),
    node("t17", "Sergey Brin", "Shareholder"),
    node("t18", "Sundar Pichai", "Shareholder"),
    node("t19", "Mark Zuckerberg", "Shareholder"),
    node("t20", "Elon Musk", "Shareholder"),
    node("t21", "Institutional Fund A", "Shareholder"),
    node("t22", "Institutional Fund B", "Shareholder"),
    node("t23", "Verily", "Entity"),
    node("t24", "Reality Labs", "Entity"),
    node("t25", "SolarCity", "Entity"),
  ];

  const links: LegacyFullGraph["links"] = [
    link("t16", "t1", 5000),
    link("t17", "t1", 4800),
    link("t21", "t1", 3000),
    link("t1", "t2", 10000),
    link("t1", "t3", 8000),
    link("t1", "t4", 2000),
    link("t1", "t5", 1500),
    link("t1", "t23", 800),
    link("t18", "t2", 500),
    link("t19", "t6", 8500),
    link("t22", "t6", 2000),
    link("t6", "t7", 9500),
    link("t6", "t8", 9000),
    link("t6", "t9", 8800),
    link("t6", "t24", 1200),
    link("t20", "t10", 6000),
    link("t20", "t11", 7500),
    link("t21", "t10", 2500),
    link("t10", "t25", 3000),
    link("t11", "t12", 4000),
    link("t20", "t13", 2000),
    link("t20", "t14", 1500),
    link("t20", "t15", 3500),
  ];

  return { nodes, links };
}

/** Raw rows for generic graph: animals, species, subspecies, relations. */
export interface GenericGraphRow {
  source: string;
  target: string;
  weight?: number;
  label?: string;
  /** Node type for shape/size/color mapping (e.g. taxonomic rank or POS). */
  sourceType?: string;
  targetType?: string;
}

export function getFakeDataSpecies(): GenericGraphRow[] {
  return [
    { source: "Animalia", target: "Chordata", sourceType: "kingdom", targetType: "phylum", weight: 1, label: "phylum" },
    { source: "Chordata", target: "Mammalia", sourceType: "phylum", targetType: "class", weight: 1, label: "class" },
    { source: "Chordata", target: "Aves", sourceType: "phylum", targetType: "class", weight: 1, label: "class" },
    { source: "Mammalia", target: "Carnivora", sourceType: "class", targetType: "order", weight: 1, label: "order" },
    { source: "Mammalia", target: "Primates", sourceType: "class", targetType: "order", weight: 1, label: "order" },
    { source: "Mammalia", target: "Cetacea", sourceType: "class", targetType: "order", weight: 1, label: "order" },
    { source: "Carnivora", target: "Felidae", sourceType: "order", targetType: "family", weight: 1, label: "family" },
    { source: "Carnivora", target: "Canidae", sourceType: "order", targetType: "family", weight: 1, label: "family" },
    { source: "Felidae", target: "Felis", sourceType: "family", targetType: "genus", weight: 1, label: "genus" },
    { source: "Felidae", target: "Panthera", sourceType: "family", targetType: "genus", weight: 1, label: "genus" },
    { source: "Canidae", target: "Canis", sourceType: "family", targetType: "genus", weight: 1, label: "genus" },
    { source: "Felis", target: "Felis catus", sourceType: "genus", targetType: "species", weight: 1, label: "species" },
    { source: "Felis", target: "Felis silvestris", sourceType: "genus", targetType: "species", weight: 1, label: "species" },
    { source: "Panthera", target: "Panthera leo", sourceType: "genus", targetType: "species", weight: 1, label: "species" },
    { source: "Panthera", target: "Panthera tigris", sourceType: "genus", targetType: "species", weight: 1, label: "species" },
    { source: "Canis", target: "Canis lupus", sourceType: "genus", targetType: "species", weight: 1, label: "species" },
    { source: "Canis lupus", target: "Canis lupus familiaris", sourceType: "species", targetType: "subspecies", weight: 1, label: "subspecies" },
    { source: "Aves", target: "Passeriformes", sourceType: "class", targetType: "order", weight: 1, label: "order" },
    { source: "Passeriformes", target: "Corvus", sourceType: "order", targetType: "genus", weight: 1, label: "genus" },
    { source: "Corvus", target: "Corvus corax", sourceType: "genus", targetType: "species", weight: 1, label: "species" },
    { source: "Panthera leo", target: "Gazella", sourceType: "species", targetType: "species", weight: 2, label: "preys_on" },
    { source: "Felis catus", target: "Mus", sourceType: "species", targetType: "genus", weight: 2, label: "preys_on" },
  ];
}

/** Raw rows for generic graph: sentence words and grammatical/semantic relations (POS / dependency-style). */
export function getFakeDataSentence(): GenericGraphRow[] {
  return [
    { source: "The", target: "fox", sourceType: "det", targetType: "noun", weight: 1, label: "det" },
    { source: "quick", target: "fox", sourceType: "adj", targetType: "noun", weight: 1, label: "amod" },
    { source: "brown", target: "fox", sourceType: "adj", targetType: "noun", weight: 1, label: "amod" },
    { source: "fox", target: "jumps", sourceType: "noun", targetType: "verb", weight: 1, label: "nsubj" },
    { source: "jumps", target: "over", sourceType: "verb", targetType: "prep", weight: 1, label: "prep" },
    { source: "over", target: "dog", sourceType: "prep", targetType: "noun", weight: 1, label: "pobj" },
    { source: "the", target: "dog", sourceType: "det", targetType: "noun", weight: 1, label: "det" },
    { source: "lazy", target: "dog", sourceType: "adj", targetType: "noun", weight: 1, label: "amod" },
    { source: "The", target: "cat", sourceType: "det", targetType: "noun", weight: 1, label: "det" },
    { source: "cat", target: "sat", sourceType: "noun", targetType: "verb", weight: 1, label: "nsubj" },
    { source: "sat", target: "mat", sourceType: "verb", targetType: "noun", weight: 1, label: "pobj" },
    { source: "on", target: "mat", sourceType: "prep", targetType: "noun", weight: 1, label: "prep" },
  ];
}

export const DEFAULT_START_NODE_ID = "n1";
export const DEFAULT_START_NODE_ID_TECH = "t1";
