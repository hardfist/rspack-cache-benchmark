import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const fixtureRoot = path.join(root, "fixture");
const sourceDir = path.join(fixtureRoot, "src");
const moduleCount = Number(process.env.MODULE_COUNT ?? 10_000);
const linesPerModule = Number(process.env.LINES_PER_MODULE ?? 200);
const moduleFanout = Number(process.env.MODULE_FANOUT ?? 5);
const specifiersPerModule = Number(process.env.SPECIFIERS_PER_MODULE ?? 20);

if (!Number.isInteger(moduleCount) || moduleCount < 2) {
  throw new Error("MODULE_COUNT must be an integer greater than 1");
}
if (!Number.isInteger(linesPerModule) || linesPerModule < 20) {
  throw new Error("LINES_PER_MODULE must be an integer of at least 20");
}
if (!Number.isInteger(moduleFanout) || moduleFanout < 1) {
  throw new Error("MODULE_FANOUT must be a positive integer");
}
if (specifiersPerModule % moduleFanout !== 0) {
  throw new Error("SPECIFIERS_PER_MODULE must be divisible by MODULE_FANOUT");
}

const specifiersPerImport = specifiersPerModule / moduleFanout;
fs.rmSync(sourceDir, { recursive: true, force: true });
fs.mkdirSync(sourceDir, { recursive: true });

let edgeCount = 0;
let specifierDependencyCount = 0;

for (let moduleIndex = 0; moduleIndex < moduleCount; moduleIndex++) {
  const lines = [];
  const importedBindings = [];

  for (let edge = 0; edge < moduleFanout; edge++) {
    const target = moduleIndex + edge + 1;
    if (target >= moduleCount) break;

    const specifiers = [];
    for (let specifier = 0; specifier < specifiersPerImport; specifier++) {
      const alias = `d${edge}_v${specifier}`;
      specifiers.push(`v${specifier} as ${alias}`);
      importedBindings.push(alias);
    }
    lines.push(`import { ${specifiers.join(", ")} } from "./m${target}.js";`);
    edgeCount++;
    specifierDependencyCount += specifiersPerImport;
  }

  for (let specifier = 0; specifier < specifiersPerImport; specifier++) {
    lines.push(
      `export const v${specifier} = ${moduleIndex * specifiersPerImport + specifier};`,
    );
  }

  lines.push(
    `export const dependencySum = ${
      importedBindings.length === 0 ? "0" : importedBindings.join(" + ")
    };`,
  );

  let fillerIndex = 0;
  while (lines.length < linesPerModule - 1) {
    lines.push(
      `const local${fillerIndex} = (${fillerIndex} + v0 + ${moduleIndex}) ^ ${fillerIndex % 97};`,
    );
    fillerIndex++;
  }
  lines.push(`export default dependencySum + local0 + local${fillerIndex - 1};`);

  if (lines.length !== linesPerModule) {
    throw new Error(`m${moduleIndex}.js has ${lines.length} lines`);
  }
  fs.writeFileSync(path.join(sourceDir, `m${moduleIndex}.js`), `${lines.join("\n")}\n`);
}

fs.writeFileSync(
  path.join(sourceDir, "vendor-entry.js"),
  `import React from "react";
import { createRoot } from "react-dom/client";
import { chunk, groupBy, orderBy } from "lodash-es";
import "core-js/stable/index.js";
import JSON5 from "json5";
import * as acorn from "acorn";
import * as swcHelpers from "@swc/helpers";

export const thirdPartyMarker = [
  React.version,
  typeof createRoot,
  chunk([1, 2, 3, 4], 2).length,
  Object.keys(groupBy([1, 2, 3], (value) => value % 2)).length,
  orderBy([{ value: 2 }, { value: 1 }], ["value"])[0].value,
  JSON5.parse("{value: 1}").value,
  acorn.parse("export const value = 1", {
    ecmaVersion: "latest",
    sourceType: "module",
  }).type,
  Object.keys(swcHelpers).length,
].join(":");
`,
);

const metadata = {
  moduleCount,
  linesPerModule,
  moduleFanout,
  specifiersPerModule,
  edgeCount,
  specifierDependencyCount,
  thirdPartyLibraries: [
    "react",
    "react-dom",
    "lodash-es",
    "core-js",
    "json5",
    "acorn",
    "@swc/helpers",
  ],
  loaders: ["babel-loader", "builtin:swc-loader"],
};

fs.writeFileSync(
  path.join(fixtureRoot, "fixture.json"),
  `${JSON.stringify(metadata, null, 2)}\n`,
);
process.stdout.write(`${JSON.stringify(metadata, null, 2)}\n`);
