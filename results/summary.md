## Latest CI result

- Canary: `@rspack-canary/core@2.2.2-canary-9980571c-20260901115855`
- PR commit: [`9980571c`](https://github.com/web-infra-dev/rspack/commit/9980571cc2823e0d40a0898e1c705be41bc3d743)
- Runner: GitHub Actions, `linux-x64`, Node v22.23.2, 4 logical CPUs
- Generated: 2026-09-02T04:03:19.433Z
- Aggregation: median of 3 isolated seed/restore rounds; lower is better
- Compiled modules: 10,894

| Cache configuration | Seed build | Restore build | Warm-start saving | Restore vs legacy | Cache size | Size vs legacy | Restore peak RSS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| legacy_cache | 91525 ms | 1030 ms | 98.9% | baseline | 718.4 MiB | baseline | 3743 MiB |
| new_cache: module=true, loader=false | 94951 ms | 2380 ms | 97.5% | +131.0% | 164.6 MiB | -77.1% | 3967 MiB |
| new_cache: module=false, loader=true | 93890 ms | 6623 ms | 92.9% | +542.8% | 217.1 MiB | -69.8% | 4224 MiB |

Fixture: 10,000 generated ESM modules × 200 lines, fanout 5, up to 20 named ESM specifier dependencies per module (199,940 total), plus react, react-dom, lodash-es, core-js, json5, acorn, @swc/helpers. Generated modules pass through `babel-loader` → `builtin:swc-loader`. Minification is disabled; `cheap-module-source-map` is enabled.
