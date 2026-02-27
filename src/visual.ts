"use strict";

import powerbi from "powerbi-visuals-api";
import { FormattingSettingsService } from "powerbi-visuals-utils-formattingmodel";
import * as d3 from "d3";
import "./../style/visual.less";
import {
    getFakeGraph,
    DEFAULT_START_NODE_ID,
    FullGraph,
    GraphNode,
    GraphLink,
  } from "./fakeGraphData";

import VisualConstructorOptions = powerbi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbi.extensibility.visual.IVisual;

import { VisualFormattingSettingsModel } from "./settings";

type D3Node = GraphNode & {
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number | null;
  fy?: number | null;
};
type D3Link = {
  source: D3Node;
  target: D3Node;
  shares: number;
  /** Draw from this node (shareholder when applicable) */
  fromNode: D3Node;
  /** Draw to this node (entity when applicable); arrow points here */
  toNode: D3Node;
  /** Share percentage of total shares for toNode (0–100) */
  sharePct?: number;
};

export class Visual implements IVisual {
  private target: HTMLElement;
  private formattingSettings: VisualFormattingSettingsModel;
  private formattingSettingsService: FormattingSettingsService;
  private fullGraph: FullGraph;
  private visibleNodeIds: Set<string>;
  /** Nodes the user has clicked to expand (Legal Entities "open"); others are "closed" */
  private openedNodeIds: Set<string> = new Set();
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private simulation: d3.Simulation<D3Node, D3Link> | null = null;
  private justDragged = false;
  /** Preserve node positions when expanding so the graph is not scrambled */
  private lastPositions = new Map<string, { x: number; y: number; fx?: number | null; fy?: number | null }>();
  /** Zoom/pan state so we can restore it on re-render and drive toolbar actions */
  private zoomTransform: d3.ZoomTransform = d3.zoomIdentity;
  private zoomBehavior: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;

  constructor(options?: VisualConstructorOptions) {
    if (!options?.element) throw new Error("Visual requires constructor options");
    this.formattingSettingsService = new FormattingSettingsService();
    this.target = options.element;
    this.fullGraph = getFakeGraph();
    this.visibleNodeIds = new Set([DEFAULT_START_NODE_ID]);
    this.openedNodeIds = new Set([DEFAULT_START_NODE_ID]); // entry node starts "open" (blue)
    this.formattingSettings = new VisualFormattingSettingsModel();
  }

  public update(options: VisualUpdateOptions): void {
    if (options.dataViews && options.dataViews[0]) {
      this.formattingSettings = this.formattingSettingsService.populateFormattingSettingsModel(
        VisualFormattingSettingsModel,
        options.dataViews[0]
      );
    }
    this.render(undefined);
  }

  private getVisibleGraph(): { nodes: D3Node[]; links: GraphLink[] } {
    const nodes = this.fullGraph.nodes.filter((n) => this.visibleNodeIds.has(n.id));
    const links = this.fullGraph.links.filter(
      (l) => this.visibleNodeIds.has(l.source) && this.visibleNodeIds.has(l.target)
    );
    return { nodes: [...nodes], links };
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

  /** Node radius: Persons = small, Legal Entities = big */
  private getNodeRadius(d: D3Node): number {
    return d.type === "Shareholder" ? 12 : 22;
  }

  /** Node fill: Person closed = dark grey; Person open = green; Entity closed = light grey; Entity open = blue */
  private getNodeFill(d: D3Node): string {
    const open = this.openedNodeIds.has(d.id);
    if (d.type === "Shareholder") return open ? "#5cb85c" : "#5a5a5a"; // Person open=green, closed=dark grey
    return open ? "#4a90d9" : "#bdbdbd"; // Entity open=blue, closed=light grey
  }

  /** Closed fill for open animation (gray → open color) */
  private getNodeClosedFill(d: D3Node): string {
    if (d.type === "Shareholder") return "#5a5a5a"; // Person closed
    return "#bdbdbd"; // Entity closed
  }

  private render(expandFromNodeId?: string): void {
    const { nodes, links } = this.getVisibleGraph();
    if (nodes.length === 0) return;

    const width = this.target.clientWidth || 400;
    const height = this.target.clientHeight || 400;
    d3.select(this.target).style("position", "relative");

    // Save current positions before tearing down so we can preserve them
    if (this.simulation) {
      for (const n of this.simulation.nodes()) {
        const id = (n as D3Node).id;
        this.lastPositions.set(id, {
          x: (n as D3Node).x ?? 0,
          y: (n as D3Node).y ?? 0,
          fx: (n as D3Node).fx,
          fy: (n as D3Node).fy,
        });
      }
    }

    d3.select(this.target).selectAll("*").remove();

    if (nodes.length === 1) {
      const hint = d3.select(this.target).append("div").attr("class", "explore-hint").style("position", "absolute").style("left", "8px").style("top", "8px").style("font-size", "12px").style("color", "#666").style("pointer-events", "none");
      hint.text("Click the node to explore connections →");
    }

    const svg = d3
      .select(this.target)
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height]);

    const g = svg.append("g").attr("class", "zoom-layer");

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("start", () => svg.style("cursor", "grabbing"))
      .on("end", () => svg.style("cursor", "grab"))
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
        this.zoomTransform = event.transform;
      });
    svg.style("cursor", "grab").call(zoom);
    if (this.zoomTransform !== d3.zoomIdentity) {
      svg.call(zoom.transform, this.zoomTransform);
      g.attr("transform", this.zoomTransform);
    }
    this.zoomBehavior = zoom;

    // Arrow marker: shareholder → entity
    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 10)
      .attr("refY", 0)
      .attr("markerWidth", 8)
      .attr("markerHeight", 8)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-4L10,0L0,4")
      .attr("fill", "#666");

    const idToNode = new Map<string, D3Node>();
    nodes.forEach((n) => idToNode.set(n.id, { ...n }));

    const d3Nodes: D3Node[] = Array.from(idToNode.values());

    // --- Displacement logic: stable and consistent ---
    // 1) Restore and fix ALL existing nodes (once displayed, they never move unless the user drags)
    const refPos = expandFromNodeId ? this.lastPositions.get(expandFromNodeId) : undefined;
    const newNodes: D3Node[] = [];
    for (const d of d3Nodes) {
      const prev = this.lastPositions.get(d.id);
      if (prev) {
        d.x = prev.x;
        d.y = prev.y;
        d.fx = prev.fx !== undefined && prev.fx !== null ? prev.fx : prev.x;
        d.fy = prev.fy !== undefined && prev.fy !== null ? prev.fy : prev.y;
      } else {
        newNodes.push(d);
      }
    }

    // 2) Place new nodes in an even circle around the parent with enough distance to avoid overlap
    const placeRadius = 100;
    const numNew = newNodes.length;
    for (let i = 0; i < numNew; i++) {
      const d = newNodes[i];
      const x0 = refPos?.x ?? width / 2;
      const y0 = refPos?.y ?? height / 2;
      const angle = numNew === 1 ? 0 : (2 * Math.PI * i) / numNew;
      d.x = x0 + placeRadius * Math.cos(angle);
      d.y = y0 + placeRadius * Math.sin(angle);
      // Fix new nodes immediately so the simulation never moves them (no dynamic drift)
      d.fx = d.x;
      d.fy = d.y;
    }

    // 3) Ensure expand-from node (parent) is fixed so it never drifts from new children
    if (expandFromNodeId) {
      const parent = d3Nodes.find((n) => n.id === expandFromNodeId);
      if (parent) {
        parent.fx = parent.x ?? width / 2;
        parent.fy = parent.y ?? height / 2;
      }
    }

    const d3Links: D3Link[] = links
      .filter((l) => idToNode.has(l.source) && idToNode.has(l.target))
      .map((l) => {
        const source = idToNode.get(l.source)!;
        const target = idToNode.get(l.target)!;
        // Arrow points to entity: shareholder → entity. Else keep source → target.
        const isEntityShareholder =
          (source.type === "Entity" && target.type === "Shareholder") ||
          (source.type === "Shareholder" && target.type === "Entity");
        const fromNode = isEntityShareholder
          ? source.type === "Shareholder"
            ? source
            : target
          : source;
        const toNode = isEntityShareholder
          ? target.type === "Entity"
            ? target
            : source
          : target;
        return { source, target, shares: l.shares, fromNode, toNode };
      });

    // Share % = this link's shares / total shares for the target entity (full graph, so % is correct when entity is closed)
    const fullTotalSharesByTarget = new Map<string, number>();
    for (const l of this.fullGraph.links) {
      fullTotalSharesByTarget.set(l.target, (fullTotalSharesByTarget.get(l.target) ?? 0) + l.shares);
    }
    for (const l of d3Links) {
      const total = fullTotalSharesByTarget.get(l.toNode.id) ?? 1;
      l.sharePct = total > 0 ? (l.shares / total) * 100 : 0;
    }

    const simulation = d3
      .forceSimulation<D3Node>(d3Nodes)
      .force(
        "link",
        d3
          .forceLink<D3Node, D3Link>(d3Links)
          .id((d) => (d as D3Node).id)
          .distance(65)
          .strength(1)
      )
      .force(
        "charge",
        d3
          .forceManyBody<D3Node>()
          .strength(-45)
          .distanceMax(180)
          .distanceMin(24)
      )
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide<D3Node>().radius((d) => this.getNodeRadius(d) + 4))
      .force("x", d3.forceX(width / 2).strength(0.15))
      .force("y", d3.forceY(height / 2).strength(0.15));

    // When expanding, all nodes are already fixed → run a couple of ticks to draw then stop (no drift)
    if (expandFromNodeId) simulation.alpha(0.02);

    const linkGroup = g.append("g").attr("class", "links");
    const link = linkGroup
      .selectAll("line")
      .data(d3Links)
      .join("line")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
      .attr("stroke-width", (d) => Math.min(4, 1 + (d.shares || 0) / 2000))
      .attr("marker-end", "url(#arrow)");
    const linkLabel = linkGroup
      .selectAll("g.link-label")
      .data(d3Links)
      .join("g")
      .attr("class", "link-label")
      .attr("pointer-events", "none");
    linkLabel
      .append("rect")
      .attr("x", -14)
      .attr("y", -7)
      .attr("width", 28)
      .attr("height", 14)
      .attr("rx", 2)
      .attr("fill", "white")
      .attr("stroke", "#bbb");
    linkLabel
      .append("text")
      .attr("font-size", 9)
      .attr("fill", "#333")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .text((d) => (d.sharePct != null ? `${d.sharePct.toFixed(0)}%` : ""));

    const node = g
      .append("g")
      .attr("class", "nodes")
      .selectAll("g")
      .data(d3Nodes)
      .join("g")
      .attr("cursor", "grab")
      .call(
        d3
          .drag<SVGGElement, D3Node>()
          .on("start", (event, d) => {
            event.sourceEvent.stopPropagation();
            this.justDragged = false;
            // Fix all nodes so only the dragged one moves (siblings stay put)
            for (const n of d3Nodes) {
              n.fx = n.x ?? 0;
              n.fy = n.y ?? 0;
            }
            node.filter((n) => n === d).style("cursor", "grabbing");
            if (!event.active) simulation.alphaTarget(0.3).restart();
          })
          .on("drag", (event, d) => {
            this.justDragged = true;
            // Only the dragged node moves; others stay fixed (fx,fy set on start)
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            node.filter((n) => n === d).style("cursor", null);
            if (!event.active) simulation.alphaTarget(0);
            d.fx = event.x;
            d.fy = event.y;
            // Keep all other nodes fixed (they already have fx,fy from start)
          })
      )
      .on("click", (event, d) => {
        if (this.justDragged) return;
        this.openNode(d.id);
      });

    const circle = node
      .append("circle")
      .attr("r", (d) => this.getNodeRadius(d))
      .attr("fill", (d) => this.getNodeFill(d))
      .attr("stroke", "#fff")
      .attr("stroke-width", 2);

    // Open animation: node we just clicked transitions from closed color → open color
    if (expandFromNodeId) {
      circle
        .filter((d) => d.id === expandFromNodeId)
        .attr("fill", (d) => this.getNodeClosedFill(d))
        .transition()
        .duration(280)
        .attr("fill", (d) => this.getNodeFill(d));
    }

    node
      .append("text")
      .text((d) => d.label)
      .attr("font-size", (d) => (this.getNodeRadius(d) <= 14 ? 9 : 10))
      .attr("dx", (d) => this.getNodeRadius(d) + 2)
      .attr("dy", 4)
      .attr("fill", "#333")
      .clone(true)
      .lower()
      .attr("stroke", "#fff")
      .attr("stroke-width", 3);

    simulation.on("tick", () => {
      const visual = this;
      link.each(function (this: SVGLineElement, d: D3Link) {
        const x1 = d.fromNode.x ?? 0;
        const y1 = d.fromNode.y ?? 0;
        let x2 = d.toNode.x ?? 0;
        let y2 = d.toNode.y ?? 0;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const toRadius = visual.getNodeRadius(d.toNode);
        x2 -= (dx / len) * toRadius;
        y2 -= (dy / len) * toRadius;
        d3.select<SVGLineElement, D3Link>(this).attr("x1", x1).attr("y1", y1).attr("x2", x2).attr("y2", y2);
      });
      const labelOffsetFromEntity = 50;
      linkLabel.each(function (this: SVGGElement, d: D3Link) {
        const x1 = d.fromNode.x ?? 0;
        const y1 = d.fromNode.y ?? 0;
        let x2 = d.toNode.x ?? 0;
        let y2 = d.toNode.y ?? 0;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.hypot(dx, dy) || 1;
        const toRadius = visual.getNodeRadius(d.toNode);
        x2 -= (dx / len) * toRadius;
        y2 -= (dy / len) * toRadius;
        const labelX = x2 + ((x1 - x2) / len) * labelOffsetFromEntity;
        const labelY = y2 + ((y1 - y2) / len) * labelOffsetFromEntity;
        d3.select<SVGGElement, D3Link>(this).attr("transform", `translate(${labelX},${labelY})`);
      });
      node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
      // Keep lastPositions up to date so next expand preserves layout
      for (const d of d3Nodes) {
        this.lastPositions.set(d.id, {
          x: d.x ?? 0,
          y: d.y ?? 0,
          fx: d.fx,
          fy: d.fy,
        });
      }
    });

    this.svg = svg;
    this.simulation = simulation;
    this.addZoomToolbar(width, height);
  }

  private addZoomToolbar(width: number, height: number): void {
    const container = d3.select(this.target);
    let toolbar = container.select<HTMLDivElement>("div.zoom-toolbar");
    if (toolbar.empty()) {
      toolbar = container
        .append("div")
        .attr("class", "zoom-toolbar")
        .style("position", "absolute")
        .style("top", "8px")
        .style("right", "8px")
        .style("display", "flex")
        .style("gap", "4px")
        .style("z-index", "10");
      toolbar
        .append("button")
        .attr("type", "button")
        .attr("title", "Zoom in")
        .text("+")
        .on("click", () => {
          if (this.svg && this.zoomBehavior) this.svg.call(this.zoomBehavior.scaleBy, 1.3);
        });
      toolbar
        .append("button")
        .attr("type", "button")
        .attr("title", "Zoom out")
        .text("−")
        .on("click", () => {
          if (this.svg && this.zoomBehavior) this.svg.call(this.zoomBehavior.scaleBy, 1 / 1.3);
        });
      toolbar
        .append("button")
        .attr("type", "button")
        .attr("title", "Fit graph")
        .text("Fit")
        .on("click", () => this.fitGraph(width, height));
    }
  }

  private fitGraph(width: number, height: number): void {
    if (!this.svg || !this.zoomBehavior) return;
    const nodes = this.simulation?.nodes() as D3Node[] | undefined;
    const padding = 50;
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    if (nodes && nodes.length > 0) {
      for (const d of nodes) {
        const r = this.getNodeRadius(d);
        const x = d.x ?? 0;
        const y = d.y ?? 0;
        minX = Math.min(minX, x - r);
        maxX = Math.max(maxX, x + r);
        minY = Math.min(minY, y - r);
        maxY = Math.max(maxY, y + r);
      }
    } else {
      const margin = 25;
      this.lastPositions.forEach((pos) => {
        minX = Math.min(minX, pos.x - margin);
        maxX = Math.max(maxX, pos.x + margin);
        minY = Math.min(minY, pos.y - margin);
        maxY = Math.max(maxY, pos.y + margin);
      });
      if (minX === Infinity) return;
    }
    const boxW = maxX - minX || 1;
    const boxH = maxY - minY || 1;
    const scale = Math.min(
      (width - 2 * padding) / boxW,
      (height - 2 * padding) / boxH,
      4
    );
    const k = Math.max(0.2, scale);
    const tx = width / 2 - k * (minX + maxX) / 2;
    const ty = height / 2 - k * (minY + maxY) / 2;
    const t = d3.zoomIdentity.translate(tx, ty).scale(k);
    this.zoomTransform = t;
    this.svg.call(this.zoomBehavior.transform, t);
    this.svg.select("g.zoom-layer").attr("transform", t);
  }

  public getFormattingModel(): powerbi.visuals.FormattingModel {
    return this.formattingSettingsService.buildFormattingModel(this.formattingSettings);
  }

  public destroy(): void {
    this.simulation?.stop();
    this.svg?.remove();
  }
}
