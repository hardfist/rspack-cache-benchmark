import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const readmePath = path.join(root, "README.md");
const summaryPath = path.join(root, "results", "summary.md");
const start = "<!-- BENCHMARK_RESULTS_START -->";
const end = "<!-- BENCHMARK_RESULTS_END -->";
const readme = fs.readFileSync(readmePath, "utf8");
const summary = fs.readFileSync(summaryPath, "utf8").trim();
const startIndex = readme.indexOf(start);
const endIndex = readme.indexOf(end);

if (startIndex === -1 || endIndex === -1 || endIndex <= startIndex) {
  throw new Error("README benchmark result markers are missing or malformed");
}

const updated = `${readme.slice(0, startIndex + start.length)}\n\n${summary}\n\n${readme.slice(endIndex)}`;
fs.writeFileSync(readmePath, updated);

