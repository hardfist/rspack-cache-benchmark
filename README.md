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

- Canary: `@rspack-canary/core@2.2.3-canary-267e0cff-20260902085126`
- PR commit: [`267e0cff`](https://github.com/web-infra-dev/rspack/commit/267e0cfff9a7ad7ffdf4c6f622100f8d202c0046)
- Runner: GitHub Actions, `linux-x64`, Node v22.23.2, 4 logical CPUs
- Generated: 2026-09-02T09:36:29.156Z
- Aggregation: median of 3 isolated seed/restore rounds; lower is better
- Compiled modules: 10,894

| Cache configuration | Seed build | Restore build | Warm-start saving | Restore vs legacy | Cache size | Size vs legacy | Restore peak RSS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| legacy_cache | 96757 ms | 1029 ms | 98.9% | baseline | 718.4 MiB | baseline | 3586 MiB |
| new_cache: module=true, loader=false | 96016 ms | 2518 ms | 97.4% | +144.8% | 164.6 MiB | -77.1% | 4684 MiB |
| new_cache: module=false, loader=true | 96699 ms | 6768 ms | 93.0% | +557.9% | 217.1 MiB | -69.8% | 4213 MiB |

Fixture: 10,000 generated ESM modules × 200 lines, fanout 5, up to 20 named ESM specifier dependencies per module (199,940 total), plus react, react-dom, lodash-es, core-js, json5, acorn, @swc/helpers. Generated modules pass through `babel-loader` → `builtin:swc-loader`. Minification is disabled; `cheap-module-source-map` is enabled.

<!-- BENCHMARK_RESULTS_END -->

## Run locally

Node.js 22.12 or newer is required.

```bash
npm ci
npm run benchmark
```

Use environment variables such as `BENCH_ROUNDS`, `MODULE_COUNT`, `LINES_PER_MODULE`, `MODULE_FANOUT`, and `SPECIFIERS_PER_MODULE` for a smaller smoke run. Results are written to `results/latest.json` and `results/summary.md`.
