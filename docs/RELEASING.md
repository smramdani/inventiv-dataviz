# Releasing Inventiv DataViz

This document describes how to cut a new release so that the **GitHub Releases** page shows the correct “Latest” version and users see the right changelog. If you only push a tag without creating a **GitHub Release**, the repo will still show the previous published release as “Latest”.

---

## 1. Checklist (manual steps)

Before releasing version **X.Y.Z** (e.g. `0.0.13`):

- [ ] **CHANGELOG**: Move the content of `[Unreleased]` into a new section `## [X.Y.Z] - YYYY-MM-DD`. Set `[Unreleased]` to `_Nothing yet._` and update the compare links at the bottom (e.g. `[Unreleased]: .../compare/vX.Y.Z...HEAD`, `[X.Y.Z]: .../compare/vA.B.C...vX.Y.Z`).
- [ ] **package.json**: Set `"version": "X.Y.Z"`.
- [ ] **Commit and push**: e.g. `git add CHANGELOG.md package.json && git commit -m "chore: release X.Y.Z - ..." && git push origin main`.
- [ ] **Tag and push**: `git tag -a vX.Y.Z -m "Release X.Y.Z: ..." && git push origin vX.Y.Z`.

After the tag is pushed, the **automated workflow** (see below) creates the **GitHub Release** with notes extracted from `CHANGELOG.md`. No need to run `gh release create` by hand.

---

## 2. Automated: GitHub Release on tag push

When you push a tag **`v*`** (e.g. `v0.0.13`), the workflow [`.github/workflows/release.yml`](../.github/workflows/release.yml) runs and:

1. Checks out the repo at that tag.
2. Extracts from `CHANGELOG.md` the section for that version (e.g. `## [0.0.13]`).
3. Creates a **GitHub Release** for the tag with title `Release vX.Y.Z` and the extracted notes.

So the only thing you must do is: **update CHANGELOG + version, commit, push, then create and push the tag**. The “Publish release on GitHub” step is automatic.

---

## 3. Optional: create a release by hand

If the workflow did not run or you need to recreate a release:

```bash
# From repo root, after the tag exists
VERSION=0.0.13
sed -n "/^## \[$VERSION\]/,/^## \[/p" CHANGELOG.md | sed '1d;$d' > .release-notes.md
gh release create v$VERSION --title "Release v$VERSION" --notes-file .release-notes.md
rm .release-notes.md
```

Or use the GitHub UI: **Releases** → **Draft a new release** → choose tag `vX.Y.Z`, set title and paste the changelog section from `CHANGELOG.md`.

---

## 4. Version policy

We use [Semantic Versioning](https://semver.org/): **MAJOR.MINOR.PATCH**.

- **PATCH**: Bug fixes, docs, no API change.
- **MINOR**: New features, backward compatible.
- **MAJOR**: Breaking changes.

---

## 5. See also

- [CHANGELOG.md](../CHANGELOG.md) — version history (Keep a Changelog format).
- [OPEN_SOURCE_IMPLEMENTATION_TODO.md](OPEN_SOURCE_IMPLEMENTATION_TODO.md) — Phase 4 (releases and changelog).
