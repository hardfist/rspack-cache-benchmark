## Latest CI result

- Canary: `@rspack-canary/core@2.2.2-canary-45fd8a3a-20260829001855`
- PR commit: [`45fd8a3a`](https://github.com/web-infra-dev/rspack/commit/45fd8a3aadd9a7b18101b5bcb946c07b98869738)
- Runner: GitHub Actions, `linux-x64`, Node v22.23.2, 4 logical CPUs
- Generated: 2026-08-29T13:44:26.729Z
- Aggregation: median of 3 isolated seed/restore rounds; lower is better
- Compiled modules: 10,894

| Cache configuration | Seed build | Restore build | Restore vs legacy | Cache size | Size vs legacy | Restore peak RSS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| legacy_cache | 91229 ms | 1148 ms | baseline | 718.4 MiB | baseline | 3531 MiB |
| new_cache: module=true, loader=false | 87465 ms | 2698 ms | +135.0% | 174.8 MiB | -75.7% | 3735 MiB |
| new_cache: module=false, loader=true | 94212 ms | 6127 ms | +433.8% | 217.1 MiB | -69.8% | 4171 MiB |

Fixture: 10,000 generated ESM modules × 200 lines, fanout 5, up to 20 named ESM specifier dependencies per module (199,940 total), plus react, react-dom, lodash-es, core-js, json5, acorn, @swc/helpers. Generated modules pass through `babel-loader` → `builtin:swc-loader`. Minification is disabled; `cheap-module-source-map` is enabled.
