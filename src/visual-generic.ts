"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import "./../style/visual.less";
import {
  renderGraph,
  mapInputToGraph,
  createRowBasedMapping,
  DEFAULT_GENERIC_GRAPH_CONFIG,
  type GraphEngineHandle,
  type GraphData,
} from "./graph";

import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;

const FormattingSettingsModel = formattingSettings.Model;

/** Format pane model for Generic Graph (minimal for now). */
class GenericGraphFormattingSettings extends FormattingSettingsModel {
  cards = [];
}

export class GenericGraphVisual implements IVisual {
  private target: HTMLElement;
  private formattingSettingsService: FormattingSettingsService;
  private engineHandle: GraphEngineHandle | null = null;
  private lastPositions = new Map<string, { x: number; y: number; fx?: number | null; fy?: number | null }>();

  constructor(options?: VisualConstructorOptions) {
    if (!options?.element) throw new Error("Visual requires constructor options");
    this.formattingSettingsService = new FormattingSettingsService();
    this.target = options.element;
  }

  public update(options: VisualUpdateOptions): void {
    let graphData: GraphData = { nodes: [], links: [] };

    if (options.dataViews && options.dataViews[0]?.table?.rows) {
      const rows = options.dataViews[0].table.rows;
      const rawRows = rows.map((row) => ({
        source: String(row[0] ?? ""),
        target: String(row[1] ?? ""),
        weight: typeof row[2] === "number" ? row[2] : 0,
      }));
      const mapping = createRowBasedMapping({
        sourceField: "source",
        targetField: "target",
        linkWeightField: "weight",
      });
      graphData = mapInputToGraph({ rows: rawRows }, { links: mapping.links });
    }

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
      this.target.textContent = "Add Source and Target fields to draw a graph.";
      return;
    }

    this.target.textContent = "";
    this.target.style.display = "";

    if (this.engineHandle) {
      this.lastPositions = this.engineHandle.getLastPositions();
      this.engineHandle.destroy();
      this.engineHandle = null;
    }

    this.engineHandle = renderGraph(this.target, graphData, DEFAULT_GENERIC_GRAPH_CONFIG, {
      lastPositions: this.lastPositions,
    });
  }

  public getFormattingModel(): powerbi.visuals.FormattingModel {
    return this.formattingSettingsService.buildFormattingModel(new GenericGraphFormattingSettings());
  }

  public destroy(): void {
    this.engineHandle?.destroy();
    this.engineHandle = null;
  }
}
