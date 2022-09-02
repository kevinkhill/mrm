import inquirer from 'inquirer';
import kleur from 'kleur';
import { createRequire } from 'node:module';
import {
	MrmInvalidTask,
	MrmUndefinedOption,
	MrmUnknownAlias,
	MrmUnknownTask,
} from '../errors';
import { getAllAliases, isValidAlias } from './collector';
import { resolveUsingNpx } from './npxResolver';
import { promiseFirst, promiseSeries } from './promises';
import { getPackageName, tryFile } from './utils';
const require = createRequire(import.meta.url);
export function run(taskList, directories, options, argv) {
	if (Array.isArray(taskList)) {
		return promiseSeries(taskList, (task) => {
			return run(task, directories, options, argv);
		});
	}
	const task = taskList;
	if (isValidAlias(task, options)) {
		return runAlias(task, directories, options, argv);
	}
	return runTask(task, directories, options, argv);
}
export async function runAlias(aliasName, directories, options, argv) {
	const tasks = getAllAliases(options)[aliasName];
	if (!tasks) {
		throw new MrmUnknownAlias(`Alias "${aliasName}" not found.`);
	}
	console.log(kleur.yellow(`Running alias ${aliasName}...`));
	return promiseSeries(tasks, (name) => {
		const runner = isValidAlias(name, options) ? runAlias : runTask;
		return runner(name, directories, options, argv);
	});
}
export async function runTask(taskName, directories, options, argv) {
	const taskPackageName = getPackageName('task', taskName);
	let modulePath;
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
		if (typeof module !== 'function') {
			reject(
				new MrmInvalidTask(`Cannot call task "${taskName}".`, { taskName })
			);
			return;
		}
		console.log(kleur.cyan(`Running ${taskName}...`));
		Promise.resolve(getTaskOptions(module, argv.interactive, options))
			.then((config) => module(config, argv))
			.then(resolve)
			.catch(reject);
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
			default:
				typeof options[name] !== 'undefined'
					? options[name]
					: typeof param.default === 'function'
					? await param.default(options)
					: param.default,
		}))
	);
	const prompts = allOptions.filter(
		(option) => interactive && option.type !== 'config'
	);
	const statics = allOptions.filter((i) => prompts.indexOf(i) > -1);
	const invalid = statics.filter((param) =>
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
	const answers = prompts.length > 0 ? await inquirer.prompt(prompts) : {};
	const values = { ...answers };
	for (const param of statics) {
		values[param.name] = param.default;
	}
	return values;
}
//# sourceMappingURL=taskRunner.js.map
