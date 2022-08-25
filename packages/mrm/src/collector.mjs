// @ts-check

import glob from 'glob';
import kleur from 'kleur';
import { createRequire } from 'node:module';
import path from 'path';

import { mrmDebug } from './index.mjs';

/* Return the functionality of `require` from commonjs */
const require = createRequire(import.meta.url);

/**
 * Get all aliases from the options
 *
 * @param {Object} options
 * @return {Object}
 */
export function getAllAliases(options) {
	return options.aliases ?? {};
}

/**
 * Return all task and alias names and descriptions from all search directories.
 *
 * @param {string[]} directories
 * @param {Object} options
 * @return {Promise<Object>}
 */
export async function getAllTasks(directories, options) {
	const debug = mrmDebug.extend('getAllTasks');
	const allTasks = getAllAliases(options);

	debug('searching dirs: %O', directories);

	directories.forEach(dir => {
		debug('entering: %s', kleur.yellow(dir));
		const tasks = glob.sync(`${dir}/*/index.js`);
		debug('\\ task count: %s', kleur.bold().cyan(tasks.length));

		tasks.forEach(filename => {
			const taskName = path.basename(path.dirname(filename));
			debug(' | %s', kleur.green(taskName));
			if (!allTasks[taskName]) {
				const module = require(filename);
				allTasks[taskName] = module.description || '';
			}
		});
	});

	return allTasks;
}
