#!/usr/bin/env sh
# Usage: ./scripts/extract-changelog-for-release.sh 0.0.13
# Outputs the CHANGELOG section for that version (from ## [X.Y.Z] to the next ## [) to stdout.
# Used by .github/workflows/release.yml to create GitHub Release notes.

set -e
VERSION="$1"
if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version>" >&2
  echo "Example: $0 0.0.13" >&2
  exit 1
fi

CHANGELOG="${2:-CHANGELOG.md}"
if [ ! -f "$CHANGELOG" ]; then
  echo "File not found: $CHANGELOG" >&2
  exit 1
fi

# Escape dots in VERSION for literal match in sed (e.g. 0.0.13 -> 0\.0\.13)
VER_ESC=$(echo "$VERSION" | sed 's/\./\\./g')
# Print from "## [VERSION]" through the line before the next "## [" (exclude our header and next section header)
sed -n "/^## \[$VER_ESC\]/,/^## \[/p" "$CHANGELOG" | sed '1d;$d'
