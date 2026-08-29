# Rspack persistent cache benchmark

[![Cache benchmark](https://github.com/hardfist/rspack-cache-benchmark/actions/workflows/benchmark.yml/badge.svg)](https://github.com/hardfist/rspack-cache-benchmark/actions/workflows/benchmark.yml)

Reproducible benchmark for [web-infra-dev/rspack#15380](https://github.com/web-infra-dev/rspack/pull/15380). It compares persistent-cache restore performance and on-disk cache size for:

| Case | `experiments.newCache` | Module cache | Loader cache | Other new caches |
| --- | --- | ---: | ---: | ---: |
| `legacy_cache` | `false` | legacy backend | legacy backend | legacy backend |
| `new_cache.module=true loader=false` | object | on | off | on |
| `new_cache.module=false loader=true` | object | off | on | on |

The fixture contains 10,000 generated ESM modules with exactly 200 lines each. The dependency graph is a forward DAG with fanout 5 and 4 named imports per edge, giving up to 20 ESM specifier dependencies per module. It also bundles React, React DOM, lodash-es, core-js, JSON5, Acorn, and `@swc/helpers`.

Generated modules run through `babel-loader` and then `builtin:swc-loader`; third-party packages remain on their normal package path. Builds use development mode, `cheap-module-source-map`, an in-memory output filesystem, and `optimization.minimize=false`. Each case gets an isolated filesystem cache and is measured once for cache seeding and once for restore. Case order rotates between rounds.

The dependency on `@rspack-canary/core` is pinned to the exact canary containing PR commit [`45fd8a3a`](https://github.com/web-infra-dev/rspack/commit/45fd8a3aadd9a7b18101b5bcb946c07b98869738). CI verifies the version/commit match before running.

<!-- BENCHMARK_RESULTS_START -->

## Latest CI result

Waiting for the first GitHub Actions run.

<!-- BENCHMARK_RESULTS_END -->

## Run locally

Node.js 22.12 or newer is required.

```bash
npm ci
npm run benchmark
```

Use environment variables such as `BENCH_ROUNDS`, `MODULE_COUNT`, `LINES_PER_MODULE`, `MODULE_FANOUT`, and `SPECIFIERS_PER_MODULE` for a smaller smoke run. Results are written to `results/latest.json` and `results/summary.md`.
