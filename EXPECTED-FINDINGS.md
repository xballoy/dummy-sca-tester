# Expected findings

Baseline of what this fixture contains, generated from `osv-scanner` 2.5.0 and `trivy`, with
license data read directly from the npm registry, PyPI JSON API, and Maven Central POMs.

This is a **reference point, not a pass/fail key.** A tool reporting something different is not
automatically wrong — it may scope dev dependencies differently, resolve ranges differently, or
walk parent POMs differently. Those differences are the thing being measured.

Counts are advisories, not distinct root causes: one CVE often appears under several IDs
(CVE / GHSA / GO / BIT), and the numbers below are deduplicated to one entry per advisory group.
They will drift upward over time as new advisories are published against these pinned versions.

Generated 2026-08-13.

## Summary

| Source | Vulnerable packages | Advisories |
|---|---|---|
| `java-maven/pom.xml` | 9 | 83 |
| `npm-workspaces/package-lock.json` | 9 | 71 |
| `python-poetry/poetry.lock` | 8 | 58 |
| `python-pip/requirements-dev.txt` | 7 | 57 |
| `python-pip/requirements.txt` | 6 | 53 |
| `go-app/go.mod` | 5 | 8 |
| `docker/` image (`alpine 3.12.1` OS layer) | 8 | 48 |
| `docker/` image (Node's bundled npm) | 20 | 58 |
| `npm-no-lockfile/` | — | not scannable without a lockfile |

Roughly 330 advisories across the source manifests, plus 106 in the container image.

`npm-no-lockfile/` produced **zero** findings under `osv-scanner`, which refuses to scan a bare
`package.json`. Whether a tool reports nothing here, resolves the caret ranges to latest (clean),
or resolves to lowest-satisfying (vulnerable) is one of the sharper differentiators in this repo.

## Vulnerabilities

Severity is the highest CVSS in the group, as reported by OSV.

### `java-maven/pom.xml`

| Package | Version | Advisories | Max severity | Headline |
|---|---|---|---|---|
| org.apache.logging.log4j:log4j-core | 2.14.1 | 7 | Critical 10.0 | CVE-2021-44228 Log4Shell RCE |
| com.fasterxml.jackson.core:jackson-databind | 2.9.9 | 54 | Critical 9.8 | CVE-2020-8840 deserialization |
| commons-fileupload:commons-fileupload | 1.3.2 | 3 | Critical 9.8 | CVE-2016-1000031 RCE |
| org.springframework:spring-web | 5.3.20 | 6 | Critical 9.8 | CVE-2016-1000027 unsafe deserialization |
| mysql:mysql-connector-java | 8.0.28 | 1 | High 8.9 | CVE-2023-22102 |
| com.fasterxml.jackson.core:jackson-core † | 2.9.9 | 3 | High 8.7 | CVE-2025-52999 |
| com.google.protobuf:protobuf-java † | 3.11.4 | 5 | High 8.7 | CVE-2024-7254 DoS |
| commons-io:commons-io † | 2.2 | 2 | High 8.7 | CVE-2024-47554 DoS |
| org.springframework:spring-core † | 5.3.20 | 2 | High 7.5 | CVE-2025-41249 |

† transitive. `commons-fileupload` is declared `<scope>test</scope>` — tools that filter test scope
by default should omit it and its 3 advisories.

### `npm-workspaces/package-lock.json`

| Package | Version | Advisories | Max severity | Headline | Workspace |
|---|---|---|---|---|---|
| ejs | 3.1.6 | 2 | Critical 9.8 | CVE-2022-29078 template injection RCE | reachable |
| handlebars | 4.7.6 | 10 | Critical 9.8 | CVE-2026-33937 JS injection | unused |
| minimist | 1.2.0 | 2 | Critical 9.8 | CVE-2021-44906 prototype pollution | reachable |
| shell-quote | 1.7.2 | 3 | Critical 9.8 | CVE-2021-42740 command injection | dev-only |
| tar | 6.1.0 | 18 | Critical 9.2 | CVE-2026-59873 DoS | unused |
| axios | 0.21.0 | 25 | High 8.6 | CVE-2026-44492 proxy bypass | unused |
| lodash | 4.17.15 | 4 | High 8.1 | CVE-2021-23337 command injection | reachable |
| serialize-javascript | 2.1.2 | 2 | High 8.1 | GHSA-5c6j-r48x-rmvq RCE | dev-only |
| marked | 0.3.6 | 5 | High 7.5 | CVE-2022-21681 ReDoS | dev-only |

Scope and reachability expectations:

- **dev-only** (`shell-quote`, `serialize-javascript`, `marked` — 10 advisories) sits in
  `devDependencies`. Snyk excludes dev dependencies by default; FOSSA classifies scope itself.
- **reachable** (`ejs`, `lodash`, `minimist`) has its vulnerable APIs genuinely invoked in
  `packages/reachable/index.js`.
- **unused** (`axios`, `tar` — 43 advisories) is declared but never imported. `handlebars` is
  imported but only `escapeExpression` is called, never the vulnerable compile path.

A manifest-only tool reports reachable and unused identically. A call-graph tool should not.

### `python-pip/` and `python-poetry/`

| Package | Version | Advisories | Max severity | Headline |
|---|---|---|---|---|
| django | 3.2.4 | 32 | Critical 9.8 | CVE-2021-35042 SQL injection |
| pyyaml | 5.3.1 | 1 | Critical 9.8 | CVE-2020-14343 arbitrary code execution |
| urllib3 | 1.26.4 | 9 | High 8.9 | CVE-2025-66471 |
| flask ‡ | 0.12.2 | 4 | High 8.7 | CVE-2018-1000656 |
| jinja2 | 2.11.2 | 5 | High 7.8 | CVE-2024-56326 sandbox breakout |
| idna † | 2.9.0 / 2.10 | 2 | High 7.5 | CVE-2024-3651 |
| click † | 8.1.8 | 1 | High 7.2 | CVE-2026-7246 (poetry.lock only) |
| requests | 2.25.1 | 4 | Medium 6.1 | CVE-2023-32681 proxy auth leak |

† transitive. ‡ dev-scoped: `requirements-dev.txt` in the pip project, the `dev` group in Poetry.

The two Python projects are **not** identical dependency sets. `python-poetry/` omits `psycopg2`
and `PyQt5` because Poetry needs `pg_config` to build their metadata. Do not read the difference
between the two as tool disagreement.

### `go-app/go.mod`

| Package | Version | Advisories | Max severity | Headline |
|---|---|---|---|---|
| github.com/gogo/protobuf | 1.3.1 | 1 | High 8.6 | CVE-2021-3121 |
| github.com/dgrijalva/jwt-go | 3.2.0+incompatible | 1 | High 7.5 | CVE-2020-26160 auth bypass |
| gopkg.in/yaml.v3 | 3.0.0-20210107192922 | 1 | High 7.5 | CVE-2022-28948 |
| github.com/gin-gonic/gin | 1.6.3 | 3 | High 7.1 | CVE-2020-28483 request smuggling |
| golang.org/x/sys † | 0.0.0-20200116001909 | 2 | Medium 5.3 | CVE-2022-29526 |

Go yields far fewer advisories than the other ecosystems because the Go vulnerability database is
curated to symbol-level reachability rather than listing every version-range match.

### `docker/` container image

`node:14.15.0-alpine3.12`, an EOL base:

- **OS layer (alpine 3.12.1): 48 CVEs** — 4 critical, 32 high, 10 medium, 2 low.
  Concentrated in `libcrypto1.1`/`libssl1.1` (9 each), `busybox` and `ssl_client` (12 each),
  `apk-tools`, `zlib`, `musl`.
- **Node's bundled npm: 58 CVEs** — 5 critical, 35 high, 15 medium, 3 low, including `tar` (18),
  `brace-expansion` (5), `minimatch` (4), `form-data` (2), `minimist` (2).

The bundled-npm findings are a good discriminator: they come from inside the image, not from any
manifest in this repo. Tools that only scan the OS package database will miss all 58.

## License findings

Every license below was read from the authoritative source (npm registry, PyPI JSON API, Maven
Central POM), not inferred.

Whether any of these is an actual *problem* depends on a policy you have not set yet. The column
below is why each one commonly trips a default policy.

### Strong copyleft — the ones that usually fail a policy outright

| Package | Ecosystem | License | Why it is flagged |
|---|---|---|---|
| `com.itextpdf:itext7-core` 7.2.5 | Maven | **AGPL-3.0** | Strongest copyleft in normal use. The network clause extends source-disclosure obligations to users who reach the software **over a network**, so merely running it in a SaaS backend — never shipping a binary — can trigger it. Nearly always denied by default policy. iText sells a commercial license precisely to escape this. |
| `PyQt5` 5.15.11 | PyPI | **GPL-3.0** | Distributing a work that links PyQt5 obliges you to release the whole combined work under GPL-3.0. Also dual-licensed commercially by Riverbank. |
| `Unidecode` 1.4.0 | PyPI | **GPL-2.0-or-later** | Same viral obligation on distribution. Notable because it is a small utility that arrives as an innocuous transitive dependency. |
| `ffmpeg-static` 5.3.0 | npm | **GPL-3.0-or-later** | Ships prebuilt FFmpeg binaries under GPL. Rare on npm and easy to miss, since the ecosystem is otherwise almost entirely permissive. |

### Weak copyleft — file-level or linking-exception obligations

| Package | Ecosystem | License | Why it is flagged |
|---|---|---|---|
| `mysql:mysql-connector-java` 8.0.28 | Maven | **GPL-2.0 with FOSS exception** | GPL-2.0 with a carve-out permitting use from certain OSS licenses. The exception is non-standard text, so tools disagree: some report plain GPL-2.0 and fail the build, others recognise the exception and pass. A good disagreement case. |
| `psycopg2` 2.9.12 | PyPI | **LGPL-3.0 with exceptions** | Obligations attach to modifying the library itself, not to using it, but many default policies flag any `*GPL*` string regardless. |
| `pyqt5-qt5` 5.15.19 | PyPI | **LGPL-3.0** | Transitive from PyQt5. Tests whether the tool resolves licenses for indirect dependencies. |
| `certifi` | PyPI | **MPL-2.0** | File-level copyleft; modified MPL files must stay MPL. Usually allowed, but strict policies flag it. Arrives transitively via `requests` and is a common false-positive source. |

### Ambiguous, dual, or missing — the metadata-resolution tests

| Package | Ecosystem | Declared value | Why it is flagged |
|---|---|---|---|
| `jszip` 3.10.1 | npm | `(MIT OR GPL-3.0-or-later)` | A valid SPDX **OR** expression: you may choose MIT. Correct behaviour is to pick MIT and pass. A tool that flags this as GPL is mishandling SPDX disjunction — a false positive. |
| `text-unidecode` 1.3 | PyPI | `Artistic License` + GPL classifiers | Dual Artistic-1.0/GPL, expressed inconsistently: the `license` field says Artistic, the classifiers say GPL. Tools that read only one field reach opposite conclusions. |
| `handsontable` 18.0.0 | npm | `SEE LICENSE IN LICENSE.txt` | Not an SPDX identifier. Resolving it requires reading the file, which is a non-free commercial license. Expect "unknown"/"unresolved", or a correct commercial-license flag from a tool that inspects contents. |
| `parse-cache-control` 1.0.1 | npm | **absent** | No `license` field at all. Legally this is *more* restrictive than copyleft — no grant means no rights — yet it often scores as low-risk "unknown". Arrived incidentally as a transitive of `ffmpeg-static`; it was not planted. |

### Parent-POM inheritance

These Maven artifacts declare **no license in their own POM** and require walking the parent chain:

| Artifact | Parent hops | Resolved license |
|---|---|---|
| `log4j-core` 2.14.1 | 3 | Apache-2.0 |
| `jackson-databind` 2.9.9 | 3 | Apache-2.0 |
| `jackson-core` 2.9.9 | 3 | Apache-2.0 |
| `commons-fileupload` 1.3.2 | 2 | Apache-2.0 |
| `commons-io` 2.2 | 2 | Apache-2.0 |
| `protobuf-java` 3.11.4 | 1 | BSD-3-Clause |

All resolve to permissive licenses, so none should fail a policy. The test is whether a tool
reports "unknown" instead — that would mean it is not resolving parent POMs, which would also make
its copyleft detection unreliable elsewhere.

A similar trap exists in Python: `Jinja2`, `sqlparse`, `itsdangerous` and `colorama` leave the
`license` field empty and declare the license only via trove classifiers.

### No license issues expected

`go-app/` is entirely permissive (MIT / BSD-3-Clause / Apache-2.0). Go module metadata carries no
license field at all, so any tool reporting Go licenses is inferring them from file contents — and
a tool reporting *nothing* for Go is not necessarily failing.

## Caveats

- No packages were installed; only lockfiles were generated. Tools needing installed artifacts for
  reachability may report no reachability data.
- `mvn` is not installed on the machine that generated this, so Maven data came from POMs fetched
  directly from Central. Locally-run CLI scanners may produce a smaller Maven tree.
- Advisory counts grow over time. Regenerate with
  `osv-scanner scan source -r --format json .` and `trivy image <tag>` before comparing.
