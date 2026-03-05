# Inventiv DataViz – Expert recommendations for a professional open-source project

This document provides an **expert analysis** of the project's documentation and architecture, with **actionable recommendations** to make Inventiv DataViz a trusted, professional open-source project that encourages worldwide adoption, contributions, support requests, and feature proposals.

---

## 1. Executive summary

**Current strengths**

- Clear technical docs (GETTING_STARTED, CUSTOMIZATION, DATA_MAPPING, VISION_AND_ROADMAP).
- Live demo and one-command quick start.
- E2E tests (18 scenarios) and CI-ready Playwright setup.
- Single engine for Web + Power BI, good separation (graph core, web API, visual).
- AGPL-3.0 license clearly stated.

**Gaps for a “serious, trusted” OSS project**

- No **contribution** or **community** guidelines (CONTRIBUTING, CODE_OF_CONDUCT).
- No **CHANGELOG** or release notes for users and integrators.
- No **security** policy (SECURITY.md) for responsible disclosure.
- **Discoverability**: package.json missing repository, homepage, keywords; no npm publish or badge strategy.
- **GitHub**: no issue/PR templates, no CI for lint/tests on PR, no release workflow.
- **Trust**: no clear support/contact, no compatibility/version policy, no “Who uses this”.
- **Onboarding**: no “Ways to contribute” or “Request a feature” path in the README.

The recommendations below address these gaps in a structured way.

---

## 2. Recommendations by category

### 2.1 Trust and first impression

| # | Recommendation | Why |
|---|----------------|-----|
| 2.1.1 | Add a short **“Why Inventiv DataViz?”** or **“Features”** section in the README (bullet list: lightweight, no framework lock-in, Web + Power BI, customizable, open source). | Helps visitors quickly see value and differentiation. |
| 2.1.2 | Add **badges** at the top of the README (license, build/tests if CI exists, version, optional “npm” when published). | Standard OSS signal of quality and activity. |
| 2.1.3 | Clarify **support and contact**: e.g. “Questions? Open a Discussion. Bugs? Open an Issue. Feature ideas? See CONTRIBUTING.” | Sets expectations and reduces “where do I ask?” friction. |
| 2.1.4 | Add a **browser / environment** compatibility note (e.g. modern browsers, Power BI Desktop version if relevant). | Reduces “it doesn’t work for me” without context. |

### 2.2 Contributing and community

| # | Recommendation | Why |
|---|----------------|-----|
| 2.2.1 | Create **CONTRIBUTING.md**: how to clone, install, run tests, run demo; how to propose a feature (issue template or discussion); how to submit a PR (branch naming, scope, tests); code style (ESLint). | Lowers the barrier for contributors and keeps PRs consistent. |
| 2.2.2 | Add **CODE_OF_CONDUCT.md** (e.g. Contributor Covenant) and link it from README and CONTRIBUTING. | Standard for inclusive, professional OSS and required by some organizations. |
| 2.2.3 | Create **GitHub Issue templates**: Bug report, Feature request, Documentation improvement (and optionally Question). | Guides users to provide the right information and shows the project is open to input. |
| 2.2.4 | Create a **Pull Request template** (description, checklist: tests, docs, CHANGELOG). | Ensures PRs are complete and reviewable. |
| 2.2.5 | In README, add a **“Contributing”** section: “We welcome contributions. See [CONTRIBUTING.md](CONTRIBUTING.md). Have a feature idea? Open an issue with the ‘feature’ label or start a Discussion.” | Makes contributing and feature requests visible and intentional. |

### 2.3 Security and safety

| # | Recommendation | Why |
|---|----------------|-----|
| 2.3.1 | Add **SECURITY.md**: how to report a vulnerability (e.g. open a private Security Advisory or email); no public issues for security bugs; expected response. | Builds trust and follows best practice (GitHub shows it in the “Security” tab). |
| 2.3.2 | Ensure **dependencies** are auditable (e.g. `npm audit` in CI or documented in CONTRIBUTING). | Shows awareness of supply-chain security. |

### 2.4 Releases and changelog

| # | Recommendation | Why |
|---|----------------|-----|
| 2.4.1 | Maintain a **CHANGELOG.md** (e.g. Keep a Changelog format): sections Added, Changed, Fixed, Security per version; link to releases. | Users and integrators can see what changed and when; essential for upgrades. |
| 2.4.2 | Use **GitHub Releases** for each version: tag (e.g. `v0.0.10`), release notes (copy from CHANGELOG), attach `.pbiviz` and/or web bundle if useful. | Single place for “current version” and binaries; improves trust. |
| 2.4.3 | Document **versioning policy** (e.g. SemVer: MAJOR.MINOR.PATCH; breaking in MAJOR, new features in MINOR). | Sets expectations for breaking changes and upgrades. |

### 2.5 CI/CD and quality

| # | Recommendation | Why |
|---|----------------|-----|
| 2.5.1 | Add a **CI workflow** (e.g. `.github/workflows/ci.yml`) on push/PR: `npm ci`, `npm run lint`, `npm run test:e2e` (with appropriate timeout/caching). | Every PR is tested; badge “build passing” increases confidence. |
| 2.5.2 | Optionally add a **release workflow**: on tag push `v*`, build artifacts, create GitHub Release, attach assets. | Automates releases and keeps them consistent. |
| 2.5.3 | In CONTRIBUTING, require that **new code is covered** by tests (or documented exceptions). | Prevents regressions and keeps quality high. |

### 2.6 Discoverability and distribution

| # | Recommendation | Why |
|---|----------------|-----|
| 2.6.1 | Complete **package.json** for npm (when you decide to publish): `repository`, `homepage`, `bugs`, `keywords` (e.g. `graph`, `dataviz`, `powerbi`, `d3`, `network`), `author` or `contributors`. | npm and GitHub use these for discovery and links; required for a serious npm package. |
| 2.6.2 | Add **repository** and **homepage** even if not publishing to npm yet (points to GitHub repo and optional GitHub Pages demo). | GitHub “About” and npm-style metadata improve discoverability. |
| 2.6.3 | Document **how to use the library** without npm (script tag from CDN or download from Releases). | Supports users who don’t use npm. |
| 2.6.4 | Consider **publishing to npm** as `inventiv-dataviz` (or scoped `@inventiv/dataviz`) with clear README and versioning. | Enables `npm install inventiv-dataviz` and wider adoption. |

### 2.7 Documentation

| # | Recommendation | Why |
|---|----------------|-----|
| 2.7.1 | Add an **“API overview”** or **“Reference”** section (in README or docs): main functions (`createGenericGraph`, `createLegalEntitiesGraph`), options object (config, layoutKey, showInfoCard, etc.) with one-line descriptions and links to CUSTOMIZATION/DATA_MAPPING. | Gives a single place to see the full API surface. |
| 2.7.2 | Add a **“Troubleshooting”** or **FAQ** (in docs or README): e.g. “Graph not rendering?” (container size, script load order), “Power BI visual blank?” (data roles), “Layout not persisting?” (layoutKey). | Reduces repeated support questions and builds trust. |
| 2.7.3 | In docs/README (index), add a link to **OPEN_SOURCE_EXPERT_RECOMMENDATIONS.md** (this file) and optionally a short **“Project health”** or **“Governance”** note (how decisions are made, who maintains). | Transparency and clarity for enterprises and contributors. |

### 2.8 Roadmap and feature requests

| # | Recommendation | Why |
|---|----------------|-----|
| 2.8.1 | In README or CONTRIBUTING, add **“Request a feature”**: open an issue with label `enhancement` or use Discussions; describe use case and optional mockup. | Encourages feature proposals and prioritization. |
| 2.8.2 | Keep **VISION_AND_ROADMAP.md** up to date with **phase status** and a short “Next priorities” (e.g. Format pane expansion, npm publish, more widgets). | Shows direction and invites feedback. |
| 2.8.3 | Optionally use **GitHub Projects** or a “Roadmap” section in the wiki for public prioritization. | Visual roadmap increases engagement. |

### 2.9 Legal and compliance

| # | Recommendation | Why |
|---|----------------|-----|
| 2.9.1 | Keep **LICENSE** file and README license line; ensure **NOTICE** or headers mention third-party licenses (e.g. D3) if required by their licenses. | Compliance and clarity for enterprises. |
| 2.9.2 | If you add **patent or trademark** clarity (e.g. “Inventiv” as trademark), add a short note in README or a separate file. | Avoids ambiguity for commercial use. |

### 2.10 Project metadata and polish

| # | Recommendation | Why |
|---|----------------|-----|
| 2.10.1 | Set GitHub repo **description** and **topics** (e.g. `graph`, `dataviz`, `power-bi`, `d3`, `visualization`, `open-source`). | Improves search and “Related projects”. |
| 2.10.2 | Add a **screenshot or short GIF** of the demo (or widgets) in the README. | First impression and clarity of what the project does. |
| 2.10.3 | In **pbiviz.json** (or author block), use a real or dedicated **support URL/email** (e.g. GitHub issues or a contact). | Power BI users need a clear support path. |

---

## 3. Priority overview

- **High (trust and onboarding):** CONTRIBUTING, CODE_OF_CONDUCT, SECURITY.md, README badges and “Contributing”/support section, CHANGELOG, GitHub About + package.json metadata.
- **Medium (quality and process):** CI workflow, Issue/PR templates, versioning policy, API overview/FAQ.
- **Lower (growth):** npm publish, release workflow, screenshot/GIF, roadmap visibility, NOTICE for deps.

---

## 4. Next step: TODO list

A structured, ambitious **TODO list** for implementing these recommendations is provided in **[OPEN_SOURCE_IMPLEMENTATION_TODO.md](OPEN_SOURCE_IMPLEMENTATION_TODO.md)**. It is organized by phase (Trust & first impression → Contributing & community → CI & releases → Discoverability → Documentation & roadmap) so the project can be improved incrementally while remaining professional and consistent.
