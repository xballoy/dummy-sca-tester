# dummy-sca-tester

A deliberately vulnerable fixture repository for comparing SCA tools (FOSSA, Snyk, and others).

**This repository intentionally depends on packages with known CVEs and copyleft licenses.
Do not install it, run it, or use it as a template for real work.**

The point is not only *which CVEs* a tool finds, but *which code paths it takes* to find them.
Tools diverge far more on project discovery, dependency-scope classification, and version-range
resolution than on advisory data. Each directory below isolates one of those axes.

[`EXPECTED-FINDINGS.md`](EXPECTED-FINDINGS.md) records what this fixture actually contains,
generated from `osv-scanner` and `trivy` plus registry license metadata. Treat it as a reference
point rather than a pass/fail key: a tool reporting something different may simply scope dev
dependencies, resolve ranges, or walk parent POMs differently, and those differences are the
thing being measured.

## What each directory tests

| Directory | Axis under test |
|---|---|
| `npm-workspaces/` | Monorepo discovery: does the tool find all 4 workspace packages, or roll them into one project? |
| `npm-workspaces/packages/reachable/` | Reachability: vulnerable APIs are genuinely invoked |
| `npm-workspaces/packages/unused/` | Reachability: vulnerable packages declared but their vulnerable APIs are never called |
| `npm-workspaces/packages/dev-only/` | Scope: vulnerable packages confined to `devDependencies` |
| `npm-workspaces/packages/licenses/` | Copyleft, dual-license and unresolvable-license handling |
| `npm-no-lockfile/` | Range resolution: same packages as caret ranges, no lockfile committed |
| `python-pip/` | `requirements.txt` parsing, prod vs `requirements-dev.txt` split |
| `python-poetry/` | `poetry.lock` parsing and Poetry dependency groups |
| `java-maven/` | Maven `compile` vs `test` scope, plus AGPL/GPL artifacts |
| `go-app/` | Go module graph, direct vs indirect requirements |
| `go-superseded/` | Fixes that exist only under a renamed successor module |
| `docker/` | Container scanning: OS-level CVEs from an EOL base image |

## Axis details

### Reachability

`packages/reachable/index.js` calls `lodash.template()`, `ejs.render()` and `minimist()` directly.
`packages/unused/index.js` requires `handlebars` but only touches `escapeExpression`, and declares
`axios` and `tar` without importing them at all. A tool doing call-graph analysis should rank these
differently; a manifest-only tool will report them identically.

### Lockfile vs no lockfile

`npm-workspaces/` commits `package-lock.json` with exact pins. `npm-no-lockfile/` declares the same
packages as caret ranges and its lockfile is gitignored. Whether a tool resolves to the
lowest-satisfying version (vulnerable) or the latest (clean) is the thing being measured.

### Dependency scope

Vulnerable packages appear in `devDependencies` (`packages/dev-only/`),
`requirements-dev.txt` (`python-pip/`), the Poetry `dev` group (`python-poetry/`), and Maven
`<scope>test</scope>` (`java-maven/`). Tools differ on whether these are reported by default.

### Fixes that live in a successor package

`go-superseded/` depends on `github.com/docker/docker v27.1.1+incompatible`. Moby moved its code to
`github.com/moby/moby/v2`, and the last `docker/docker` release (`v28.5.2+incompatible`,
2025-11-05) predates most advisories now filed against it. For 5 of its 6 advisory groups,
including CVE-2026-34040, OSV lists no fixed version for `github.com/docker/docker`. The only fix
is a `github.com/moby/moby/v2` release. No upgrade can close them; only a migration can.

The thing being measured is how a tool phrases that. "No fix available" is wrong. "Upgrade to
2.0.0-beta.8" is wrong too, because that version does not exist for the installed module. A tool
that gets this right says the fix needs a move to the successor module. It should still offer a
plain upgrade (to 28.0.0) for CVE-2025-54410, the one group with a fix in the same package.

`go-app/` has the opposite trap. `github.com/dgrijalva/jwt-go` is superseded by
`github.com/golang-jwt/jwt`, but its advisory names a fix in `github.com/dgrijalva/jwt-go/v4`
instead. A tool that treats any module named in the advisory as the successor will recommend
the wrong one.

### Licenses

Copyleft and ambiguous licenses are concentrated in `packages/licenses/`, `python-pip/`, and
`java-maven/`, covering GPL, LGPL, AGPL, an SPDX dual-license expression, and a package whose
license field is unresolvable text rather than an SPDX identifier.

npm is overwhelmingly MIT/ISC, so the Python and Maven projects carry most of the license signal.

## Notes

- `gopkg.in/yaml.v3` is used rather than `yaml.v2` because Go's minimal version selection promotes
  `yaml.v2` past its last vulnerable release once `gin` is in the graph.
- `requests` is pinned to `2.25.1` rather than an older release because earlier versions cap
  `urllib3` below the pinned `1.26.4` and the resolution genuinely fails.
- Lockfiles were generated without installing packages. Reachability analysis in some tools
  requires installed artifacts; install the relevant ecosystem on demand if a tool reports no
  reachability data.
- No CI workflows and no tool-specific config (`.fossa.yml`, `.snyk`) are committed, so that no
  tool gets discovery hints the others do not.
