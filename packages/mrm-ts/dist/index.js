"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
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
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};

// package.json
var require_package = __commonJS({
  "package.json"(exports, module2) {
    module2.exports = {
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
        build: "tsup && tsc",
        cli: "tsx ./src/cli.ts",
        prestart: "npm run build",
        start: "node bin/mrm.js",
        debug: "DEBUG=mrm* tsx ./src/cli.ts",
        "view-config": "tsx ./src/cli.ts --options"
      },
      type: "commonjs",
      types: "./dist/index.d.ts",
      main: "./dist/index.js",
      bin: {
        mrm: "./bin/mrm.js"
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
        "@microsoft/api-extractor": "^7.30.0",
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

// src/index.ts
var src_exports = {};
__export(src_exports, {
  mrm: () => mrm
});
module.exports = __toCommonJS(src_exports);
var import_kleur6 = __toESM(require("kleur"));
var import_middleearth_names = require("middleearth-names");
var import_minimist = __toESM(require("minimist"));
var import_update_notifier = __toESM(require("update-notifier"));
var import_package = __toESM(require_package());

// src/constants.ts
var import_env_paths = __toESM(require("env-paths"));
var import_kleur = __toESM(require("kleur"));
var NPX_RESOLVER_QUIET = true;
var PREFIX = `[${import_kleur.default.cyan("mrm")}]`;
var CONFIG_FILENAME = "config.json";
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

// src/lib/config.ts
var import_promises3 = require("fs/promises");
var import_kleur3 = __toESM(require("kleur"));

// src/lib/utils.ts
var import_debug = __toESM(require("debug"));
var import_fs = __toESM(require("fs"));
var import_kleur2 = __toESM(require("kleur"));
var import_node_fs = require("fs");
var import_promises = require("fs/promises");
var import_node_path = __toESM(require("path"));

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
var mrmDebug = (0, import_debug.default)("mrm");
function longest(input) {
  return input.reduce((a, b) => a.length > b.length ? a : b, "");
}
function isDirSync(dir) {
  const stat = (0, import_node_fs.lstatSync)(import_node_path.default.resolve(dir));
  return stat.isDirectory();
}
function printError(message) {
  console.error("\n", import_kleur2.default.bold().red(message), "\n");
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
  const debug2 = mrmDebug.extend("tryFile");
  debug2("trying for %s", import_kleur2.default.cyan(filename));
  try {
    return promiseFirst(
      directories.map((dir) => {
        const filepath = import_node_path.default.resolve(dir, filename);
        return async function() {
          debug2("entering: %s", import_kleur2.default.yellow(dir));
          await import_fs.default.promises.access(filepath);
          debug2(" | %s", import_kleur2.default.green(filepath));
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
    debug("found: %s", import_kleur3.default.green(filepath));
    return JSON.parse(await (0, import_promises3.readFile)(filepath, "utf8"));
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

// src/lib/npxResolver.ts
var import_kleur4 = __toESM(require("kleur"));
var import_libnpx = __toESM(require("libnpx"));
var import_node_path2 = __toESM(require("path"));
var import_which = __toESM(require("which"));
async function resolveUsingNpx(packageName) {
  const debug2 = mrmDebug.extend("npxResolver");
  const npm = await (0, import_which.default)("npm");
  debug2(`ensure packages: %s`, import_kleur4.default.bold().cyan(packageName));
  const { prefix } = await import_libnpx.default._ensurePackages(packageName, {
    npm,
    q: NPX_RESOLVER_QUIET
  });
  debug2(`temp dir: %s`, import_kleur4.default.yellow(prefix));
  const resolved = require.resolve(packageName, {
    paths: [
      import_node_path2.default.join(prefix, "lib", "node_modules"),
      import_node_path2.default.join(prefix, "lib64", "node_modules")
    ]
  });
  if (!resolved) {
    throw Error(`npx failed resolving ${packageName}`);
  }
  debug2(`resolved: %s`, import_kleur4.default.yellow(resolved));
  return resolved;
}

// src/lib/resolveDirectories.ts
var import_promises4 = require("fs/promises");
var import_node_path3 = __toESM(require("path"));
async function resolveDirectories(paths, preset, customDir) {
  if (customDir) {
    const resolvedDir = import_node_path3.default.resolve(customDir);
    const stat = await (0, import_promises4.lstat)(resolvedDir);
    if (stat.isDirectory()) {
      printError(`Directory "${resolvedDir}" not found.`);
      process.exit(1);
    }
    paths.unshift(resolvedDir);
  }
  const presetPackageName = getPackageName("preset", preset);
  try {
    const presetPath = await promiseFirst([
      () => require.resolve(presetPackageName),
      () => require.resolve(preset),
      () => resolveUsingNpx(presetPackageName),
      () => resolveUsingNpx(preset)
    ]);
    return [...paths, import_node_path3.default.dirname(presetPath)];
  } catch {
    printError(`Preset "${preset}" not found.

We've tried to load "${presetPackageName}" and "${preset}" npm packages.`);
    process.exit(1);
  }
}

// src/lib/TaskStore.ts
var import_glob = __toESM(require("glob"));
var import_inquirer = __toESM(require("inquirer"));
var import_kleur5 = __toESM(require("kleur"));
var mrmCore = __toESM(require("mrm-core"));
var import_node_os = require("os");
var import_node_path4 = __toESM(require("path"));
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
      this._debug("entering: %s", import_kleur5.default.yellow(dir));
      const tasks = import_glob.default.sync(`${dir}/*/index.js`);
      this._debug("\\ task count: %s", import_kleur5.default.yellow(tasks.length));
      for (const filename of tasks) {
        const taskName = import_node_path4.default.basename(import_node_path4.default.dirname(filename));
        this._debug(" | %s", import_kleur5.default.green(taskName));
        if (!allTasks[taskName]) {
          const module2 = await import(filename);
          allTasks[taskName] = module2.description || "";
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
      console.log(import_kleur5.default.yellow(`Running alias ${aliasName}...`));
    }
    this._debug("running alias: %s", import_kleur5.default.bgMagenta().white(aliasName));
    this._debug("mapped tasks: %O", aliasedTasks);
    return await this.run(aliasedTasks);
  }
  async runTask(taskName) {
    this._debug("running task: %s", import_kleur5.default.bgBlue().white(taskName));
    const modulePath = await this.resolveTask(taskName);
    if (!modulePath) {
      throw new MrmUnknownTask(`Task "${taskName}" not found.`, {
        taskName
      });
    }
    const module2 = (await import(modulePath)).default;
    if (typeof module2 !== "function") {
      throw new MrmInvalidTask(`Cannot call task "${taskName}".`, { taskName });
    }
    if (!this._argv.silent || !this._debug.enabled) {
      console.log(import_kleur5.default.cyan(`Running ${taskName}...`));
    }
    const config = await this.getTaskOptions(module2, this._argv.interactive);
    if (this._argv["examine"]) {
      console.log(import_kleur5.default.underline(`
Details for Task "${taskName}"`));
      console.log(`
Module: `, String(module2));
      console.log(`
Config: `, config);
      console.log(`
CLI Args: `, this._argv);
      return;
    } else {
      if (this._argv["useNewTaskSignature"]) {
        return module2({ config, argv: this._argv, mrmCore });
      } else {
        return module2(config, this._argv);
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
    const answers = prompts.length > 0 ? await import_inquirer.default.prompt(prompts) : {};
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
          return require.resolve(taskPackageName);
        },
        () => {
          tracer(`resolveUsingNpx(%s)`, taskPackageName);
          return resolveUsingNpx(taskPackageName);
        },
        () => {
          tracer(`require.resolve(%s)`, taskName);
          return require.resolve(taskName);
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
  import_node_path4.default.resolve((0, import_node_os.homedir)(), "dotfiles/mrm"),
  import_node_path4.default.resolve((0, import_node_os.homedir)(), ".mrm")
]);

// src/index.ts
var cliDebug = mrmDebug.extend("CLI");
var loadingDotsInterval;
async function mrm() {
  const debug2 = cliDebug;
  const argv = (0, import_minimist.default)(process.argv.slice(2), {
    alias: {
      i: "interactive"
    },
    boolean: ["silent", "dump", "dry-run", "examine", "useNewTaskSignature"]
  });
  debug2("argv: %O", argv);
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
  debug2("options: %O", options);
  MrmTasks.mergeOptions(options);
  if (!mrmDebug.enabled && !argv.silent) {
    clearInterval(loadingDotsInterval);
    console.log(import_kleur6.default.green("done"));
  }
  if (argv["dump"]) {
    console.log("\n", import_kleur6.default.yellow().underline("Options"), "\n");
    console.log(MrmTasks);
    return;
  }
  if (tasks.length === 0 || tasks[0] === "help") {
    if (!argv.silent) {
      console.log(PREFIX, import_kleur6.default.yellow("No tasks to run"));
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
      const values = unknown.map((name) => [name, (0, import_middleearth_names.random)()]);
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
      import_kleur6.default.underline("Usage"),
      getUsage(binaryName),
      import_kleur6.default.underline("Available tasks"),
      buildTasksList(allTasks)
    ].join("\n\n")
  );
  console.log("\n");
}
function getUsage(binaryName) {
  const commands = EXAMPLES.map((x) => x.join(""));
  const commandsWidth = longest(commands).length;
  return EXAMPLES.map(
    ([command, opts, description]) => [
      "   ",
      import_kleur6.default.bold(binaryName),
      import_kleur6.default.cyan(command),
      import_kleur6.default.yellow(opts),
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
    return "    " + import_kleur6.default.cyan(name.padEnd(nameColWidth)) + "  " + description;
  }).join("\n");
}
process.on("unhandledRejection", (err) => {
  cliDebug("ERROR");
  cliDebug(err);
  printError(err.message);
  process.exit(1);
});
var notifier = (0, import_update_notifier.default)({ pkg: import_package.default });
var _a;
cliDebug("current pkg version: %s", (_a = notifier.update) == null ? void 0 : _a.current);
var _a2;
cliDebug("latest pkg version: %s", (_a2 = notifier.update) == null ? void 0 : _a2.latest);
notifier.notify();
mrm();
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  mrm
});
//# sourceMappingURL=index.js.map