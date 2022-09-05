import inquirer from "inquirer";
import kleur from "kleur";
import { createRequire } from "node:module";

import type { CliArgs, MrmOptions, MrmTask } from "../types/mrm";
import {
	MrmInvalidTask,
	MrmPathNotExist,
	MrmUndefinedOption,
	MrmUnknownAlias,
	MrmUnknownTask,
} from "./errors";
import { resolveUsingNpx } from "./npxResolver";
import { promiseFirst, promiseSeries } from "./promises";
import {
	getAllAliases,
	getPackageName,
	isDirSync,
	mrmDebug,
	tryFile,
} from "./utils";

/* Return the functionality of `require` from commonjs */

const debug = mrmDebug.extend("taskRunner");

export class TaskStore {
	_directories: string[];
	_options: MrmOptions;
	_argv: CliArgs;
	require: NodeRequire;

	constructor(directories: string[], options: MrmOptions, argv: CliArgs) {
		this._directories = directories;
		this._options = options;
		this._argv = argv;

		this.require = createRequire(import.meta.url);
	}

	/**
	 * Add a new directory to the search path.
	 */
	addDirToPath(dir: string) {
		if (!isDirSync(dir)) {
			throw new MrmPathNotExist(`Could not resolve the given path: ${dir}`);
		}

		this._directories.push(dir);
	}

	/**
	 * Run a single or list of tasks.
	 */
	async run(
		taskList: string | string[],
		directories: string[],
		options: MrmOptions,
		argv: CliArgs
	): Promise<any> {
		if (Array.isArray(taskList)) {
			debug("task list: %O", taskList);

			return promiseSeries(taskList, task => {
				return this.run(task, directories, options, argv);
			});
		}

		if (isValidAlias(taskList, options)) {
			return await this.runAlias(taskList, directories, options, argv);
		}

		return await this.runTask(taskList, directories, options, argv);
	}

	/**
	 * Run an alias.
	 */
	async runAlias(
		aliasName: string,
		directories: string[],
		options: MrmOptions,
		argv: CliArgs
	): Promise<any> {
		const taskList = getAllAliases(options)[aliasName];

		if (!taskList) {
			throw new MrmUnknownAlias(`Alias "${aliasName}" not found.`);
		}

		if (!argv.silent || !mrmDebug.enabled) {
			console.log(kleur.yellow(`Running alias ${aliasName}...`));
		}

		debug("%s aliases tasks: %O", aliasName, taskList);

		return promiseSeries(taskList, name => {
			if (isValidAlias(name, options)) {
				return this.runAlias(name, directories, options, argv);
			}

			return this.runTask(name, directories, options, argv);
		});
	}

	/**
	 * Run a task.
	 */
	async runTask(
		taskName: string,
		directories: string[],
		options: MrmOptions,
		argv: CliArgs
	): Promise<void> {
		debug("running task: %s", kleur.cyan(taskName));

		const taskPackageName = getPackageName("task", taskName);

		let modulePath: string | null;
		try {
			modulePath = await promiseFirst([
				() => tryFile(`${taskPackageName}/index.js`, directories),
				() => this.require.resolve(taskPackageName),
				() => resolveUsingNpx(taskPackageName),
				() => this.require.resolve(taskName),
				() => resolveUsingNpx(taskName),
			]);
		} catch {
			modulePath = null;
		}

		if (!modulePath) {
			throw new MrmUnknownTask(`Task "${taskName}" not found.`, {
				taskName,
			});
		}

		const taskModule = await import(modulePath);
		if (typeof taskModule !== "function") {
			throw new MrmInvalidTask(`Cannot call task "${taskName}".`, { taskName });
		}

		if (!argv.silent || !mrmDebug.enabled) {
			console.log(kleur.cyan(`Running ${taskName}...`));
		}

		const config = await this.getTaskOptions(
			taskModule,
			argv.interactive,
			options
		);

		return taskModule(config, argv);
	}

	/**
	 * Get task specific options, either by running Inquirer.js in interactive mode,
	 * or using defaults.
	 */
	async getTaskOptions(
		task: MrmTask,
		interactive = false,
		options: Partial<MrmOptions> = {}
	): Promise<Partial<MrmOptions>> {
		// If no parameters set, resolve to default options (from config file or command line).
		if (!task.parameters) {
			return options;
		}

		const parameters = Object.entries(task.parameters);

		const allOptions = await Promise.all(
			parameters.map(async ([name, param]) => ({
				...param,
				name,
				default:
					// Merge available default options with parameter initial values
					typeof options[name] !== "undefined"
						? options[name]
						: typeof param.default === "function"
						? await param.default(options)
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
}
