# Plan: persist node positions and layout

**Goal:** Avoid re-opening, moving and reorganizing nodes after refresh, reload or reopen. Restore positions, zoom/pan and (for Legal Entities) which nodes were expanded.

**Status:** Implemented (Phases A–D). Engine exposes `getLayoutState()` and accepts `initialLayoutState` / `onLayoutChange`; web API supports `layoutKey` (localStorage) and callbacks; Legal Entities persist visible/opened; Power BI persists via visual property `explore.layoutState`.

---

## 1. State to persist

| What | Used by | Notes |
|------|---------|--------|
| **Node positions** | Engine | `Map<nodeId, { x, y, fx?, fy? }>` — already from `getLastPositions()` |
| **Zoom/pan** | Engine | `{ k, x, y }` — already from `getZoomTransform()` |
| **Visible node ids** | Legal Entities only | Which nodes are shown (expand state) |
| **Opened node ids** | Legal Entities only | Which nodes are “open” for styling |

Optional: a **data fingerprint** (e.g. hash of node/link ids or row count) to avoid restoring a layout from different data.

**Serializable shape** (for storage / Power BI):

```ts
interface LayoutState {
  positions: Record<string, { x: number; y: number; fx?: number | null; fy?: number | null }>;
  zoom: { k: number; x: number; y: number };
  // Legal Entities only:
  visibleNodeIds?: string[];
  openedNodeIds?: string[];
  // Optional: only restore if data matches
  dataFingerprint?: string;
}
```

---

## 2. When to save

- **After layout changes:** on simulation “end” (e.g. `simulation.on("end", …)`) and after drag end.
- **After zoom/pan:** on zoom “end” (debounced, e.g. 300–500 ms).
- **After expand/collapse (Legal Entities):** when `visibleNodeIds` / `openedNodeIds` change (e.g. after `openNode` and render).

Use **debounce** (e.g. 300 ms) so we don’t persist on every tick.

---

## 3. Where to persist

| Context | Storage | Key / identifier |
|--------|---------|-------------------|
| **Web (default)** | `localStorage` | e.g. `inventiv-dataviz-layout-${graphId}`. `graphId` = option from app or hash of container id / URL. |
| **Web (optional)** | Callbacks only | App provides `onLayoutChange(state)` and `getInitialLayout(): LayoutState | undefined`. App stores in backend, URL, etc. |
| **Power BI** | Visual properties | Persist `LayoutState` (JSON) in a property that Power BI saves with the report (e.g. format pane or custom object). |

Prefer **pluggable persistence**: engine (or wrapper) exposes “current layout state” and “restore this state”; the **caller** (or an optional built-in adapter) decides where it’s stored (localStorage, API, Power BI properties).

---

## 4. When to restore

- **First render** (or after data load): if a saved `LayoutState` exists and is valid for current data:
  - Pass `lastPositions` and `initialZoomTransform` from state (already supported).
  - For Legal Entities: initialize `visibleNodeIds` and `openedNodeIds` from state so the graph opens with the same expansion.
- **Validation:** if `dataFingerprint` is used, restore only when it matches current data; otherwise optionally restore only positions for nodes that still exist (drop stale ids).

---

## 5. Implementation phases

### Phase A – Engine: layout state in/out (no persistence)

- Add **`getLayoutState(): LayoutState`** on the engine handle (positions + zoom). No persistence yet.
- Support **restore from `LayoutState`**: we already have `lastPositions` and `initialZoomTransform` in `GraphEngineRenderOptions`; ensure we can pass a full `LayoutState` (positions + zoom) and use it on first render.
- **Deliverable:** any caller can call `getLayoutState()`, store it somewhere, and later pass it back into render options to restore.

### Phase B – Web API: optional localStorage + callbacks

- **Options** for `createGenericGraph` / `createLegalEntitiesGraph`:
  - `layoutKey?: string` — if set, save/restore to `localStorage` under `inventiv-dataviz-layout-${layoutKey}`.
  - `onLayoutChange?: (state: LayoutState) => void` — called when layout changes (debounced); app can persist elsewhere.
  - `initialLayoutState?: LayoutState` — restore from this instead of localStorage when provided.
- On create: if `layoutKey` and no `initialLayoutState`, try `localStorage.getItem(...)` and parse; if valid, use as `initialLayoutState`. For Legal Entities, restore `visibleNodeIds` and `openedNodeIds` from state before first render.
- On layout/zoom/expand change (debounced): if `layoutKey`, write to localStorage; if `onLayoutChange`, call it with current state.
- **Deliverable:** web apps can use `layoutKey` for simple persistence, or use only callbacks for custom storage.

### Phase C – Legal Entities: persist expansion state

- Include **`visibleNodeIds`** and **`openedNodeIds`** in `LayoutState` (arrays).
- When restoring: if state has these arrays, pass them into the Legal Entities visual / web wrapper so the first render uses them instead of “only start node”.
- **Power BI:** in `update()`, read persisted layout from a visual property; in `render()`, apply it (positions + zoom + visible/opened). On layout change, write back to the same property (Power BI will persist with the report).
- **Deliverable:** Legal Entities graph restores both positions/zoom and which nodes were opened.

### Phase D – Power BI: persist in report

- Add a **persistent property** (e.g. JSON string) to the Legal Entities visual to store `LayoutState`.
- On **update**: if property has value, parse and use for `lastPositions`, `initialZoomTransform`, `visibleNodeIds`, `openedNodeIds`.
- On **layout change**: serialize current state and write to the property (via the Power BI API so it’s saved with the report).
- **Deliverable:** reopening the report or the browser restores the same layout and expansion.

---

## 6. Summary

| Phase | Scope | Result |
|-------|--------|--------|
| **A** | Engine | `getLayoutState()` + restore via existing options (positions + zoom). |
| **B** | Web | Optional `layoutKey` (localStorage) and `onLayoutChange` / `initialLayoutState`. |
| **C** | Legal Entities | Persist/restore `visibleNodeIds` + `openedNodeIds` in state. |
| **D** | Power BI | Store/load `LayoutState` in a visual property so it’s saved with the report. |

Persistence is **pluggable**: the engine only produces/consumes `LayoutState`; the web layer can add localStorage or callbacks; Power BI uses its own property storage. No redundancy, minimal surface.
