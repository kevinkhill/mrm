import inquirer from "inquirer";
import kleur from "kleur";
import { createRequire } from "node:module";

import type { CliArgs, MrmOptions, MrmTask } from "../types/mrm";
import {
	MrmInvalidTask,
	MrmUndefinedOption,
	MrmUnknownAlias,
	MrmUnknownTask,
} from "./errors";
import { resolveUsingNpx } from "./npxResolver";
import { promiseFirst, promiseSeries } from "./promises";
import { getAllAliases, getPackageName, mrmDebug, tryFile } from "./utils";

/* Return the functionality of `require` from commonjs */
const require = createRequire(import.meta.url);

const debug = mrmDebug.extend("taskRunner");

/**
 * Run a single or list of tasks.
 */
export async function run(
	name: string | string[],
	directories: string[],
	options: MrmOptions,
	argv: CliArgs
): Promise<unknown> {
	debug("task list: %O", name);

	if (Array.isArray(name)) {
		return promiseSeries(name, taskName => {
			return run(taskName, directories, options, argv);
		});
	}

	const aliases = getAllAliases(options);
	if (Object.keys(aliases).includes(name)) {
		return await runAlias(name, directories, options, argv);
	}

	return await runTask(name, directories, options, argv);
}

/**
 * Run an alias.
 */
export async function runAlias(
	aliasName: string,
	directories: string[],
	options: MrmOptions,
	argv: CliArgs
): Promise<unknown> {
	const tasks = getAllAliases(options)[aliasName];

	if (!tasks) {
		throw new MrmUnknownAlias(`Alias "${aliasName}" not found.`);
	}

	if (!argv.silent || !mrmDebug.enabled) {
		console.log(kleur.yellow(`Running alias ${aliasName}...`));
	}

	debug("running alias: %s", kleur.yellow(aliasName));

	return promiseSeries(tasks, name => {
		if (tasks.includes(name)) {
			return runAlias(name, directories, options, argv);
		} else {
			return runTask(name, directories, options, argv);
		}
	});
}

/**
 * Run a task.
 */
export async function runTask(
	taskName: string,
	directories: string[],
	options: MrmOptions,
	argv: CliArgs
): Promise<unknown> {
	debug("running task: %s", kleur.magenta(taskName));

	const taskPackageName = getPackageName("task", taskName);

	let modulePath: string | null;
	try {
		modulePath = await promiseFirst([
			() => tryFile(`${taskName}/index.js`, directories),
			() => require.resolve(taskPackageName),
			() => resolveUsingNpx(taskPackageName),
			() => require.resolve(taskName),
			() => resolveUsingNpx(taskName),
		]);
	} catch {
		modulePath = null;
	}

	return new Promise((resolve, reject) => {
		if (!modulePath) {
			reject(
				new MrmUnknownTask(`Task "${taskName}" not found.`, {
					taskName,
				})
			);
			return;
		}

		const module = require(modulePath);
		if (typeof module !== "function") {
			reject(
				new MrmInvalidTask(`Cannot call task "${taskName}".`, { taskName })
			);
			return;
		}

		if (!argv.silent || !mrmDebug.enabled) {
			console.log(kleur.cyan(`Running ${taskName}...`));
		}

		Promise.resolve(getTaskOptions(module, argv.interactive, options))
			.then(config => module(config, argv))
			.then(resolve)
			.catch(reject);
	});
}

/**
 * Get task specific options, either by running Inquirer.js in interactive mode,
 * or using defaults.
 */
async function getTaskOptions(
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
