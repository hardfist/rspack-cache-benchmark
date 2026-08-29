import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const packageJson = require("../package.json");
const installedVersion = require("@rspack-canary/core/package.json").version;
const expectedVersion = packageJson.dependencies["@rspack-canary/core"];
const expectedCommit = packageJson.benchmark.commit.slice(0, 8);

if (installedVersion !== expectedVersion) {
  throw new Error(
    `Expected @rspack-canary/core@${expectedVersion}, got ${installedVersion}`,
  );
}
if (!installedVersion.includes(expectedCommit)) {
  throw new Error(
    `Canary ${installedVersion} does not contain PR commit ${expectedCommit}`,
  );
}

console.log(`Verified @rspack-canary/core@${installedVersion}`);

