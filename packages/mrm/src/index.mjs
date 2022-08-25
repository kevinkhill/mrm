// @ts-check

import Debug from 'debug';
import fs from 'fs';
import inquirer from 'inquirer';
import kleur from 'kleur';
import { partition } from 'lodash-es';
import { createRequire } from 'node:module';
import path from 'path';

import { getAllAliases, getAllTasks } from './collector.mjs';
import { installDegitDependencies, resolveUsingDegit } from './degit.mjs';
import {
	MrmInvalidTask,
	MrmUndefinedOption,
	MrmUnknownAlias,
	MrmUnknownTask,
} from './errors.mjs';
import { ensureDefaultTasksAvailable } from './npm.mjs';
import { promiseFirst, promiseSeries } from './promises.mjs';
import { resolveUsingNpx } from './resolveUsingNpx.mjs';

export * from './config.mjs';
export * as CONSTANTS from './constants.mjs';
export {
	ensureDefaultTasksAvailable,
	getAllTasks,
	installDegitDependencies,
	MrmInvalidTask,
	MrmUndefinedOption,
	MrmUnknownAlias,
	MrmUnknownTask,
	promiseFirst,
	promiseSeries,
	resolveUsingDegit,
	resolveUsingNpx,
};

/* Return the functionality of `require` from commonjs */
const require = createRequire(import.meta.url);

export const mrmDebug = Debug('mrm');

/**
 * Returns the correct `mrm-` prefixed package name
 *
 * @param {"task" | "preset"} type
 * @param {string} packageName
 * @returns {string}
 */
export function getPackageName(type, packageName) {
	const [scopeOrTask, scopedTaskName] = packageName.split('/');
	return scopedTaskName
		? `${scopeOrTask}/mrm-${type}-${scopedTaskName}`
		: `mrm-${type}-${scopeOrTask}`;
}

/**
 * Run a task
 *
 * @param {string|string[]} name
 * @param {string[]} directories
 * @param {Object} options
 * @param {Object} argv
 * @returns {Promise<void>}
 */
export function run(name, directories, options, argv) {
	if (Array.isArray(name)) {
		return promiseSeries(name, n => {
			return run(n, directories, options, argv);
		});
	}

	if (getAllAliases(options)[name]) {
		return runAlias(name, directories, options, argv);
	}

	return runTask(name, directories, options, argv);
}

/**
 * Run an alias.
 *
 * @param {string} aliasName
 * @param {string[]} directories
 * @param {Object} options
 * @param {Object} [argv]
 * @returns {Promise<void>}
 */
export function runAlias(aliasName, directories, options, argv) {
	const tasks = getAllAliases(options)[aliasName];

	if (!tasks) {
		throw new MrmUnknownAlias(`Alias "${aliasName}" not found.`);
	}

	console.log(kleur.yellow(`Running alias ${aliasName}...`));

	return promiseSeries(tasks, name => {
		const isAlias = getAllAliases(options)[name];

		if (isAlias) {
			return runAlias(name, directories, options, argv);
		} else {
			return runTask(name, directories, options, argv);
		}
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
async function runTask(taskName, directories, options, argv) {
	const taskPackageName = getPackageName('task', taskName);

	const remoteResolver = options.useExperimentalDegitResolver
		? pkg => resolveUsingDegit(pkg, options)
		: resolveUsingNpx;

	let modulePath;
	try {
		modulePath = await promiseFirst([
			() => tryFile(directories, `${taskName}/index.js`),
			() => require.resolve(taskPackageName),
			() => remoteResolver(taskPackageName),
			() => require.resolve(taskName),
			() => remoteResolver(taskName),
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
		if (typeof module !== 'function') {
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
 * @param {Function & { parameters: Record<string,unknown>}} task
 * @param {boolean} interactive? Whether or not interactive mode is enabled.
 * @param {Record<string, any>} options? Default available options passed into the task.
 */
async function getTaskOptions(task, interactive = false, options = {}) {
	// If no parameters set, resolve to default options (from config file or command line).
	if (!task.parameters) {
		return options;
	}

	const parameters = Object.entries(task.parameters);

	const allOptions = await Promise.all(
		parameters.map(async ([name, param]) => ({
			// @ts-ignore
			...param,
			name,
			default:
				// Merge available default options with parameter initial values
				typeof options[name] !== 'undefined'
					? options[name]
					: // @ts-ignore
					typeof param.default === 'function'
					? // @ts-ignore
					  await param.default(options)
					: // @ts-ignore
					  param.default,
		}))
	);

	// Split interactive and static options
	const [prompts, statics] = partition(
		allOptions,
		option => interactive && option.type !== 'config'
	);

	// Validate static options
	const invalid = statics.filter(param =>
		param.validate ? param.validate(param.default) !== true : false
	);
	if (invalid.length > 0) {
		const names = invalid.map(({ name }) => name);
		throw new MrmUndefinedOption(
			`Missing required config options: ${names.join(', ')}.`,
			{
				unknown: names,
			}
		);
	}

	// Run Inquirer.js with interactive options
	const answers = prompts.length > 0 ? await inquirer.prompt(prompts) : {};

	// Merge answers with static defaults
	const values = { ...answers };
	for (const param of statics) {
		values[param.name] = param.default;
	}

	return values;
}

/**
 * Try to load a file from a list of folders.
 *
 * @param {string[]} directories
 * @param {string} filename
 * @return {Promise<string>} Absolute path or undefined
 */
// eslint-disable-next-line require-await
export async function tryFile(directories, filename) {
	const debug = mrmDebug.extend('tryFile');
	debug('search: %s', kleur.bold().cyan(filename));

	try {
		return promiseFirst(
			directories.map(dir => {
				debug('entering: %s', kleur.yellow(dir));
				const filepath = path.resolve(dir, filename);

				return async function () {
					await fs.promises.access(filepath);
					debug('+++ %s', kleur.green(filepath));
					return filepath;
				};
			})
		);
	} catch (err) {
		throw new Error(`File "${filename}" not found.`);
	}
}
