/**
 * Inventiv DataViz – multi-widget test entry.
 * Registers all widgets for browser testing (no Power BI host).
 */

import powerbi from "powerbi-visuals-api";
import { Visual as LegalEntitiesGraphVisual } from "../src/visual";

// Expose Power BI API (same as host)
(window as any).powerbi = powerbi;
(window as any).powerbi.visuals = (window as any).powerbi.visuals || {};
(window as any).powerbi.visuals.plugins = (window as any).powerbi.visuals.plugins || {};

// Widget: Legal Entities Graph
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

(window as any).inventivLegalEntitiesGraph_DEBUG = inventivLegalEntitiesGraph;
(window as any).inventivLegalEntitiesGraph = inventivLegalEntitiesGraph;
(window as any).powerbi.visuals.plugins["inventivLegalEntitiesGraph"] = inventivLegalEntitiesGraph;
