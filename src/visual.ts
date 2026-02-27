"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import {
  renderGraph,
  buildLegalEntitiesGraphData,
  DEFAULT_GRAPH_CONFIG,
  type GraphEngineHandle,
  type LegacyFullGraph,
} from "./graph";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;

import { VisualFormattingSettingsModel } from "./settings";

/** Parse Power BI DataView table rows into LegacyFullGraph. Rows: [from, to, shares] or extended [from, to, shares, fromLabel, toLabel, fromType, toType]. */
function parseDataViewToLegacyGraph(dataView: powerbi.DataView): LegacyFullGraph {
  const rows = dataView.table?.rows ?? [];
  const nodeMap = new Map<string, { id: string; label: string; type: "Entity" | "Shareholder" }>();
  const links: { source: string; target: string; shares: number }[] = [];

  for (const row of rows) {
    const sourceId = String(row[0] ?? "").trim();
    const targetId = String(row[1] ?? "").trim();
    if (!sourceId || !targetId) continue;

    const shares = typeof row[2] === "number" && Number.isFinite(row[2]) ? row[2] : 0;
    const hasExtended = row.length >= 7;

    if (!nodeMap.has(sourceId)) {
      nodeMap.set(sourceId, {
        id: sourceId,
        label: hasExtended ? String(row[3] ?? sourceId).trim() : sourceId,
        type: hasExtended && (row[5] === "Shareholder" || row[5] === "shareholder") ? "Shareholder" : "Entity",
      });
    }
    if (!nodeMap.has(targetId)) {
      nodeMap.set(targetId, {
        id: targetId,
        label: hasExtended ? String(row[4] ?? targetId).trim() : targetId,
        type: hasExtended && (row[6] === "Shareholder" || row[6] === "shareholder") ? "Shareholder" : "Entity",
      });
    }
    links.push({ source: sourceId, target: targetId, shares });
  }

  return {
    nodes: Array.from(nodeMap.values()),
    links,
  };
}

export class Visual implements IVisual {
  private target: HTMLElement;
  private formattingSettings: VisualFormattingSettingsModel;
  private formattingSettingsService: FormattingSettingsService;
  private fullGraph: LegacyFullGraph;
  private visibleNodeIds: Set<string>;
  private openedNodeIds: Set<string> = new Set();
  private engineHandle: GraphEngineHandle | null = null;
  private lastPositions = new Map<string, { x: number; y: number; fx?: number | null; fy?: number | null }>();
  private lastZoomTransform: ReturnType<GraphEngineHandle["getZoomTransform"]> | undefined;

  constructor(options?: VisualConstructorOptions) {
    if (!options?.element) throw new Error("Visual requires constructor options");
    this.formattingSettingsService = new FormattingSettingsService();
    this.target = options.element;
    this.fullGraph = { nodes: [], links: [] };
    this.visibleNodeIds = new Set();
    this.formattingSettings = new VisualFormattingSettingsModel();
  }

  public update(options: VisualUpdateOptions): void {
    if (options.dataViews && options.dataViews[0]) {
      this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
        VisualFormattingSettingsModel,
        options.dataViews[0]
      );
      const parsed = parseDataViewToLegacyGraph(options.dataViews[0]);
      if (parsed.nodes.length > 0 || parsed.links.length > 0) {
        this.fullGraph = parsed;
        if (this.visibleNodeIds.size === 0 && this.openedNodeIds.size === 0 && this.fullGraph.nodes.length > 0) {
          const startId = this.fullGraph.nodes[0].id;
          this.visibleNodeIds = new Set([startId]);
          this.openedNodeIds = new Set([startId]);
        }
      }
    }
    this.render(undefined);
  }

  private getNeighborIds(nodeId: string): Set<string> {
    const out = new Set<string>();
    for (const l of this.fullGraph.links) {
      if (l.source === nodeId) out.add(l.target);
      if (l.target === nodeId) out.add(l.source);
    }
    return out;
  }

  private openNode(nodeId: string): void {
    this.openedNodeIds.add(nodeId);
    const neighbors = this.getNeighborIds(nodeId);
    neighbors.forEach((id) => this.visibleNodeIds.add(id));
    this.visibleNodeIds.add(nodeId);
    this.render(nodeId);
  }

  private render(expandFromNodeId?: string): void {
    const graphData = buildLegalEntitiesGraphData(this.fullGraph, this.visibleNodeIds);

    if (graphData.nodes.length === 0) {
      if (this.engineHandle) {
        this.engineHandle.destroy();
        this.engineHandle = null;
      }
      this.target.innerHTML = "";
      this.target.style.display = "flex";
      this.target.style.alignItems = "center";
      this.target.style.justifyContent = "center";
      this.target.style.color = "#666";
      this.target.style.fontSize = "14px";
      this.target.textContent = "Add From (Entity/Shareholder), To (Entity/Shareholder), and Number of Shares to draw the graph.";
      return;
    }

    // Capture zoom and positions from current engine before clearing or destroying (so canvas does not jump on expand)
    if (this.engineHandle) {
      this.lastPositions = this.engineHandle.getLastPositions();
      this.lastZoomTransform = this.engineHandle.getZoomTransform();
      this.engineHandle.destroy();
      this.engineHandle = null;
    }

    this.target.textContent = "";
    this.target.style.display = "";

    this.engineHandle = renderGraph(this.target, graphData, DEFAULT_GRAPH_CONFIG, {
      openedNodeIds: this.openedNodeIds,
      onNodeClick: (id) => this.openNode(id),
      expandFromNodeId,
      lastPositions: this.lastPositions,
      initialZoomTransform: this.lastZoomTransform,
    });
  }

  public getFormattingModel(): powerbi.visuals.FormattingModel {
    return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
  }

  public destroy(): void {
    this.engineHandle?.destroy();
    this.engineHandle = null;
  }
}
