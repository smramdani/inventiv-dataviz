/**
 * Demo graph data – Legal Entities & Shareholders, Species, Sentence/POS.
 * Used only by the demo app; not part of the library or production package.
 * Legal entity names are anonymized or illustrative (fake data for known brands).
 * Legal Entities nodes include custom attributes for info cards: Personnes Physiques (First Name, Last Name, Age, City, Country), Personnes Morales (Company Name, Legal Form, Total Shares, City, Country).
 */

import type { LegalEntitiesGraph } from "../src/graph";

function entityNode(
  id: string,
  label: string,
  attrs: { companyName: string; legalForm: string; totalShares: number; city: string; country: string }
) {
  return {
    id,
    label,
    type: "Entity" as const,
    attributes: {
      "Company Name": attrs.companyName,
      "Legal Form": attrs.legalForm,
      "Total Shares": attrs.totalShares,
      City: attrs.city,
      Country: attrs.country,
    },
  };
}

function shareholderNode(
  id: string,
  label: string,
  attrs: { firstName: string; lastName: string; age: number; city: string; country: string }
) {
  return {
    id,
    label,
    type: "Shareholder" as const,
    attributes: {
      "First Name": attrs.firstName,
      "Last Name": attrs.lastName,
      Age: attrs.age,
      City: attrs.city,
      Country: attrs.country,
    },
  };
}

function link(source: string, target: string, shares: number) {
  return { source, target, shares };
}

/** Anonymized corporate structure (privacy-safe) with custom attributes for info cards. */
export function getFakeGraph(): LegalEntitiesGraph {
  const nodes: LegalEntitiesGraph["nodes"] = [
    entityNode("n1", "Global Holdings (France)", { companyName: "Global Holdings", legalForm: "SAS", totalShares: 10000, city: "Paris", country: "France" }),
    entityNode("n2", "Beta Holdings (UK)", { companyName: "Beta Holdings", legalForm: "Ltd", totalShares: 8000, city: "London", country: "United Kingdom" }),
    entityNode("n3", "Gamma Inc (USA)", { companyName: "Gamma Inc", legalForm: "Inc", totalShares: 15000, city: "New York", country: "USA" }),
    entityNode("n4", "Delta Ltd (Germany)", { companyName: "Delta GmbH", legalForm: "GmbH", totalShares: 12000, city: "Berlin", country: "Germany" }),
    entityNode("n5", "Epsilon SA (Luxembourg)", { companyName: "Epsilon SA", legalForm: "SA", totalShares: 5000, city: "Luxembourg", country: "Luxembourg" }),
    entityNode("n6", "Zeta Group (Netherlands)", { companyName: "Zeta Group", legalForm: "BV", totalShares: 9000, city: "Amsterdam", country: "Netherlands" }),
    entityNode("n7", "Sigma Ventures (Ireland)", { companyName: "Sigma Ventures", legalForm: "Ltd", totalShares: 6000, city: "Dublin", country: "Ireland" }),
    entityNode("n8", "Omega Partners (Switzerland)", { companyName: "Omega Partners", legalForm: "AG", totalShares: 11000, city: "Zurich", country: "Switzerland" }),
    shareholderNode("n9", "John Doe", { firstName: "John", lastName: "Doe", age: 45, city: "Paris", country: "France" }),
    shareholderNode("n10", "Jane Smith", { firstName: "Jane", lastName: "Smith", age: 38, city: "London", country: "United Kingdom" }),
    shareholderNode("n11", "Pierre Martin", { firstName: "Pierre", lastName: "Martin", age: 52, city: "Lyon", country: "France" }),
    shareholderNode("n12", "Anna Weber", { firstName: "Anna", lastName: "Weber", age: 41, city: "Munich", country: "Germany" }),
    shareholderNode("n13", "Thomas Brown", { firstName: "Thomas", lastName: "Brown", age: 34, city: "Boston", country: "USA" }),
    shareholderNode("n14", "Maria Garcia", { firstName: "Maria", lastName: "Garcia", age: 49, city: "Madrid", country: "Spain" }),
    shareholderNode("n15", "James Wilson", { firstName: "James", lastName: "Wilson", age: 56, city: "Edinburgh", country: "United Kingdom" }),
    shareholderNode("n16", "Alex Kerr", { firstName: "Alex", lastName: "Kerr", age: 29, city: "Dublin", country: "Ireland" }),
    shareholderNode("n17", "Sophie Dubois", { firstName: "Sophie", lastName: "Dubois", age: 43, city: "Brussels", country: "Belgium" }),
    shareholderNode("n18", "Michael Chen", { firstName: "Michael", lastName: "Chen", age: 37, city: "Singapore", country: "Singapore" }),
    shareholderNode("n19", "Emma Fischer", { firstName: "Emma", lastName: "Fischer", age: 31, city: "Vienna", country: "Austria" }),
    shareholderNode("n20", "David O'Brien", { firstName: "David", lastName: "O'Brien", age: 47, city: "Zurich", country: "Switzerland" }),
  ];

  const links: LegalEntitiesGraph["links"] = [
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

/** Fake tech / conglomerate structure (~30 nodes): Alphabet, Meta, Tesla, SpaceX, etc. With custom attributes for info cards. */
export function getFakeGraphTechCompanies(): LegalEntitiesGraph {
  const nodes: LegalEntitiesGraph["nodes"] = [
    entityNode("t1", "Alphabet Inc", { companyName: "Alphabet Inc", legalForm: "Inc", totalShares: 100000, city: "Mountain View", country: "USA" }),
    entityNode("t2", "Google LLC", { companyName: "Google LLC", legalForm: "LLC", totalShares: 80000, city: "Mountain View", country: "USA" }),
    entityNode("t3", "YouTube", { companyName: "YouTube LLC", legalForm: "LLC", totalShares: 50000, city: "San Bruno", country: "USA" }),
    entityNode("t4", "Waymo", { companyName: "Waymo LLC", legalForm: "LLC", totalShares: 15000, city: "Mountain View", country: "USA" }),
    entityNode("t5", "DeepMind", { companyName: "DeepMind", legalForm: "Ltd", totalShares: 12000, city: "London", country: "United Kingdom" }),
    entityNode("t6", "Meta Platforms", { companyName: "Meta Platforms Inc", legalForm: "Inc", totalShares: 95000, city: "Menlo Park", country: "USA" }),
    entityNode("t7", "Facebook", { companyName: "Facebook Inc", legalForm: "Inc", totalShares: 90000, city: "Menlo Park", country: "USA" }),
    entityNode("t8", "Instagram", { companyName: "Instagram LLC", legalForm: "LLC", totalShares: 40000, city: "Menlo Park", country: "USA" }),
    entityNode("t9", "WhatsApp", { companyName: "WhatsApp LLC", legalForm: "LLC", totalShares: 35000, city: "Menlo Park", country: "USA" }),
    entityNode("t10", "Tesla Inc", { companyName: "Tesla Inc", legalForm: "Inc", totalShares: 70000, city: "Austin", country: "USA" }),
    entityNode("t11", "SpaceX", { companyName: "SpaceX", legalForm: "Corp", totalShares: 25000, city: "Hawthorne", country: "USA" }),
    entityNode("t12", "Starlink", { companyName: "Starlink", legalForm: "LLC", totalShares: 10000, city: "Hawthorne", country: "USA" }),
    entityNode("t13", "The Boring Company", { companyName: "The Boring Company", legalForm: "LLC", totalShares: 5000, city: "Hawthorne", country: "USA" }),
    entityNode("t14", "Neuralink", { companyName: "Neuralink", legalForm: "Corp", totalShares: 8000, city: "Fremont", country: "USA" }),
    entityNode("t15", "X Corp", { companyName: "X Corp", legalForm: "Corp", totalShares: 20000, city: "San Francisco", country: "USA" }),
    shareholderNode("t16", "Larry Page", { firstName: "Larry", lastName: "Page", age: 51, city: "Palo Alto", country: "USA" }),
    shareholderNode("t17", "Sergey Brin", { firstName: "Sergey", lastName: "Brin", age: 50, city: "Los Altos", country: "USA" }),
    shareholderNode("t18", "Sundar Pichai", { firstName: "Sundar", lastName: "Pichai", age: 52, city: "Mountain View", country: "USA" }),
    shareholderNode("t19", "Mark Zuckerberg", { firstName: "Mark", lastName: "Zuckerberg", age: 40, city: "Palo Alto", country: "USA" }),
    shareholderNode("t20", "Elon Musk", { firstName: "Elon", lastName: "Musk", age: 53, city: "Austin", country: "USA" }),
    shareholderNode("t21", "Institutional Fund A", { firstName: "Institutional", lastName: "Fund A", age: 0, city: "New York", country: "USA" }),
    shareholderNode("t22", "Institutional Fund B", { firstName: "Institutional", lastName: "Fund B", age: 0, city: "Boston", country: "USA" }),
    entityNode("t23", "Verily", { companyName: "Verily Life Sciences", legalForm: "LLC", totalShares: 6000, city: "South San Francisco", country: "USA" }),
    entityNode("t24", "Reality Labs", { companyName: "Reality Labs", legalForm: "Division", totalShares: 7000, city: "Menlo Park", country: "USA" }),
    entityNode("t25", "SolarCity", { companyName: "SolarCity", legalForm: "Corp", totalShares: 14000, city: "San Mateo", country: "USA" }),
  ];

  const links: LegalEntitiesGraph["links"] = [
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
