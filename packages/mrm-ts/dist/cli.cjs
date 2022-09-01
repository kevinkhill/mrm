#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/cli.ts
var cli_exports = {};
__export(cli_exports, {
  cliDebug: () => cliDebug,
  spinner: () => spinner
});
module.exports = __toCommonJS(cli_exports);
var import_kleur5 = __toESM(require("kleur"), 1);
var import_lodash_es3 = require("lodash-es");
var import_longest = __toESM(require("longest"), 1);
var import_middleearth_names = require("middleearth-names");
var import_minimist = __toESM(require("minimist"), 1);
var import_ora = __toESM(require("ora"), 1);

// src/config.ts
var import_lodash_es = require("lodash-es");
var import_node_module = require("module");

// src/lib/tryFile.ts
var import_fs = __toESM(require("fs"), 1);
var import_kleur = __toESM(require("kleur"), 1);
var import_path = __toESM(require("path"), 1);

// src/lib/promises.ts
function promiseSeries(items, iterator) {
  return items.reduce((iterable, name) => {
    return iterable.then(() => iterator(name));
  }, Promise.resolve());
}
async function promiseFirst(thunks, errors = []) {
  if (thunks.length === 0) {
    throw new Error(`None of the ${errors.length} thunks resolved.

${errors.join("\n")}`);
  } else {
    const [thunk, ...rest] = thunks;
    try {
      return await thunk();
    } catch (error) {
      return promiseFirst(rest, [...errors, error]);
    }
  }
}

// src/lib/tryFile.ts
async function tryFile(directories, filename) {
  const debug = mrmDebug.extend("tryFile");
  debug("search: %s", import_kleur.default.bold().cyan(filename));
  try {
    return promiseFirst(
      directories.map((dir) => {
        debug("entering: %s", import_kleur.default.yellow(dir));
        const filepath = import_path.default.resolve(dir, filename);
        return async function() {
          await import_fs.default.promises.access(filepath);
          debug("+++ %s", import_kleur.default.green(filepath));
          return filepath;
        };
      })
    );
  } catch (err) {
    throw new Error(`File "${filename}" not found.`);
  }
}

// src/config.ts
var import_meta = {};
async function getConfig(directories, filename, argv) {
  const configFromFile = await getConfigFromFile(directories, filename);
  return {
    ...configFromFile,
    ...getConfigFromCommandLine(argv)
  };
}
async function getConfigFromFile(directories, filename) {
  const require5 = (0, import_node_module.createRequire)(import_meta.url);
  try {
    const filepath = await tryFile(directories, filename);
    return require5(filepath);
  } catch (err) {
    return {};
  }
}
function getConfigFromCommandLine(argv) {
  const options = {};
  (0, import_lodash_es.forEach)(argv, (value, key) => {
    if (key.startsWith("config:")) {
      options[key.replace(/^config:/, "")] = value;
    }
  });
  return options;
}

// src/constants.ts
var import_env_paths = __toESM(require("env-paths"), 1);
var import_node_os = require("os");
var import_node_path = __toESM(require("path"), 1);
var CONFIG_FILENAME = "config.json";
var DEFAULT_DIRECTORIES = [
  import_node_path.default.resolve((0, import_node_os.homedir)(), "dotfiles/mrm"),
  import_node_path.default.resolve((0, import_node_os.homedir)(), ".mrm")
];
var TASK_CACHE_DIR = (0, import_env_paths.default)("mrm", { suffix: "tasks" }).cache;
var EXAMPLES = [
  ["", "", "List of available tasks"],
  ["<task>", "", "Run a task or an alias"],
  ["<task>", "--dir ~/unicorn", "Custom config and tasks folder"],
  ["<task>", "--preset unicorn", "Load config and tasks from a preset"],
  [
    "<task>",
    "--config:foo coffee --config:bar pizza",
    "Override config options"
  ]
];

// src/errors.ts
var MrmBaseError = class extends Error {
  constructor(message, extra) {
    super(message);
    this.name = this.constructor.name;
    this.extra = extra;
  }
};
var MrmUnknownAlias = class extends MrmBaseError {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
};
var MrmUnknownTask = class extends MrmBaseError {
  constructor(message, extra) {
    super(message);
    this.name = this.constructor.name;
    if (extra) {
      this.extra = extra;
    }
  }
};
var MrmInvalidTask = class extends MrmBaseError {
  constructor(message, extra) {
    super(message);
    this.name = this.constructor.name;
    this.extra = extra;
  }
};
var MrmUndefinedOption = class extends MrmBaseError {
  constructor(message, extra) {
    super(message);
    this.name = this.constructor.name;
    if (extra) {
      this.extra = extra;
    }
  }
};
function isUnknownAliasError(err) {
  return err.constructor === MrmUnknownAlias;
}
function isUnknownTaskError(err) {
  return err.constructor === MrmUnknownTask;
}
function isInvalidTaskError(err) {
  return err.constructor === MrmInvalidTask;
}
function isUndefinedOptionError(err) {
  return err.constructor === MrmUndefinedOption;
}

// src/lib/collector.ts
var import_glob = __toESM(require("glob"), 1);
var import_kleur4 = __toESM(require("kleur"), 1);
var import_node_module4 = require("module");
var import_path2 = __toESM(require("path"), 1);

// src/mrm.ts
var import_debug = __toESM(require("debug"), 1);
var import_inquirer = __toESM(require("inquirer"), 1);
var import_kleur3 = __toESM(require("kleur"), 1);
var import_lodash_es2 = require("lodash-es");
var import_node_module3 = require("module");

// src/lib/resolveUsingNpx.ts
var import_libnpx = __toESM(require("libnpx"), 1);
var import_promises2 = require("fs/promises");
var import_node_module2 = require("module");
var import_node_path2 = __toESM(require("path"), 1);
var import_which = __toESM(require("which"), 1);

// src/lib/console.ts
var import_kleur2 = __toESM(require("kleur"), 1);
function printError(message) {
  console.log();
  console.error(import_kleur2.default.bold().red(message));
  console.log();
}

// src/lib/resolveUsingNpx.ts
var import_meta2 = {};
var require2 = (0, import_node_module2.createRequire)(import_meta2.url);
async function resolveUsingNpx(packageName) {
  const debug = mrmDebug2.extend("npxResolver");
  const npm = await (0, import_which.default)("npm");
  debug(`npx._ensurePackages('%s')`, packageName);
  const { prefix } = await import_libnpx.default._ensurePackages(packageName, {
    npm,
    q: !mrmDebug2.enabled
  });
  debug(`npx temp dir`, prefix);
  const resolved = require2.resolve(packageName, {
    paths: [
      import_node_path2.default.join(prefix, "lib", "node_modules"),
      import_node_path2.default.join(prefix, "lib64", "node_modules")
    ]
  });
  if (!resolved) {
    throw Error(`npx failed resolving ${packageName}`);
  }
  debug(`+++ %s`, resolved);
  return resolved;
}
async function resolveDirectories(paths, preset, argv) {
  if (argv.dir) {
    const resolvedDir = import_node_path2.default.resolve(argv.dir);
    const stat = await (0, import_promises2.lstat)(resolvedDir);
    if (stat.isDirectory()) {
      printError(`Directory "${resolvedDir}" not found.`);
      process.exit(1);
    }
    paths.unshift(resolvedDir);
  }
  const presetPackageName = getPackageName("preset", preset);
  try {
    const presetPath = await promiseFirst([
      () => require2.resolve(presetPackageName),
      () => require2.resolve(preset),
      () => resolveUsingNpx(presetPackageName),
      () => resolveUsingNpx(preset)
    ]);
    return [...paths, import_node_path2.default.dirname(presetPath)];
  } catch {
    printError(`Preset "${preset}" not found.

	We've tried to load "${presetPackageName}" and "${preset}" npm packages.`);
    return process.exit(1);
  }
}

// src/mrm.ts
var import_meta3 = {};
var require3 = (0, import_node_module3.createRequire)(import_meta3.url);
var mrmDebug2 = (0, import_debug.default)("mrm");
function getPackageName(type, packageName) {
  const [scopeOrTask, scopedTaskName] = packageName.split("/");
  return scopedTaskName ? `${scopeOrTask}/mrm-${type}-${scopedTaskName}` : `mrm-${type}-${scopeOrTask}`;
}
function run(name, directories, options, argv) {
  if (Array.isArray(name)) {
    return promiseSeries(name, (n) => {
      return run(n, directories, options, argv);
    });
  }
  if (getAllAliases(options)[name]) {
    return runAlias(name, directories, options, argv);
  }
  return runTask(name, directories, options, argv);
}
async function runAlias(aliasName, directories, options, argv) {
  const tasks = getAllAliases(options)[aliasName];
  if (!tasks) {
    throw new MrmUnknownAlias(`Alias "${aliasName}" not found.`);
  }
  console.log(import_kleur3.default.yellow(`Running alias ${aliasName}...`));
  return promiseSeries(tasks, (name) => {
    const isAlias = getAllAliases(options)[name];
    if (isAlias) {
      return runAlias(name, directories, options, argv);
    } else {
      return runTask(name, directories, options, argv);
    }
  });
}
async function runTask(taskName, directories, options, argv) {
  const taskPackageName = getPackageName("task", taskName);
  let modulePath;
  try {
    modulePath = await promiseFirst([
      () => tryFile(directories, `${taskName}/index.js`),
      () => require3.resolve(taskPackageName),
      () => resolveUsingNpx(taskPackageName),
      () => require3.resolve(taskName),
      () => resolveUsingNpx(taskName)
    ]);
  } catch {
    modulePath = null;
  }
  return new Promise((resolve, reject) => {
    if (!modulePath) {
      reject(
        new MrmUnknownTask(`Task "${taskName}" not found.`, {
          taskName
        })
      );
      return;
    }
    const module2 = require3(modulePath);
    if (typeof module2 !== "function") {
      reject(
        new MrmInvalidTask(`Cannot call task "${taskName}".`, { taskName })
      );
      return;
    }
    console.log(import_kleur3.default.cyan(`Running ${taskName}...`));
    Promise.resolve(getTaskOptions(module2, argv.interactive, options)).then((config) => module2(config, argv)).then(resolve).catch(reject);
  });
}
async function getTaskOptions(task, interactive = false, options = {}) {
  if (!task.parameters) {
    return options;
  }
  const parameters = Object.entries(task.parameters);
  const allOptions = await Promise.all(
    parameters.map(async ([name, param]) => ({
      ...param,
      name,
      default: typeof options[name] !== "undefined" ? options[name] : typeof param.default === "function" ? await param.default(options) : param.default
    }))
  );
  const [prompts, statics] = (0, import_lodash_es2.partition)(
    allOptions,
    (option) => interactive && option.type !== "config"
  );
  const invalid = statics.filter(
    (param) => param.validate ? param.validate(param.default) !== true : false
  );
  if (invalid.length > 0) {
    const names = invalid.map(({ name }) => name);
    throw new MrmUndefinedOption(
      `Missing required config options: ${names.join(", ")}.`,
      {
        unknown: names
      }
    );
  }
  const answers = prompts.length > 0 ? await import_inquirer.default.prompt(prompts) : {};
  const values = { ...answers };
  for (const param of statics) {
    values[param.name] = param.default;
  }
  return values;
}

// src/lib/collector.ts
var import_meta4 = {};
var require4 = (0, import_node_module4.createRequire)(import_meta4.url);
function getAllAliases(options) {
  return options.aliases ?? {};
}
async function getAllTasks(directories, options) {
  const debug = mrmDebug2.extend("getAllTasks");
  const allTasks = getAllAliases(options);
  debug("searching dirs: %O", directories);
  directories.forEach((dir) => {
    debug("entering: %s", import_kleur4.default.yellow(dir));
    const tasks = import_glob.default.sync(`${dir}/*/index.js`);
    debug("\\ task count: %s", import_kleur4.default.bold().cyan(tasks.length));
    tasks.forEach((filename) => {
      const taskName = import_path2.default.basename(import_path2.default.dirname(filename));
      debug(" | %s", import_kleur4.default.green(taskName));
      if (!allTasks[taskName]) {
        const module2 = require4(filename);
        allTasks[taskName] = module2.description || "";
      }
    });
  });
  return allTasks;
}

// src/lib/listify.ts
function toNaturalList(list, separator = ",", finalWord = "and") {
  if (!Array.isArray(list)) {
    throw new TypeError("requires an array");
  }
  if (finalWord.length > 0) {
    finalWord += " ";
  }
  const trimmed = list.filter((item) => item.trim());
  let str;
  if (trimmed.length === 2 && finalWord.length > 0) {
    str = trimmed.join(" " + finalWord);
  } else if (trimmed.length < 3) {
    str = trimmed.join(separator);
  } else {
    const head = trimmed.slice(0, -1);
    const tail = finalWord + trimmed[trimmed.length - 1];
    str = [head, tail].join(separator);
  }
  return str;
}

// src/lib/runUpdater.ts
var import_update_notifier = __toESM(require("update-notifier"), 1);

// package.json
var package_default = {
  name: "mrm-ts",
  version: "4.0.0",
  description: "Codemods for your project config files",
  keywords: [
    "boilerplate",
    "cli",
    "codemod",
    "command line",
    "generate",
    "generator",
    "ini",
    "json",
    "markdown",
    "runner",
    "scaffold",
    "task",
    "template",
    "tool",
    "yaml"
  ],
  license: "MIT",
  author: {
    name: "Kevin Hill",
    email: "kevinkhill@pm.me",
    url: "https://github.com/kevinkhill"
  },
  scripts: {
    dev: "tsx ./src/cli.ts",
    build: "tsup --dts",
    "view-config": "tsx ./src/cli.ts --view-config"
  },
  type: "module",
  main: "dist/index.js",
  bin: {
    mrm: "dist/cli.js"
  },
  types: "dist/index.d.ts",
  files: [
    "bin",
    "src"
  ],
  dependencies: {
    debug: "^4.3.4",
    degit: "^2.8.4",
    "env-paths": "^3.0.0",
    execa: "^6.1.0",
    glob: "^7.1.6",
    inquirer: "^7.0.4",
    kleur: "^3.0.3",
    libnpx: "^10.2.4",
    "lodash-es": "^4.17.21",
    longest: "^2.0.1",
    "make-dir": "^3.1.0",
    "middleearth-names": "^1.1.0",
    minimist: "^1.2.0",
    "mrm-core": "^7.0.0",
    ora: "^6.1.2",
    rimraf: "^3.0.2",
    "semver-utils": "^1.1.4",
    "update-notifier": "^4.1.0",
    which: "^2.0.2"
  },
  devDependencies: {
    "@types/debug": "^4.1.7",
    "@types/inquirer": "^9.0.1",
    "@types/jest": "^28.1.7",
    "@types/lodash-es": "^4.17.6",
    "@types/node": "^18.7.14",
    "@types/update-notifier": "^6.0.1",
    "@types/which": "^2.0.1",
    "@typescript-eslint/eslint-plugin": "^5.36.0",
    "@typescript-eslint/parser": "^5.36.0",
    eslint: "^8.23.0",
    "eslint-config-prettier": "^8.5.0",
    "eslint-plugin-import": "^2.26.0",
    "eslint-plugin-prettier": "^4.2.1",
    "eslint-plugin-simple-import-sort": "^7.0.0",
    tsup: "^6.2.3",
    tsx: "^3.9.0"
  },
  engines: {
    node: ">=10.13"
  }
};

// src/lib/runUpdater.ts
function runUpdater() {
  var _a, _b;
  const notifier = (0, import_update_notifier.default)({ pkg: package_default });
  cliDebug("current pkg version: %s", (_a = notifier.update) == null ? void 0 : _a.current);
  cliDebug("latest pkg version: %s", (_b = notifier.update) == null ? void 0 : _b.latest);
  return notifier.notify();
}

// src/cli.ts
var cliDebug = mrmDebug2.extend("cli");
var spinner = (0, import_ora.default)("Loading mrm");
async function main() {
  const debug = cliDebug;
  const argv = (0, import_minimist.default)(process.argv.slice(2), {
    alias: {
      i: "interactive"
    },
    boolean: ["view-config"]
  });
  debug("argv = %O", argv);
  if (!mrmDebug2.enabled) {
    spinner.start();
  }
  const tasks = argv._;
  const binaryPath = process.env._;
  const binaryName = binaryPath && binaryPath.endsWith("/npx") ? "npx mrm" : "mrm";
  const preset = argv.preset || "default";
  const isDefaultPreset = preset === "default";
  const directories = [...DEFAULT_DIRECTORIES];
  spinner.color = "yellow";
  spinner.text = `resolving ${preset}`;
  const resolvedDirs = await resolveDirectories(directories, preset, argv);
  const options = await getConfig(directories, CONFIG_FILENAME, argv);
  debug(resolvedDirs);
  debug(options);
  if (argv["view-config"]) {
    console.log("\n", import_kleur5.default.yellow().underline("Tasks"), "\n");
    console.log(tasks);
    console.log("\n", import_kleur5.default.yellow().underline("Directories"), "\n");
    console.log(directories);
    console.log("\n", import_kleur5.default.yellow().underline("Options"), "\n");
    console.log(options);
    process.exit(1);
  }
  if (tasks.length === 0 || tasks[0] === "help") {
    await commandHelp();
    return;
  }
  try {
    spinner.succeed("Done.");
    await run(tasks, directories, options, argv);
  } catch (err) {
    if (isUnknownAliasError(err)) {
      printError(err.message);
    } else if (isUnknownTaskError(err)) {
      const { taskName } = err.extra;
      if (isDefaultPreset) {
        const modules = directories.slice(0, -1).map((d) => `${d}/${taskName}/index.js`).concat([
          `"${taskName}" in the default mrm tasks`,
          `mrm-task-${taskName} package in local node_modules`,
          `${taskName} package in local node_modules`,
          `mrm-task-${taskName} package on the npm registry`,
          `${taskName} package on the npm registry`
        ]);
        printError(
          `${err.message}

We've tried these locations:

- ${modules.join("\n- ")}`
        );
      } else {
        printError(`Task "${taskName}" not found in the "${preset}" preset.

Note that when a preset is specified no default search locations are used.`);
      }
    } else if (isInvalidTaskError(err)) {
      printError(`${err.message}

Make sure your task module exports a function.`);
    } else if (isUndefinedOptionError(err)) {
      const { unknown } = err.extra;
      const values = unknown.map((name) => [name, (0, import_middleearth_names.random)()]);
      const configList = toNaturalList(unknown);
      const heading = `Required config options are missed: ${configList}.`;
      const cliHelp = `  ${binaryName} ${tasks.join(" ")} ${values.map(([n, v]) => `--config:${n} "${v}"`).join(" ")}`;
      if (isDefaultPreset) {
        const userDirectories = directories.slice(0, -1);
        printError(
          `${heading}

1. Create a "${CONFIG_FILENAME}" file:

{
${values.map(([n, v]) => `  "${n}": "${v}"`).join(",\n")}
}

In one of these folders:

- ${userDirectories.join("\n- ")}

2. Or pass options via command line:

${cliHelp}
	`
        );
      } else {
        printError(
          `${heading}

You can pass the option via command line:

${cliHelp}

Note that when a preset is specified no default search locations are used.`
        );
      }
    } else {
      throw err;
    }
  }
  function getUsage() {
    const commands = EXAMPLES.map((x) => x.join(""));
    const commandsWidth = (0, import_longest.default)(commands).length;
    return EXAMPLES.map(
      ([command, opts, description]) => [
        "   ",
        import_kleur5.default.bold(binaryName),
        import_kleur5.default.cyan(command),
        import_kleur5.default.yellow(opts),
        (0, import_lodash_es3.padEnd)("", commandsWidth - (command + opts).length),
        description && `# ${description}`
      ].join(" ")
    ).join("\n");
  }
  async function getTasksList() {
    const allTasks = await getAllTasks(directories, options);
    const names = (0, import_lodash_es3.sortBy)(Object.keys(allTasks));
    const nameColWidth = names.length > 0 ? (0, import_longest.default)(names).length : 0;
    return names.map((name) => {
      const description = Array.isArray(allTasks[name]) ? `Runs ${toNaturalList(allTasks[name])}` : allTasks[name];
      return "    " + import_kleur5.default.cyan((0, import_lodash_es3.padEnd)(name, nameColWidth)) + "  " + description;
    }).join("\n");
  }
  async function commandHelp() {
    console.log(
      [
        import_kleur5.default.underline("Usage"),
        getUsage(),
        import_kleur5.default.underline("Available tasks"),
        await getTasksList()
      ].join("\n\n")
    );
    console.log("\n");
  }
}
process.on("unhandledRejection", (err) => {
  cliDebug("ERROR");
  cliDebug(err);
  printError(err.message);
  process.exit(1);
});
runUpdater();
main();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  cliDebug,
  spinner
});
//# sourceMappingURL=cli.cjs.map