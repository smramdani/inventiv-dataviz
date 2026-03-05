# TODO: Implementation of open-source expert recommendations

This checklist implements the recommendations from [OPEN_SOURCE_EXPERT_RECOMMENDATIONS.md](OPEN_SOURCE_EXPERT_RECOMMENDATIONS.md). Work through the phases in order for maximum impact; items can be done in parallel within a phase where marked.

---

## Phase 1 – Trust and first impression

**Goal:** Make the project look serious, clear, and welcoming at first glance.

- [ ] **1.1** Add a short **“Features”** or **“Why Inventiv DataViz?”** section in the README (after “What is this?”): bullet list (lightweight, no framework lock-in, Web + Power BI, customizable, open source, one div + one call).
- [ ] **1.2** Add **badges** at the top of the README:
  - [ ] License badge (e.g. `https://img.shields.io/badge/license-AGPL--3.0-blue`)
  - [ ] (After Phase 3) CI status badge from GitHub Actions workflow
  - [ ] Optional: version badge when using GitHub Releases
- [ ] **1.3** Add **“Support and community”** (or “Get help”) in README: “Questions? Open a [Discussion](link). Bugs? [Open an issue](link). Feature ideas? See [CONTRIBUTING](CONTRIBUTING.md).”
- [ ] **1.4** Add **compatibility** note: e.g. “Modern browsers (Chrome, Firefox, Safari, Edge). Power BI: Desktop/Service compatible with API 5.x.”
- [ ] **1.5** Add at least one **screenshot or GIF** of the demo (e.g. graph + info card) in the README to show the product at a glance.
- [ ] **1.6** Set GitHub repo **About**: short description, website (e.g. GitHub Pages demo URL), topics: `graph`, `dataviz`, `power-bi`, `d3`, `visualization`, `open-source`, `javascript`.

---

## Phase 2 – Contributing and community

**Goal:** Make it easy and safe to contribute, ask for help, and propose features.

- [ ] **2.1** Create **CONTRIBUTING.md** at repository root with:
  - [ ] How to clone, install, run tests (`npm run test:e2e`), run demo (`npm run demo`).
  - [ ] How to propose a feature (open an issue with label or use Discussions; describe use case).
  - [ ] How to submit a PR: branch naming (e.g. `feature/...`, `fix/...`), keep scope small, ensure tests pass and lint passes.
  - [ ] Code style: ESLint; link to existing config.
  - [ ] Link to CODE_OF_CONDUCT and SECURITY.
- [ ] **2.2** Add **CODE_OF_CONDUCT.md** (e.g. [Contributor Covenant](https://www.contributor-covenant.org/)); link from README and CONTRIBUTING.
- [ ] **2.3** Create **GitHub Issue templates** (`.github/ISSUE_TEMPLATE/`):
  - [ ] `bug_report.md`: environment, steps to reproduce, expected vs actual, screenshots if applicable.
  - [ ] `feature_request.md`: problem/use case, proposed solution, alternatives.
  - [ ] `documentation.md`: what’s missing or unclear, where (README, docs, code).
  - [ ] Optional: `config.yml` to guide user to choose template.
- [ ] **2.4** Create **Pull Request template** (`.github/PULL_REQUEST_TEMPLATE.md`): short description, checklist (tests run, docs updated if needed, CHANGELOG updated for user-facing changes).
- [ ] **2.5** In README, add **“Contributing”** section: “We welcome contributions. See [CONTRIBUTING.md](CONTRIBUTING.md). Have a feature idea? Open an issue with the ‘enhancement’ label or start a Discussion.”

---

## Phase 3 – Security and CI

**Goal:** Security policy and automated quality gates.

- [ ] **3.1** Add **SECURITY.md** at repository root: how to report a vulnerability (e.g. GitHub Security Advisories or private email); ask not to open public issues for security; expected response time (e.g. “we’ll acknowledge within 48h”).
- [ ] **3.2** Add **CI workflow** (e.g. `.github/workflows/ci.yml`):
  - [ ] On: `push` to main/master, `pull_request` to main/master.
  - [ ] Jobs: install with `npm ci`, run `npm run lint`, run `npm run test:e2e` (with suitable timeout and optionally Playwright install).
  - [ ] Document in CONTRIBUTING that PRs must pass CI.
- [ ] **3.3** (Optional) Add **dependency audit** step in CI: `npm audit --audit-level=high` (or document in CONTRIBUTING that maintainers run it before releases).

---

## Phase 4 – Releases and changelog

**Goal:** Clear versioning, release notes, and downloadable artifacts.

- [ ] **4.1** Create **CHANGELOG.md** at repository root (e.g. [Keep a Changelog](https://keepachangelog.com/) format):
  - [ ] Sections: Added, Changed, Fixed, Security.
  - [ ] Backfill last release (e.g. v0.0.10) with recent changes; then maintain for every release.
- [ ] **4.2** Document **versioning policy** in README or docs (e.g. SemVer: MAJOR.MINOR.PATCH; breaking → MAJOR, new features → MINOR, fixes → PATCH).
- [ ] **4.3** Use **GitHub Releases** for the current version:
  - [ ] Create tag `v0.0.10` (or next), create Release with copy-paste from CHANGELOG.
  - [ ] Attach built artifacts if useful: e.g. `inventiv-dataviz.js`, `inventiv-dataviz.esm.js`, `inventivLegalEntitiesGraph.*.pbiviz`.
- [ ] **4.4** (Optional) Add **release workflow** (e.g. `.github/workflows/release.yml`): on tag `v*`, build, upload artifacts, create/update GitHub Release. Reduces manual steps for future releases.

---

## Phase 5 – Discoverability and metadata

**Goal:** Better discovery on GitHub and (optionally) npm.

- [ ] **5.1** Update **package.json** with:
  - [ ] `"repository": { "type": "git", "url": "https://github.com/smramdani/inventiv-dataviz.git" }`
  - [ ] `"homepage": "https://github.com/smramdani/inventiv-dataviz#readme"` or demo URL
  - [ ] `"bugs": { "url": "https://github.com/smramdani/inventiv-dataviz/issues" }`
  - [ ] `"keywords": ["graph", "dataviz", "power-bi", "d3", "network", "visualization", "legal-entities", "shareholders"]`
  - [ ] `"author"` or `"contributors"` (name, optional email/URL).
- [ ] **5.2** In README or GETTING_STARTED, add **“Using without npm”**: e.g. download bundle from Latest Release, or use a CDN if you set one up.
- [ ] **5.3** (Optional) **Publish to npm**: decide package name (`inventiv-dataviz` or `@inventiv/dataviz`), add `files` in package.json, run `npm publish` (and document in CONTRIBUTING/README how to install via npm).

---

## Phase 6 – Documentation depth

**Goal:** API visibility, troubleshooting, and project health.

- [ ] **6.1** Add **“API overview”** (in README or docs): table or list of `createGenericGraph`, `createLegalEntitiesGraph` with main options (config, layoutKey, showInfoCard, infoCardContent, mapping, etc.) and one-line descriptions + links to CUSTOMIZATION/DATA_MAPPING.
- [ ] **6.2** Add **“Troubleshooting”** or **FAQ** (in docs or README): e.g. “Graph not rendering?” (container has size, script loaded), “Power BI visual blank?” (check data roles), “Layout not persisting?” (layoutKey, localStorage).
- [ ] **6.3** In **docs/README.md**, add link to **OPEN_SOURCE_EXPERT_RECOMMENDATIONS.md** and optionally a short **“Project health”** or **“Governance”** sentence (e.g. “Maintained by Inventiv; we welcome community input and PRs.”).

---

## Phase 7 – Roadmap and feature requests

**Goal:** Make feature requests and roadmap visible and structured.

- [ ] **7.1** In README or CONTRIBUTING, add **“Request a feature”**: open an issue with label `enhancement` (or use Discussions); describe use case; optional mockup or example.
- [ ] **7.2** Update **VISION_AND_ROADMAP.md** with a short **“Next priorities”** (e.g. Format pane for Generic Graph, npm publish, more widgets) and keep phase checkboxes accurate.
- [ ] **7.3** (Optional) Create GitHub **labels** for issues: e.g. `bug`, `enhancement`, `documentation`, `good first issue`, `help wanted`.
- [ ] **7.4** (Optional) Use **GitHub Discussions** for “Ideas” or “Q&A” and link from README.

---

## Phase 8 – Legal and polish

**Goal:** Compliance and final polish.

- [ ] **8.1** Check **third-party licenses** (e.g. D3): if they require attribution, add **NOTICE** or a “Third-party licenses” section in docs/README or a NOTICE file.
- [ ] **8.2** In **pbiviz.json** (or author), set **supportUrl** to a real support channel (e.g. GitHub issues URL or contact page).
- [ ] **8.3** (Optional) If “Inventiv” is a trademark, add a short **Trademark** or **Legal** note in README or a separate file.

---

## Summary table

| Phase | Focus                    | Key deliverables                                      |
|-------|--------------------------|--------------------------------------------------------|
| 1     | Trust & first impression | Features section, badges, support note, screenshot, About |
| 2     | Contributing & community | CONTRIBUTING, CODE_OF_CONDUCT, issue/PR templates     |
| 3     | Security & CI            | SECURITY.md, ci.yml (lint + test:e2e)                 |
| 4     | Releases & changelog     | CHANGELOG.md, versioning policy, GitHub Release       |
| 5     | Discoverability         | package.json metadata, “without npm”, optional npm     |
| 6     | Documentation depth      | API overview, Troubleshooting/FAQ, docs index link    |
| 7     | Roadmap & features       | “Request a feature”, next priorities, labels/Discussions |
| 8     | Legal & polish           | NOTICE if needed, supportUrl, optional trademark      |

---

**How to use this TODO:** Tick items as you complete them. You can open issues for each phase or item and link them here. Revisit the list when preparing a release or onboarding new maintainers.
