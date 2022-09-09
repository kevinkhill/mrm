#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// package.json
var require_package = __commonJS({
  "package.json"(exports, module) {
    module.exports = {
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
        build: "tsup --format cjs,esm",
        cli: "tsx ./src/cli.ts",
        prestart: "npm run build",
        start: "node bin/mrm.js",
        debug: "DEBUG=mrm* tsx ./src/cli.ts",
        "view-config": "tsx ./src/cli.ts --options"
      },
      type: "commonjs",
      main: "dist/cli.js",
      bin: {
        mrm: "dist/cli.js"
      },
      files: [
        "bin",
        "dist"
      ],
      dependencies: {
        debug: "^4.3.4",
        degit: "^2.8.4",
        "env-paths": "2.2.1",
        execa: "^6.1.0",
        glob: "^7.1.6",
        inquirer: "^7.0.4",
        kleur: "^3.0.3",
        libnpx: "^10.2.4",
        "make-dir": "^3.1.0",
        "middleearth-names": "^1.1.0",
        minimist: "^1.2.0",
        "mrm-core": "^7.0.0",
        ora: "5.4.1",
        rimraf: "^3.0.2",
        "semver-utils": "^1.1.4",
        "update-notifier": "^4.1.0",
        which: "^2.0.2"
      },
      devDependencies: {
        "@types/debug": "^4.1.7",
        "@types/glob": "^8.0.0",
        "@types/inquirer": "^9.0.1",
        "@types/jest": "^28.1.7",
        "@types/minimist": "^1.2.2",
        "@types/node": "^18.7.14",
        "@types/update-notifier": "^6.0.1",
        "@types/which": "^2.0.1",
        "@typescript-eslint/eslint-plugin": "^5.36.2",
        "@typescript-eslint/parser": "^5.36.0",
        eslint: "^8.23.0",
        "eslint-config-prettier": "^8.5.0",
        "eslint-plugin-import": "^2.26.0",
        "eslint-plugin-prettier": "^4.2.1",
        "eslint-plugin-simple-import-sort": "^7.0.0",
        prettier: "^2.7.1",
        tsup: "^6.2.3",
        tsx: "^3.9.0",
        typescript: "^4.8.2"
      },
      engines: {
        node: ">=14.16"
      }
    };
  }
});

// src/cli.ts
var import_package = __toESM(require_package());
import kleur9 from "kleur";
import { random } from "middleearth-names";
import minimist from "minimist";
import updateNotifier from "update-notifier";

// src/constants.ts
import envPaths from "env-paths";
import kleur from "kleur";
var NPX_RESOLVER_QUIET = true;
var PREFIX = `[${kleur.cyan("mrm")}]`;
var CONFIG_FILENAME = "config.json";
var TASK_CACHE_DIR = envPaths("mrm", { suffix: "tasks" }).cache;
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

// src/lib/config.ts
import { readFile } from "fs/promises";
import kleur3 from "kleur";

// src/lib/utils.ts
import Debug from "debug";
import fs from "fs";
import kleur2 from "kleur";
import { lstatSync } from "fs";
import path from "path";

// src/lib/promises.ts
async function promiseSeries(array, fn) {
  const results = {};
  for (let i = 0; i < array.length; i++) {
    const currItem = array[i];
    const r = await fn(currItem);
    results[currItem] = r;
  }
  return results;
}
async function promiseFirst(thunks, errors = []) {
  if (thunks.length === 0) {
    throw new Error(`None of the ${errors.length} thunks resolved.

${errors.join("\n")}`);
  }
  const [thunk, ...rest] = thunks;
  try {
    return await thunk();
  } catch (error) {
    return promiseFirst(rest, [...errors, error]);
  }
}

// src/lib/utils.ts
var mrmDebug = Debug("mrm");
function longest(input) {
  return input.reduce((a, b) => a.length > b.length ? a : b, "");
}
function isDirSync(dir) {
  const stat = lstatSync(path.resolve(dir));
  return stat.isDirectory();
}
function printError(message) {
  console.log();
  console.error(kleur2.bold().red(message));
  console.log();
}
function getPackageName(type, packageName) {
  const [scopeOrTask, scopedTaskName] = packageName.split("/");
  return scopedTaskName ? `${scopeOrTask}/mrm-${type}-${scopedTaskName}` : `mrm-${type}-${scopeOrTask}`;
}
function toNaturalList(list, separator = ", ", finalWord = "and") {
  const trimmed = list.filter((item) => item.trim());
  const head = trimmed.slice(0, -1).join(separator);
  const tail = `${finalWord} ${trimmed[trimmed.length - 1]}`;
  return [head, tail].join(separator);
}
async function tryFile(filename, directories) {
  const debug3 = mrmDebug.extend("tryFile");
  debug3("trying for %s", kleur2.cyan(filename));
  try {
    return promiseFirst(
      directories.map((dir) => {
        const filepath = path.resolve(dir, filename);
        return async function() {
          debug3("entering: %s", kleur2.yellow(dir));
          await fs.promises.access(filepath);
          debug3(" | %s", kleur2.green(filepath));
          return filepath;
        };
      })
    );
  } catch (err) {
    throw new Error(`File "${filename}" not found.`);
  }
}

// src/lib/config.ts
var debug = mrmDebug.extend("ConfigLoader");
async function getConfig(directories, argv) {
  const configFromFile = await getConfigFromFile(directories);
  debug("loaded: %O", configFromFile);
  return {
    ...configFromFile,
    ...getConfigFromCommandLine(argv)
  };
}
async function getConfigFromFile(directories) {
  try {
    const filepath = await tryFile(CONFIG_FILENAME, directories);
    debug("found: %s", kleur3.green(filepath));
    return JSON.parse(await readFile(filepath, "utf8"));
  } catch (err) {
    return {};
  }
}
function getConfigFromCommandLine(argv) {
  return Object.keys(argv).filter((k) => k.startsWith("config:")).reduce((options, key) => {
    return {
      ...options,
      [key.replace(/^config:/, "")]: argv[key]
    };
  }, {});
}

// src/lib/errors.ts
var MrmBaseError = class extends Error {
  constructor(message, extra) {
    super(message);
    this.name = this.constructor.name;
    this.extra = extra;
  }
};
var MrmPathNotExist = class extends MrmBaseError {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
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

// src/lib/npm.ts
import kleur4 from "kleur";
import which from "which";

// src/lib/npxResolver.ts
import kleur5 from "kleur";
import npx from "libnpx";
import path2 from "path";
import which2 from "which";
async function resolveUsingNpx(packageName) {
  const debug3 = mrmDebug.extend("npxResolver");
  const npm = await which2("npm");
  debug3(`ensure packages: %s`, kleur5.bold().cyan(packageName));
  const { prefix } = await npx._ensurePackages(packageName, {
    npm,
    q: NPX_RESOLVER_QUIET
  });
  debug3(`temp dir: %s`, kleur5.yellow(prefix));
  const resolved = __require.resolve(packageName, {
    paths: [
      path2.join(prefix, "lib", "node_modules"),
      path2.join(prefix, "lib64", "node_modules")
    ]
  });
  if (!resolved) {
    throw Error(`npx failed resolving ${packageName}`);
  }
  debug3(`resolved: %s`, kleur5.yellow(resolved));
  return resolved;
}

// src/lib/resolveDirectories.ts
import { lstat } from "fs/promises";
import path3 from "path";
async function resolveDirectories(paths, preset, customDir) {
  if (customDir) {
    const resolvedDir = path3.resolve(customDir);
    const stat = await lstat(resolvedDir);
    if (stat.isDirectory()) {
      printError(`Directory "${resolvedDir}" not found.`);
      process.exit(1);
    }
    paths.unshift(resolvedDir);
  }
  const presetPackageName = getPackageName("preset", preset);
  try {
    const presetPath = await promiseFirst([
      () => __require.resolve(presetPackageName),
      () => __require.resolve(preset),
      () => resolveUsingNpx(presetPackageName),
      () => resolveUsingNpx(preset)
    ]);
    return [...paths, path3.dirname(presetPath)];
  } catch {
    printError(`Preset "${preset}" not found.

We've tried to load "${presetPackageName}" and "${preset}" npm packages.`);
    process.exit(1);
  }
}

// src/lib/taskCollector.ts
import glob from "glob";
import kleur6 from "kleur";

// src/lib/taskRunner.ts
import inquirer from "inquirer";
import kleur7 from "kleur";
var debug2 = mrmDebug.extend("taskRunner");

// src/TaskStore.ts
import glob2 from "glob";
import inquirer2 from "inquirer";
import kleur8 from "kleur";
import * as mrmCore from "mrm-core";
import { homedir } from "os";
import path4 from "path";
var _TaskStore = class {
  preset = "default";
  initialized = false;
  get PATH() {
    return this._directories;
  }
  get options() {
    return this._options;
  }
  get aliases() {
    return this._options.aliases ?? {};
  }
  get isDefaultPreset() {
    return this.preset === "default";
  }
  _argv;
  _debug;
  _directories = [];
  _options = {};
  constructor(argv, options) {
    this._debug = mrmDebug.extend("TaskStore");
    this._argv = argv;
    this._options = options ?? {};
    const { preset } = this._argv;
    if (preset) {
      this._debug("activating preset: %s", preset);
      this.preset = preset;
    }
  }
  async initStore(directories) {
    this._directories = await resolveDirectories(
      directories ?? _TaskStore.DEFAULT_DIRECTORIES,
      "default",
      this._argv.dir
    );
    this.initialized = true;
  }
  addDirToPath(dir) {
    if (!isDirSync(dir)) {
      throw new MrmPathNotExist(`Could not resolve the given path: ${dir}`);
    }
    this._directories.push(dir);
  }
  setOption(option, value) {
    this._options[option] = value;
  }
  setOptions(options) {
    this._options = options;
  }
  mergeOptions(options) {
    this._options = {
      ...this._options,
      ...options
    };
  }
  async getAllTasks() {
    const allTasks = this.aliases;
    this._debug("PATH: %O", this.PATH);
    for (const dir of this.PATH) {
      this._debug("entering: %s", kleur8.yellow(dir));
      const tasks = glob2.sync(`${dir}/*/index.js`);
      console.error(tasks);
      this._debug("\\ task count: %s", kleur8.yellow(tasks.length));
      for (const filename of tasks) {
        const taskName = path4.basename(path4.dirname(filename));
        this._debug(" | %s", kleur8.green(taskName));
        if (!allTasks[taskName]) {
          const module = await import(filename);
          allTasks[taskName] = module.description || "";
        }
      }
    }
    return allTasks;
  }
  async run(name) {
    if (!this.initialized) {
      throw new Error(
        `TaskStore is not initialized. The initStore() method must be called before run()`
      );
    }
    const taskList = [name].flat();
    this._debug("tasks to run: %O", taskList);
    this._debug("aliases: %O", this.aliases);
    return await promiseSeries(taskList, async (taskName) => {
      if (Object.hasOwn(this.aliases, taskName)) {
        return await this.runAlias(taskName);
      }
      return await this.runTask(taskName);
    });
  }
  async runAlias(aliasName) {
    if (Object.hasOwn(this.aliases, aliasName) === false) {
      throw new MrmUnknownAlias(`Alias "${aliasName}" not found.`);
    }
    const aliasedTasks = this.aliases[aliasName];
    if (!this._argv.silent || !this._debug.enabled) {
      console.log(kleur8.yellow(`Running alias ${aliasName}...`));
    }
    this._debug("running alias: %s", kleur8.bgMagenta().white(aliasName));
    this._debug("mapped tasks: %O", aliasedTasks);
    return await this.run(aliasedTasks);
  }
  async runTask(taskName) {
    this._debug("running task: %s", kleur8.bgBlue().white(taskName));
    const modulePath = await this.resolveTask(taskName);
    if (!modulePath) {
      throw new MrmUnknownTask(`Task "${taskName}" not found.`, {
        taskName
      });
    }
    const module = (await import(modulePath)).default;
    if (typeof module !== "function") {
      throw new MrmInvalidTask(`Cannot call task "${taskName}".`, { taskName });
    }
    if (!this._argv.silent || !this._debug.enabled) {
      console.log(kleur8.cyan(`Running ${taskName}...`));
    }
    const config = await this.getTaskOptions(module, this._argv.interactive);
    if (this._argv["examine"]) {
      console.log(kleur8.underline(`
Details for Task "${taskName}"`));
      console.log(`
Module: `, String(module));
      console.log(`
Config: `, config);
      console.log(`
CLI Args: `, this._argv);
      return;
    } else {
      if (this._argv["useNewTaskSignature"]) {
        return module({ config, argv: this._argv, mrmCore });
      } else {
        return module(config, this._argv);
      }
    }
  }
  async getTaskOptions(task, interactive = false) {
    if (!task.parameters) {
      return this._options;
    }
    const parameters = Object.entries(task.parameters);
    const allOptions = await Promise.all(
      parameters.map(async ([name, param]) => ({
        ...param,
        name,
        default: typeof this._options[name] !== "undefined" ? this._options[name] : typeof param.default === "function" ? await param.default(this._options) : param.default
      }))
    );
    const prompts = allOptions.filter(
      (option) => interactive && option.type !== "config"
    );
    const statics = allOptions.filter((i) => prompts.indexOf(i) > -1);
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
    const answers = prompts.length > 0 ? await inquirer2.prompt(prompts) : {};
    const values = { ...answers };
    for (const param of statics) {
      values[param.name] = param.default;
    }
    return values;
  }
  queueTasks(task) {
  }
  async runTaskQueue() {
  }
  async resolveTask(taskName) {
    const tracer = this._debug.extend("resolveTask");
    const taskPackageName = getPackageName("task", taskName);
    try {
      return await promiseFirst([
        () => {
          tracer("tryFile(%s)", taskName);
          return tryFile(`${taskName}/index.js`, this.PATH);
        },
        () => {
          tracer(`require.resolve(%s)`, taskPackageName);
          return __require.resolve(taskPackageName);
        },
        () => {
          tracer(`resolveUsingNpx(%s)`, taskPackageName);
          return resolveUsingNpx(taskPackageName);
        },
        () => {
          tracer(`require.resolve(%s)`, taskName);
          return __require.resolve(taskName);
        },
        () => {
          tracer(`resolveUsingNpx(%s)`, taskName);
          return resolveUsingNpx(taskName);
        }
      ]);
    } catch {
      return null;
    }
  }
};
var TaskStore = _TaskStore;
__publicField(TaskStore, "DEFAULT_DIRECTORIES", [
  path4.resolve(homedir(), "dotfiles/mrm"),
  path4.resolve(homedir(), ".mrm")
]);

// src/cli.ts
var cliDebug = mrmDebug.extend("CLI");
var loadingDotsInterval;
async function mrm() {
  const debug3 = cliDebug;
  const argv = minimist(process.argv.slice(2), {
    alias: {
      i: "interactive"
    },
    boolean: ["silent", "dump", "dry-run", "examine", "useNewTaskSignature"]
  });
  debug3("argv: %O", argv);
  const MrmTasks = new TaskStore(argv);
  const tasks = argv._;
  const binaryPath = process.env._;
  const binaryName = binaryPath && binaryPath.endsWith("/npx") ? "npx mrm" : "mrm";
  const preset = argv.preset || "default";
  if (!mrmDebug.enabled && !argv.silent) {
    process.stdout.write(`${PREFIX} Fetching the default preset`);
    loadingDotsInterval = setInterval(() => {
      process.stdout.write(".");
    }, 1e3);
  }
  await MrmTasks.initStore();
  const options = await getConfig(MrmTasks.PATH, argv);
  debug3("options: %O", options);
  MrmTasks.mergeOptions(options);
  if (!mrmDebug.enabled && !argv.silent) {
    clearInterval(loadingDotsInterval);
    console.log(kleur9.green("done"));
  }
  if (argv["dump"]) {
    console.log("\n", kleur9.yellow().underline("Options"), "\n");
    console.log(MrmTasks);
    return;
  }
  if (tasks.length === 0 || tasks[0] === "help") {
    if (!argv.silent) {
      console.log(PREFIX, kleur9.yellow("No tasks to run"));
    }
    commandHelp(binaryName, await MrmTasks.getAllTasks());
    return;
  }
  try {
    await MrmTasks.run(tasks);
  } catch (err) {
    if (isUnknownAliasError(err)) {
      printError(err.message);
    } else if (isUnknownTaskError(err)) {
      const { taskName } = err.extra;
      if (MrmTasks.isDefaultPreset) {
        const modules = MrmTasks.PATH.slice(0, -1).map((d) => `${d}/${taskName}/index.js`).concat([
          `"${taskName}" in the default mrm tasks`,
          `mrm-task-${taskName} package in local node_modules`,
          `${taskName} package in local node_modules`,
          `mrm-task-${taskName} package on the npm registry`,
          `${taskName} package on the npm registry`
        ]);
        printError(`${err.message}

We've tried these locations:

- ${modules.join("\n- ")}`);
      } else {
        printError(`Task "${taskName}" not found in the "${preset}" preset.

Note that when a preset is specified no default search locations are used.`);
      }
    } else if (isInvalidTaskError(err)) {
      printError(`${err.message}

Make sure your task module exports a function.`);
    } else if (isUndefinedOptionError(err)) {
      const { unknown } = err.extra;
      const values = unknown.map((name) => [name, random()]);
      const configList = toNaturalList(unknown);
      const heading = `Required config options are missed: ${configList}.`;
      const cliHelp = `  ${binaryName} ${tasks.join(" ")} ${values.map(([n, v]) => `--config:${n} "${v}"`).join(" ")}`;
      if (MrmTasks.isDefaultPreset) {
        const userDirectories = MrmTasks.PATH.slice(0, -1);
        printError(`${heading}

1. Create a "${CONFIG_FILENAME}" file:

{
${values.map(([n, v]) => `  "${n}": "${v}"`).join(",\n")}
}

In one of these folders:

- ${userDirectories.join("\n- ")}

2. Or pass options via command line:

${cliHelp}
	`);
      } else {
        printError(`${heading}

You can pass the option via command line:

${cliHelp}

Note that when a preset is specified no default search locations are used.`);
      }
    } else {
      throw err;
    }
  }
}
function commandHelp(binaryName, allTasks) {
  console.log("\n");
  console.log(
    [
      kleur9.underline("Usage"),
      getUsage(binaryName, EXAMPLES),
      kleur9.underline("Available tasks"),
      buildTasksList(allTasks)
    ].join("\n\n")
  );
  console.log("\n");
}
function getUsage(binaryName, examples) {
  const commands = examples.map((x) => x.join(""));
  const commandsWidth = longest(commands).length;
  return examples.map(
    ([command, opts, description]) => [
      "   ",
      kleur9.bold(binaryName),
      kleur9.cyan(command),
      kleur9.yellow(opts),
      "".padEnd(commandsWidth - (command + opts).length),
      description && `# ${description}`
    ].join(" ")
  ).join("\n");
}
function buildTasksList(allTasks) {
  const names = Object.keys(allTasks).sort();
  const nameColWidth = names.length > 0 ? longest(names).length : 0;
  return names.map((name) => {
    const description = Array.isArray(allTasks[name]) ? `Runs ${toNaturalList(allTasks[name])}` : allTasks[name];
    return "    " + kleur9.cyan(name.padEnd(nameColWidth)) + "  " + description;
  }).join("\n");
}
process.on("unhandledRejection", (err) => {
  cliDebug("ERROR");
  cliDebug(err);
  printError(err.message);
  process.exit(1);
});
var notifier = updateNotifier({ pkg: import_package.default });
var _a;
cliDebug("current pkg version: %s", (_a = notifier.update) == null ? void 0 : _a.current);
var _a2;
cliDebug("latest pkg version: %s", (_a2 = notifier.update) == null ? void 0 : _a2.latest);
notifier.notify();
mrm();
export {
  mrm
};
//# sourceMappingURL=cli.mjs.map