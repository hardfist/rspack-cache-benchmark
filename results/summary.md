## Latest CI result

- Canary: `@rspack-canary/core@2.2.2-canary-2deeb6cd-20260901081812`
- PR commit: [`2deeb6cd`](https://github.com/web-infra-dev/rspack/commit/2deeb6cdaebe6ff1ac273609fbb7a634b740a1a8)
- Runner: GitHub Actions, `linux-x64`, Node v22.23.2, 4 logical CPUs
- Generated: 2026-09-01T08:52:59.488Z
- Aggregation: median of 3 isolated seed/restore rounds; lower is better
- Compiled modules: 10,894

| Cache configuration | Seed build | Restore build | Warm-start saving | Restore vs legacy | Cache size | Size vs legacy | Restore peak RSS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| legacy_cache | 96148 ms | 1036 ms | 98.9% | baseline | 718.4 MiB | baseline | 3566 MiB |
| new_cache: module=true, loader=false | 97803 ms | 2511 ms | 97.4% | +142.5% | 164.6 MiB | -77.1% | 4679 MiB |
| new_cache: module=false, loader=true | 95403 ms | 6670 ms | 93.0% | +544.0% | 217.1 MiB | -69.8% | 3985 MiB |

Fixture: 10,000 generated ESM modules × 200 lines, fanout 5, up to 20 named ESM specifier dependencies per module (199,940 total), plus react, react-dom, lodash-es, core-js, json5, acorn, @swc/helpers. Generated modules pass through `babel-loader` → `builtin:swc-loader`. Minification is disabled; `cheap-module-source-map` is enabled.
