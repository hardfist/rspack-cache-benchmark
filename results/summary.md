## Latest CI result

- Canary: `@rspack-canary/core@2.2.2-canary-45fd8a3a-20260829001855`
- PR commit: [`45fd8a3a`](https://github.com/web-infra-dev/rspack/commit/45fd8a3aadd9a7b18101b5bcb946c07b98869738)
- Runner: GitHub Actions, `linux-x64`, Node v22.23.2, 4 logical CPUs
- Generated: 2026-08-31T03:52:55.737Z
- Aggregation: median of 3 isolated seed/restore rounds; lower is better
- Compiled modules: 10,894

| Cache configuration | Seed build | Restore build | Warm-start saving | Restore vs legacy | Cache size | Size vs legacy | Restore peak RSS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| legacy_cache | 93042 ms | 991 ms | 98.9% | baseline | 718.4 MiB | baseline | 3680 MiB |
| new_cache: module=true, loader=false | 96313 ms | 2743 ms | 97.2% | +176.8% | 174.8 MiB | -75.7% | 4604 MiB |
| new_cache: module=false, loader=true | 92635 ms | 6264 ms | 93.2% | +532.1% | 217.1 MiB | -69.8% | 3993 MiB |

Fixture: 10,000 generated ESM modules × 200 lines, fanout 5, up to 20 named ESM specifier dependencies per module (199,940 total), plus react, react-dom, lodash-es, core-js, json5, acorn, @swc/helpers. Generated modules pass through `babel-loader` → `builtin:swc-loader`. Minification is disabled; `cheap-module-source-map` is enabled.
