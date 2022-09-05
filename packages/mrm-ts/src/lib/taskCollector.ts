import glob from "glob";
import kleur from "kleur";
import path from "node:path";

import type { MrmOptions } from "../types/mrm";
import { getAllAliases, mrmDebug } from "./utils";

/**
 * Return all task and alias names and descriptions from all search directories.
 */
export async function getAllTasks(
	directories: string[],
	options: MrmOptions
): Promise<Record<string, string[] | undefined>> {
	const debug = mrmDebug.extend("getAllTasks");
	const allTasks = getAllAliases(options);

	debug("searching dirs: %O", directories);

	for (const dir of directories) {
		debug("entering: %s", kleur.yellow(dir));

		const tasks = glob.sync(`${dir}/*/index.js`);

		debug("\\ task count: %s", kleur.yellow(tasks.length));

		for (const filename of tasks) {
			const taskName = path.basename(path.dirname(filename));

			debug(" | %s", kleur.green(taskName));

			if (!allTasks[taskName]) {
				const module = await import(filename);
				allTasks[taskName] = module.description || "";
			}
		}
	}

	return allTasks;
}
