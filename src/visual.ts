"use strict";

import * as d3 from "d3";
import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import {
  renderGraph,
  buildLegalEntitiesGraphData,
  DEFAULT_GRAPH_CONFIG,
  type GraphEngineHandle,
  type LegalEntitiesGraph,
  type LayoutState,
} from "./graph";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;

import { VisualFormattingSettingsModel } from "./settings";

/** Parse Power BI DataView table rows into LegalEntitiesGraph. Rows: [from, to, shares] or extended [from, to, shares, fromLabel, toLabel, fromType, toType]. */
function parseDataViewToLegalEntitiesGraph(dataView: powerbi.DataView): LegalEntitiesGraph {
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
  private host: powerbi.extensibility.visual.IVisualHost;
  private formattingSettings: VisualFormattingSettingsModel;
  private formattingSettingsService: FormattingSettingsService;
  private fullGraph: LegalEntitiesGraph;
  private visibleNodeIds: Set<string>;
  private openedNodeIds: Set<string> = new Set();
  private engineHandle: GraphEngineHandle | null = null;
  private lastPositions = new Map<string, { x: number; y: number; fx?: number | null; fy?: number | null }>();
  private lastZoomTransform: ReturnType<GraphEngineHandle["getZoomTransform"]> | undefined;

  constructor(options?: VisualConstructorOptions) {
    if (!options?.element) throw new Error("Visual requires constructor options");
    this.host = options.host;
    this.formattingSettingsService = new FormattingSettingsService();
    this.target = options.element;
    this.fullGraph = { nodes: [], links: [] };
    this.visibleNodeIds = new Set();
    this.formattingSettings = new VisualFormattingSettingsModel();
  }

  public update(options: VisualUpdateOptions): void {
    const dataView = options.dataViews?.[0];
    if (dataView) {
      this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
        VisualFormattingSettingsModel,
        dataView
      );
      const parsed = parseDataViewToLegalEntitiesGraph(dataView);
      if (parsed.nodes.length > 0 || parsed.links.length > 0) {
        this.fullGraph = parsed;
        const layoutState = this.readLayoutState(dataView);
        if (layoutState) {
          if (layoutState.visibleNodeIds?.length)
            this.visibleNodeIds = new Set(layoutState.visibleNodeIds);
          if (layoutState.openedNodeIds?.length)
            this.openedNodeIds = new Set(layoutState.openedNodeIds);
          this.lastPositions = new Map(
            Object.entries(layoutState.positions).map(([id, p]) => [id, { x: p.x, y: p.y, fx: p.fx, fy: p.fy }])
          );
          if (layoutState.zoom) {
            const z = layoutState.zoom;
            this.lastZoomTransform = d3.zoomIdentity.translate(z.x, z.y).scale(z.k);
          }
        } else if (this.visibleNodeIds.size === 0 && this.openedNodeIds.size === 0 && this.fullGraph.nodes.length > 0) {
          const startId = this.fullGraph.nodes[0].id;
          this.visibleNodeIds = new Set([startId]);
          // Keep openedNodeIds empty so the start node is shown gray (closed) until the user clicks it
          this.openedNodeIds = new Set();
        }
      }
    }
    this.render(undefined);
  }

  private readLayoutState(dataView: powerbi.DataView): LayoutState | null {
    try {
      const objects = (dataView.metadata as { objects?: Record<string, { layoutState?: string }> })?.objects;
      const raw = objects?.explore?.layoutState;
      if (typeof raw !== "string") return null;
      const state = JSON.parse(raw) as LayoutState;
      if (state?.positions && state?.zoom) return state;
    } catch {
      /* ignore */
    }
    return null;
  }

  private getNeighborIds(nodeId: string): Set<string> {
    const out = new Set<string>();
    for (const l of this.fullGraph.links) {
      if (l.source === nodeId) out.add(l.target);
      if (l.target === nodeId) out.add(l.source);
    }
    return out;
  }

  /** Nodes that are opened by click OR have all their incident edges already visible (no new nodes would appear). */
  private getEffectiveOpenedNodeIds(): Set<string> {
    const effective = new Set(this.openedNodeIds);
    for (const node of this.fullGraph.nodes) {
      if (!this.visibleNodeIds.has(node.id)) continue;
      const incidentLinks = this.fullGraph.links.filter((l) => l.source === node.id || l.target === node.id);
      const allNeighborsVisible = incidentLinks.every((l) => {
        const other = l.source === node.id ? l.target : l.source;
        return this.visibleNodeIds.has(other);
      });
      if (incidentLinks.length === 0 || allNeighborsVisible) effective.add(node.id);
    }
    return effective;
  }

  private openNode(nodeId: string): void {
    this.openedNodeIds.add(nodeId);
    const neighbors = this.getNeighborIds(nodeId);
    neighbors.forEach((id) => this.visibleNodeIds.add(id));
    this.visibleNodeIds.add(nodeId);
    this.render(nodeId);
  }

  private openAll(): void {
    this.fullGraph.nodes.forEach((n) => {
      this.visibleNodeIds.add(n.id);
      this.openedNodeIds.add(n.id);
    });
    this.render();
  }

  private closeAll(): void {
    const startId = this.fullGraph.nodes.length > 0 ? this.fullGraph.nodes[0].id : "";
    this.visibleNodeIds = new Set(startId ? [startId] : []);
    this.openedNodeIds = new Set();
    this.render();
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

    // Capture zoom and positions from current engine before destroying (so canvas does not jump on expand).
    // Do not clear target here: destroy() already removes the SVG/toolbar; clearing (e.g. textContent = "")
    // can cause the host to replace the container and make the new graph invisible.
    if (this.engineHandle) {
      this.lastPositions = this.engineHandle.getLastPositions();
      this.lastZoomTransform = this.engineHandle.getZoomTransform();
      this.engineHandle.destroy();
      this.engineHandle = null;
    }

    this.target.style.display = "";

    const self = this;
    this.engineHandle = renderGraph(this.target, graphData, DEFAULT_GRAPH_CONFIG, {
      openedNodeIds: this.getEffectiveOpenedNodeIds(),
      onNodeClick: (id) => this.openNode(id),
      onOpenAll: () => this.openAll(),
      onCloseAll: () => this.closeAll(),
      showInfoCard: true,
      expandFromNodeId,
      lastPositions: this.lastPositions,
      initialZoomTransform: this.lastZoomTransform,
      onLayoutChange(state) {
        const full: LayoutState = {
          ...state,
          visibleNodeIds: Array.from(self.visibleNodeIds),
          openedNodeIds: Array.from(self.openedNodeIds),
        };
        if (self.host?.persistProperties) {
          self.host.persistProperties({
            merge: [
              { objectName: "explore", properties: { layoutState: JSON.stringify(full) }, selector: {} },
            ],
          });
        }
      },
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
