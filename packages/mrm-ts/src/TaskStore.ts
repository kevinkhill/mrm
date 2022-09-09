import type { Debugger } from "debug";
import glob from "glob";
import inquirer from "inquirer";
import kleur from "kleur";
import * as mrmCore from "mrm-core";
import { createRequire } from "node:module";
import { homedir } from "node:os";
import path from "node:path";

import {
	getPackageName,
	isDirSync,
	mrmDebug,
	MrmInvalidTask,
	MrmPathNotExist,
	MrmUndefinedOption,
	MrmUnknownAlias,
	MrmUnknownTask,
	promiseFirst,
	promiseSeries,
	resolveDirectories,
	resolveUsingNpx,
	tryFile,
} from "./lib";
import type { CliArgs, MrmOptions, MrmTask, TaskRecords } from "./types/mrm";

// const require = createRequire(import.meta.url);

export class TaskStore {
	preset = "default";
	initialized = false;

	get PATH(): string[] {
		return this._directories;
	}

	get options() {
		return this._options;
	}

	get aliases(): TaskRecords {
		return this._options.aliases ?? {};
	}

	get isDefaultPreset(): boolean {
		return this.preset === "default";
	}

	static DEFAULT_DIRECTORIES = [
		path.resolve(homedir(), "dotfiles/mrm"),
		path.resolve(homedir(), ".mrm"),
	];

	private _argv: CliArgs;
	private _debug: Debugger;
	private _directories: string[] = [];
	private _options: Partial<MrmOptions> = {};

	/**
	 * Build a new instance of the TaskStore
	 */
	constructor(argv: CliArgs, options?: MrmOptions) {
		this._debug = mrmDebug.extend("TaskStore");

		this._argv = argv;
		this._options = options ?? {};

		const { preset } = this._argv;

		if (preset) {
			this._debug("activating preset: %s", preset);
			this.preset = preset;
		}
	}

	/**
	 * This needs to be called before the store is used, otherwise npx will
	 * not have a chance to ensure the default preset is available.
	 */
	async initStore(directories?: string[]): Promise<void> {
		this._directories = await resolveDirectories(
			directories ?? TaskStore.DEFAULT_DIRECTORIES,
			"default",
			this._argv.dir
		);
		this.initialized = true;
	}

	/**
	 * Add a new directory to the search PATH.
	 */
	addDirToPath(dir: string) {
		if (!isDirSync(dir)) {
			throw new MrmPathNotExist(`Could not resolve the given path: ${dir}`);
		}
		this._directories.push(dir);
	}

	/**
	 * Try to find a file in the PATH.
	 */
	// async find(filename: string): Promise<string> {
	// 	return await tryFile(filename, this.PATH);
	// }

	setOption(option: string, value: unknown) {
		this._options[option] = value;
	}

	setOptions(options: Partial<MrmOptions>) {
		this._options = options;
	}

	mergeOptions(options: Partial<MrmOptions>) {
		this._options = {
			...this._options,
			...options,
		};
	}

	/**
	 * Gather all of the available tasks from the tasks PATH.
	 */
	async getAllTasks(): Promise<TaskRecords> {
		const allTasks: TaskRecords = this.aliases;

		this._debug("PATH: %O", this.PATH);

		for (const dir of this.PATH) {
			this._debug("entering: %s", kleur.yellow(dir));

			const tasks = glob.sync(`${dir}/*/index.js`);
			console.error(tasks);

			this._debug("\\ task count: %s", kleur.yellow(tasks.length));

			for (const filename of tasks) {
				const taskName = path.basename(path.dirname(filename));

				this._debug(" | %s", kleur.green(taskName));

				if (!allTasks[taskName]) {
					const module = await import(filename);
					allTasks[taskName] = module.description || "";
				}
			}
		}

		return allTasks;
	}

	/**
	 * Run a single or list of tasks.
	 */
	async run(name: string | string[]): Promise<unknown> {
		if (!this.initialized) {
			throw new Error(
				`TaskStore is not initialized. The initStore() method must be called before run()`
			);
		}

		// ensure list processing even if one task
		const taskList = [name].flat();

		this._debug("tasks to run: %O", taskList);
		this._debug("aliases: %O", this.aliases);

		return await promiseSeries(taskList, async taskName => {
			if (Object.hasOwn(this.aliases, taskName)) {
				return await this.runAlias(taskName);
			}

			return await this.runTask(taskName);
		});
	}

	/**
	 * Run an alias.
	 */
	async runAlias(aliasName: string): Promise<unknown> {
		if (Object.hasOwn(this.aliases, aliasName) === false) {
			throw new MrmUnknownAlias(`Alias "${aliasName}" not found.`);
		}

		const aliasedTasks = this.aliases[aliasName];

		if (!this._argv.silent || !this._debug.enabled) {
			console.log(kleur.yellow(`Running alias ${aliasName}...`));
		}

		this._debug("running alias: %s", kleur.bgMagenta().white(aliasName));
		this._debug("mapped tasks: %O", aliasedTasks);

		return await this.run(aliasedTasks);
	}

	/**
	 * Run a task.
	 */
	async runTask(taskName: string): Promise<unknown> {
		this._debug("running task: %s", kleur.bgBlue().white(taskName));

		const modulePath = await this.resolveTask(taskName);

		if (!modulePath) {
			throw new MrmUnknownTask(`Task "${taskName}" not found.`, {
				taskName,
			});
		}

		// replacing require()
		const module = (await import(modulePath)).default as MrmTask;

		if (typeof module !== "function") {
			throw new MrmInvalidTask(`Cannot call task "${taskName}".`, { taskName });
		}

		if (!this._argv.silent || !this._debug.enabled) {
			console.log(kleur.cyan(`Running ${taskName}...`));
		}

		// Gather the task's options
		const config = await this.getTaskOptions(module, this._argv.interactive);

		if (this._argv["examine"]) {
			// Dump details if inspecting
			console.log(kleur.underline(`\nDetails for Task "${taskName}"`));
			console.log(`\nModule: `, String(module));
			console.log(`\nConfig: `, config);
			console.log(`\nCLI Args: `, this._argv);
			return;
		} else {
			if (this._argv["useNewTaskSignature"]) {
				// Run the task, now with `mrm-core` injected to the task
				return module({ config, argv: this._argv, mrmCore });
			} else {
				// The original method of calling tasks
				return module(config, this._argv);
			}
		}
	}

	/**
	 * Get task specific options, either by running Inquirer.js in interactive mode,
	 * or using defaults.
	 */
	async getTaskOptions(
		task: MrmTask,
		interactive = false
	): Promise<Partial<MrmOptions>> {
		// If no parameters set, resolve to default options (from config file or command line).
		if (!task.parameters) {
			return this._options;
		}

		const parameters = Object.entries(task.parameters);

		const allOptions = await Promise.all(
			parameters.map(async ([name, param]) => ({
				...param,
				name,
				default:
					// Merge available default options with parameter initial values
					typeof this._options[name] !== "undefined"
						? this._options[name]
						: typeof param.default === "function"
						? await param.default(this._options)
						: param.default,
			}))
		);

		// Split interactive and static options
		const prompts = allOptions.filter(
			option => interactive && option.type !== "config"
		);
		const statics = allOptions.filter(i => prompts.indexOf(i) > -1);

		// Validate static options
		const invalid = statics.filter(param =>
			param.validate ? param.validate(param.default) !== true : false
		);

		if (invalid.length > 0) {
			const names = invalid.map(({ name }) => name);
			throw new MrmUndefinedOption(
				`Missing required config options: ${names.join(", ")}.`,
				{
					unknown: names,
				}
			);
		}

		// Run Inquirer.js with interactive options
		const answers = prompts.length > 0 ? await inquirer.prompt(prompts) : {};

		// Merge answers with static defaults
		const values: Partial<MrmOptions> = { ...answers };

		for (const param of statics) {
			values[param.name] = param.default;
		}

		return values;
	}

	// async *getFiles(dir: string): AsyncGenerator<string> {
	// 	const dirents = await readdir(dir, { withFileTypes: true });
	// 	for (const dirent of dirents) {
	// 		const res = resolve(dir, dirent.name);
	// 		if (dirent.isDirectory()) {
	// 			yield* this.getFiles(res);
	// 		} else {
	// 			yield res;
	// 		}
	// 	}
	// }

	/**
	 * @TODO [feat] Queue tasks to run?
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	queueTasks(task: string | string[]) {
		//
	}

	/**
	 * @TODO [feat] Queue tasks to run?
	 */
	async runTaskQueue() {
		//
	}

	/**
	 * Given a task name, try to resolve with all available methods.
	 */
	private async resolveTask(taskName: string): Promise<null | string> {
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
				},
			]);
		} catch {
			return null;
		}
	}
}
