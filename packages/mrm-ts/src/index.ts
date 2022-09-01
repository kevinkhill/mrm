import Debug from "debug";
import inquirer from "inquirer";
import kleur from "kleur";
import { partition } from "lodash-es";
import { createRequire } from "node:module";

import {
	MrmInvalidTask,
	MrmUndefinedOption,
	MrmUnknownAlias,
	MrmUnknownTask,
} from "./errors";
import { getAllAliases, isValidAlias } from "./lib/collector";
import { promiseFirst, promiseSeries } from "./lib/promises";
import { resolveUsingNpx } from "./lib/resolveUsingNpx";
import { getPackageName, tryFile } from "./lib/utils";

import type { CliArgs, MrmOptions, MrmTask } from "./types/mrm";

/* Return the functionality of `require` from commonjs */
const require = createRequire(import.meta.url);

export const mrmDebug = Debug("mrm");

/**
 * Run a task
 */
export function run(
	taskList: string | string[],
	directories: string[],
	options: MrmOptions,
	argv: CliArgs
): Promise<any> {
	if (Array.isArray(taskList)) {
		return promiseSeries(taskList, task => {
			return run(task, directories, options, argv);
		});
	} else {
		const task = taskList;

		if (isValidAlias(task, options)) {
			return runAlias(task, directories, options, argv);
		}

		return runTask(task, directories, options, argv);
	}
}

/**
 * Run an alias.
 */
export async function runAlias(
	aliasName: string,
	directories: string[],
	options: MrmOptions,
	argv: CliArgs
): Promise<any> {
	const tasks = getAllAliases(options)[aliasName];

	if (!tasks) {
		throw new MrmUnknownAlias(`Alias "${aliasName}" not found.`);
	}

	console.log(kleur.yellow(`Running alias ${aliasName}...`));

	return promiseSeries(tasks, name => {
		const runner = isValidAlias(name, options) ? runAlias : runTask;

		return runner(name, directories, options, argv);
	});
}

/**
 * Run a task.
 *
 * @param {string} taskName
 * @param {string[]} directories
 * @param {Object} options
 * @param {Object} [argv]
 * @returns {Promise}
 */
export async function runTask(
	taskName: string,
	directories: string[],
	options: MrmOptions,
	argv: CliArgs
): Promise<string> {
	const taskPackageName = getPackageName("task", taskName);

	let modulePath: string | null;
	try {
		modulePath = await promiseFirst([
			() => tryFile(directories, `${taskName}/index.js`),
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

		console.log(kleur.cyan(`Running ${taskName}...`));

		Promise.resolve(getTaskOptions(module, argv.interactive, options))
			.then(config => module(config, argv))
			.then(resolve)
			.catch(reject);
	});
}

/**
 * Get task specific options, either by running Inquirer.js in interactive mode,
 * or using defaults.
 *
 * @param task executing function of the task
 * @param interactive Whether or not interactive mode is enabled.
 * @param options Default available options passed into the task.
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
	const [prompts, statics] = partition(
		allOptions,
		option => interactive && option.type !== "config"
	);

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
