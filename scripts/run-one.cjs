const path = require("node:path");
const fs = require("node:fs");
const rspack = require("@rspack-canary/core");
const { createFsFromVolume, Volume } = require("memfs");

const [benchRoot, cacheKind, cacheLocation, phase] = process.argv.slice(2);
const babelLoader = require.resolve("babel-loader");
const canaryVersion = require("@rspack-canary/core/package.json").version;
const maxMemoryGenerations = Number(process.env.MAX_MEMORY_GENERATIONS ?? 10);

if (!Number.isInteger(maxMemoryGenerations) || maxMemoryGenerations < 0) {
  throw new Error("MAX_MEMORY_GENERATIONS must be a non-negative integer");
}

const newCacheOptions = {
  "legacy-cache": false,
  "new-module": {
    codeGeneration: true,
    module: true,
    devtool: true,
    loader: false,
    minimize: true,
  },
  "new-loader": {
    codeGeneration: true,
    module: false,
    devtool: true,
    loader: true,
    minimize: true,
  },
}[cacheKind];

if (newCacheOptions === undefined) {
  throw new Error(`Unknown cache kind: ${cacheKind}`);
}

const context = path.join(benchRoot, "fixture");
const config = {
  name: cacheKind,
  context,
  mode: "development",
  devtool: "cheap-module-source-map",
  entry: ["./src/vendor-entry.js", "./src/m0.js"],
  cache: {
    type: "persistent",
    maxMemoryGenerations,
    version: `pr-15380-${canaryVersion}`,
    buildDependencies: [],
    storage: {
      type: "filesystem",
      location: cacheLocation,
    },
  },
  experiments: {
    newCache: newCacheOptions,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: path.join(context, "src"),
        use: [
          {
            loader: "builtin:swc-loader",
            cache: true,
            options: {
              jsc: {
                parser: { syntax: "ecmascript" },
                target: "es2015",
              },
            },
          },
          {
            loader: babelLoader,
            cache: true,
            options: {
              babelrc: false,
              configFile: false,
              cacheDirectory: false,
              compact: false,
              sourceMaps: true,
            },
          },
        ],
      },
    ],
  },
  resolve: {
    modules: [path.join(benchRoot, "node_modules"), "node_modules"],
  },
  optimization: {
    minimize: false,
  },
  output: {
    path: path.join(benchRoot, "dist", cacheKind),
    filename: "main.js",
  },
  stats: "errors-warnings",
  infrastructureLogging: { level: "error" },
};

const startedAt = process.hrtime.bigint();
const compiler = rspack(config);
compiler.outputFileSystem = createFsFromVolume(new Volume());

compiler.run((error, stats) => {
  const statsError =
    !error && stats?.hasErrors()
      ? new Error(stats.toString({ all: false, errors: true, errorDetails: true }))
      : null;

  compiler.close((closeError) => {
    const finalError = error || statsError || closeError;
    if (finalError) {
      console.error(finalError);
      process.exitCode = 1;
      return;
    }

    const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const statsJson = stats?.toJson({
      all: false,
      modules: true,
      cachedModules: true,
      builtModules: true,
      modulesSpace: Infinity,
    });
    const modules = statsJson?.modules ?? [];
    process.stdout.write(
      `${JSON.stringify({
        cacheKind,
        phase,
        maxMemoryGenerations,
        elapsedMs,
        maxRssMiB: process.resourceUsage().maxRSS / 1024,
        compilationModuleCount: stats?.compilation.modules.size,
        statsModuleCount: modules.length,
        builtModules: modules.filter((module) => module.built).length,
        cachedModules: modules.filter((module) => module.cached).length,
        canaryVersion,
        outputFileSystem: "memfs",
        fixtureExists: fs.existsSync(path.join(context, "fixture.json")),
      })}\n`,
    );
  });
});
