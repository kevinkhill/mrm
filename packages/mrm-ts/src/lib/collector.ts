import glob from "glob";
import kleur from "kleur";
import forEach from "lodash-es/forEach";
import { createRequire } from "node:module";
import path from "path";

import { mrmDebug } from "..";
import { MrmOptions } from "../types/mrm";

/**
 * Check if a alias is a valid
 */
export function isValidAlias(alias: string, options: MrmOptions): boolean {
	return Object.hasOwn(getAllAliases(options), alias);
}

/**
 * Get all aliases from the options
 */
export function getAllAliases(options: MrmOptions): MrmOptions["aliases"] {
	return options.aliases ?? {};
}

/**
 * Return all task and alias names and descriptions from all search directories.
 */
export async function getAllTasks(
	directories: string[],
	options: MrmOptions
): Promise<Record<string, string[]>> {
	const debug = mrmDebug.extend("taskCollector");

	// Return the functionality of `require` from commonjs
	const require = createRequire(import.meta.url);
	const allTasks = getAllAliases(options);

	debug("searching dirs: %O", directories);

	forEach(directories, dir => {
		debug("entering: %s", kleur.yellow(dir));

		const tasks = glob.sync(`${dir}/*/index.js`);

		debug("\\ task count: %s", kleur.bold().yellow(tasks.length));

		forEach(tasks, filename => {
			const taskName = path.basename(path.dirname(filename));

			debug(" | %s", kleur.green(taskName));

			if (!allTasks[taskName]) {
				const module = require(filename);
				allTasks[taskName] = module.description || "";
			}
		});
	});

	return allTasks;
}
