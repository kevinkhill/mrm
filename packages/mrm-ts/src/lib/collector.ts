import glob from "glob";
import kleur from "kleur";
import { createRequire } from "node:module";
import path from "path";

import { mrmDebug } from "../index";
import type { MrmOptions } from "../types/mrm";

// Return the functionality of `require` from commonjs
const require = createRequire(import.meta.url);

/**
 * Get all aliases from the options
 */
export function getAllAliases(options: MrmOptions): MrmOptions["aliases"] {
	return options.aliases ?? {};
}

/**
 * Check if a alias is a valid
 */
export function isValidAlias(alias: string, options: MrmOptions): boolean {
	return Object.hasOwn(getAllAliases(options), alias);
}

/**
 * Return all task and alias names and descriptions from all search directories.
 */
export async function getAllTasks(
	directories: string[],
	options: Partial<MrmOptions>
): Promise<Record<string, string[]>> {
	const debug = mrmDebug.extend("taskCollector");

	const allTasks = options.aliases ?? {};

	debug("searching dirs: %O", directories);

	for (const dir of directories) {
		debug("entering: %s", kleur.yellow(dir));

		const tasks = glob.sync(`${dir}/*/index.js`);

		debug("\\ task count: %s", kleur.bold().yellow(tasks.length));

		for (const filename of tasks) {
			const taskName = path.basename(path.dirname(filename));

			debug(" | %s", kleur.green(taskName));

			if (!allTasks[taskName]) {
				const module = require(filename);
				allTasks[taskName] = module.description || "";
			}
		}
	}

	return allTasks;
}
