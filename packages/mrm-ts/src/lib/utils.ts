import fs from "fs";
import kleur from "kleur";
import path from "path";

import { mrmDebug } from "../index";
import { promiseFirst } from "./promises";

/**
 * Find the longest string in an array
 */
export function longest(input: string[]): string {
	return input.reduce((a, b) => (a.length > b.length ? a : b), "");
}

/**
 * Returns the correct `mrm-` prefixed package name
 *
 * @param {} type
 * @param {string} packageName
 * @returns {string}
 */
export function getPackageName(
	type: "task" | "preset",
	packageName: string
): string {
	const [scopeOrTask, scopedTaskName] = packageName.split("/");
	return scopedTaskName
		? `${scopeOrTask}/mrm-${type}-${scopedTaskName}`
		: `mrm-${type}-${scopeOrTask}`;
}

/**
 * Try to load a file from a list of folders.
 */
export async function tryFile(
	directories: string[],
	filename: string
): Promise<string> {
	const debug = mrmDebug.extend("tryFile");
	debug("search: %s", kleur.bold().cyan(filename));

	try {
		return promiseFirst(
			directories.map(dir => {
				debug("entering: %s", kleur.yellow(dir));
				const filepath = path.resolve(dir, filename);

				return async (): Promise<string> => {
					await fs.promises.access(filepath);
					debug("+++ %s", kleur.green(filepath));
					return filepath;
				};
			})
		);
	} catch (err) {
		throw new Error(`File "${filename}" not found.`);
	}
}
