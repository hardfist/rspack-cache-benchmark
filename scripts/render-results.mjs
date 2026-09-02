const labels = {
  "legacy-cache": "legacy_cache",
  "new-module": "new_cache: module=true, loader=false",
  "new-loader": "new_cache: module=false, loader=true",
};

function median(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function formatMs(value) {
  return `${value.toFixed(0)} ms`;
}

function formatMiB(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`;
}

function delta(value, baseline) {
  const percentage = ((value / baseline) - 1) * 100;
  return `${percentage >= 0 ? "+" : ""}${percentage.toFixed(1)}%`;
}

function warmStartSaving(coldMs, warmMs) {
  return `${((1 - warmMs / coldMs) * 100).toFixed(1)}%`;
}

export function renderResults(result) {
  const kinds = ["legacy-cache", "new-module", "new-loader"];
  const aggregate = Object.fromEntries(
    kinds.map((kind) => {
      const seed = result.rows.filter(
        (row) => row.cacheKind === kind && row.phase.startsWith("seed-"),
      );
      const restore = result.rows.filter(
        (row) => row.cacheKind === kind && row.phase.startsWith("restore-"),
      );
      return [
        kind,
        {
          seedMs: median(seed.map((row) => row.elapsedMs)),
          restoreMs: median(restore.map((row) => row.elapsedMs)),
          cacheBytes: median(restore.map((row) => row.cacheBytes)),
          maxRssMiB: median(restore.map((row) => row.maxRssMiB)),
          modules: median(restore.map((row) => row.compilationModuleCount)),
        },
      ];
    }),
  );

  const baseline = aggregate["legacy-cache"];
  const rows = kinds
    .map((kind) => {
      const item = aggregate[kind];
      return `| ${labels[kind]} | ${formatMs(item.seedMs)} | ${formatMs(
        item.restoreMs,
      )} | ${warmStartSaving(item.seedMs, item.restoreMs)} | ${
        kind === "legacy-cache" ? "baseline" : delta(item.restoreMs, baseline.restoreMs)
      } | ${formatMiB(
        item.cacheBytes,
      )} | ${kind === "legacy-cache" ? "baseline" : delta(item.cacheBytes, baseline.cacheBytes)} | ${item.maxRssMiB.toFixed(
        0,
      )} MiB |`;
    })
    .join("\n");

  const fixture = result.fixture;
  return `## Latest CI result

- Canary: \`@rspack-canary/core@${result.canaryVersion}\`
- PR commit: [\`${result.commit.slice(0, 8)}\`](https://github.com/web-infra-dev/rspack/commit/${result.commit})
- Max memory generations: \`${result.maxMemoryGenerations}\`
- Runner: ${result.runtime.runner}, \`${result.runtime.platform}-${result.runtime.arch}\`, Node ${result.runtime.node}, ${result.runtime.cpus} logical CPUs
- Generated: ${result.generatedAt}
- Aggregation: median of ${result.rounds} isolated seed/restore rounds; lower is better
- Compiled modules: ${Math.round(aggregate["legacy-cache"].modules).toLocaleString("en-US")}

| Cache configuration | Seed build | Restore build | Warm-start saving | Restore vs legacy | Cache size | Size vs legacy | Restore peak RSS |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
${rows}

Fixture: ${fixture.moduleCount.toLocaleString("en-US")} generated ESM modules × ${fixture.linesPerModule} lines, fanout ${fixture.moduleFanout}, up to ${fixture.specifiersPerModule} named ESM specifier dependencies per module (${fixture.specifierDependencyCount.toLocaleString("en-US")} total), plus ${fixture.thirdPartyLibraries.join(", ")}. Generated modules pass through \`${fixture.loaders.join("\` → \`")}\`. Minification is disabled; \`cheap-module-source-map\` is enabled.`;
}
