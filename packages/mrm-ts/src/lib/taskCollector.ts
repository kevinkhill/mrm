import glob from "glob";
import kleur from "kleur";
import path from "node:path";

import type { MrmOptions, TaskRecords } from "../types/mrm";
import { mrmDebug } from "./utils";

/**
 * Return all task and alias names and descriptions from all search directories.
 */
export async function getAllTasks(
	directories: string[],
	options: MrmOptions
): Promise<TaskRecords> {
	const debug = mrmDebug.extend("getAllTasks");
	const allTasks: TaskRecords = options.aliases ?? ({} as TaskRecords);

	debug("searching dirs: %O", directories);

	for (const dir of directories) {
		debug("entering: %s", kleur.yellow(dir));

		const tasks = glob.sync(`${dir}/*/index.js`);
		console.error(tasks);

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
