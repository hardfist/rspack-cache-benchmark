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
