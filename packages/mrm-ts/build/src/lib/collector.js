import glob from 'glob';
import kleur from 'kleur';
import { createRequire } from 'node:module';
import path from 'path';
import { mrmDebug } from '../index';
const require = createRequire(import.meta.url);
export function getAllAliases(options) {
	return options.aliases ?? {};
}
export function isValidAlias(alias, options) {
	return Object.hasOwn(getAllAliases(options), alias);
}
export async function getAllTasks(directories, options) {
	const debug = mrmDebug.extend('taskCollector');
	const allTasks = options.aliases ?? {};
	debug('searching dirs: %O', directories);
	for (const dir of directories) {
		debug('entering: %s', kleur.yellow(dir));
		const tasks = glob.sync(`${dir}/*/index.js`);
		debug('\\ task count: %s', kleur.bold().yellow(tasks.length));
		for (const filename of tasks) {
			const taskName = path.basename(path.dirname(filename));
			debug(' | %s', kleur.green(taskName));
			if (!allTasks[taskName]) {
				const module = require(filename);
				allTasks[taskName] = module.description || '';
			}
		}
	}
	return allTasks;
}
//# sourceMappingURL=collector.js.map
