import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = process.cwd();
const runner = path.join(root, "scripts", "run-one.cjs");
const rounds = Number(process.env.BENCH_ROUNDS ?? 3);
const series = process.env.BENCH_SERIES ?? "latest";
const kinds = ["legacy-cache", "new-module", "new-loader"];
const rows = [];
const cacheSeriesRoot = path.join(root, ".benchmark-cache", series);

if (!Number.isInteger(rounds) || rounds < 1) {
  throw new Error("BENCH_ROUNDS must be a positive integer");
}

function directorySize(directory) {
  if (!fs.existsSync(directory)) return 0;
  let total = 0;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) total += directorySize(target);
    else if (entry.isFile()) total += fs.statSync(target).size;
  }
  return total;
}

function runOne(kind, cacheLocation, phase) {
  const stdout = execFileSync(
    process.execPath,
    [runner, root, kind, cacheLocation, phase],
    {
      cwd: root,
      encoding: "utf8",
      maxBuffer: 10 * 1024 * 1024,
      env: {
        ...process.env,
        NODE_OPTIONS:
          process.env.NODE_OPTIONS ?? "--max-old-space-size=12288",
      },
    },
  );
  const result = JSON.parse(stdout.trim().split("\n").at(-1));
  result.cacheBytes = directorySize(cacheLocation);
  rows.push(result);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

fs.rmSync(cacheSeriesRoot, { recursive: true, force: true });
for (let round = 0; round < rounds; round++) {
  const order = kinds.map((_, index) => kinds[(index + round) % kinds.length]);
  for (const kind of order) {
    const cacheLocation = path.join(cacheSeriesRoot, `round-${round}`, kind);
    fs.mkdirSync(cacheLocation, { recursive: true });
    runOne(kind, cacheLocation, `seed-${round}`);
    runOne(kind, cacheLocation, `restore-${round}`);
  }
}

const fixture = JSON.parse(
  fs.readFileSync(path.join(root, "fixture", "fixture.json"), "utf8"),
);
const packageJson = require(path.join(root, "package.json"));
const result = {
  generatedAt: new Date().toISOString(),
  pullRequest: packageJson.benchmark.pullRequest,
  commit: packageJson.benchmark.commit,
  canaryVersion: require("@rspack-canary/core/package.json").version,
  maxMemoryGenerations: rows[0]?.maxMemoryGenerations,
  runtime: {
    platform: process.platform,
    arch: process.arch,
    node: process.version,
    cpus: os.cpus().length,
    runner: process.env.GITHUB_ACTIONS ? "GitHub Actions" : "local",
  },
  rounds,
  fixture,
  rows,
};

fs.mkdirSync(path.join(root, "results"), { recursive: true });
fs.writeFileSync(
  path.join(root, "results", "latest.json"),
  `${JSON.stringify(result, null, 2)}\n`,
);

const render = await import("./render-results.mjs");
const summary = render.renderResults(result);
fs.writeFileSync(path.join(root, "results", "summary.md"), `${summary}\n`);
process.stdout.write(`\n${summary}\n`);
