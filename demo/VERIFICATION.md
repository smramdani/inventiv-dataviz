# Demo verification

Manual checks and debug tips for the demo app. **For automated tests**, see **[../tests/README.md](../tests/README.md)** — run `npm run test:e2e` from the repo root (18 E2E scenarios).

---

## Expected console logs (Debug level)

Open DevTools (F12) → Console. Enable “Verbose” or “Debug” to see `console.debug` messages.

### On loading “Legal Entities Graph”

1. `[Inventiv DataViz] LegalEntities render 1 nodes initial` — first render, 1 node visible (closed/grey).
2. `[Inventiv DataViz] renderGraph: start 1 nodes` — engine starts.
3. `[Inventiv DataViz] scheduleLayoutChange: debounce` — may appear after first `zoom.transform` (zoom restore).
4. `[Inventiv DataViz] renderGraph: done 1 nodes` — render complete.
5. (Optional, ~400 ms later) `[Inventiv DataViz] onLayoutChange: fire` — layout persistence triggered.

### On node click (expand)

1. `[Inventiv DataViz] LegalEntities render N nodes expand:<nodeId>` — re-render with N nodes (e.g. 5), expanded node.
2. `[Inventiv DataViz] renderGraph: start N nodes`
3. `[Inventiv DataViz] renderGraph: done N nodes`

The graph and + / − / Fit buttons should remain visible. No red errors in the console.

### What indicates a problem

- **Error** `Cannot access 'layoutChangeTimeout' before initialization` → rebuild required.
- **Error** `persistProperties` / `undefined` → old code without `host?.persistProperties` guard.
- Graph disappears on click → check for exceptions (stack trace in console).

## Quick checklist

- [ ] One node visible on load, **grey** (closed).
- [ ] Click node → node opens (open color), neighbors appear.
- [ ] Graph and + / − / Fit buttons **remain visible** after click.
- [ ] No (red) errors in console.
- [ ] `[Inventiv DataViz]` logs appear as above (with Debug level enabled).
