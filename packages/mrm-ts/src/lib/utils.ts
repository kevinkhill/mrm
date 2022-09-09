import Debug from "debug";
import fs from "fs";
import kleur from "kleur";
import { lstatSync } from "node:fs";
import { lstat } from "node:fs/promises";
import path from "node:path";

import type { MrmOptions } from "../types/mrm";
import { promiseFirst } from "./promises";

export const mrmDebug = Debug("mrm");

/**
 * Find the longest string in an array
 */
export function longest(input: string[]): string {
	return input.reduce((a, b) => (a.length > b.length ? a : b), "");
}

/**
 * Test if a path exists
 */
export async function isDir(dir: string): Promise<boolean> {
	const stat = await lstat(path.resolve(dir));
	return stat.isDirectory();
}

/**
 * Test if a path exists, synchronously
 */
export function isDirSync(dir: string): boolean {
	const stat = lstatSync(path.resolve(dir));
	return stat.isDirectory();
}

/**
 * Pretty Error messages
 */
export function printError(message: string) {
	console.log();
	console.error(kleur.bold().red(message));
	console.log();
}

/**
 * Get all aliases from the options
 */
export function getAllAliases(options: MrmOptions) {
	return options?.aliases ?? {};
}

/**
 * Returns the correct `mrm-` prefixed package name
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
 * Turn a list of items into a natural, readable list
 *
 * Code adapted from `lisitify`
 * @link https://github.com/ljharb/listify
 */
export function toNaturalList(
	list: string[],
	separator = ", ",
	finalWord = "and"
): string {
	const trimmed = list.filter(item => item.trim());
	const head = trimmed.slice(0, -1).join(separator);
	const tail = `${finalWord} ${trimmed[trimmed.length - 1]}`;

	return [head, tail].join(separator);
}

/**
 * Try to load a file from a list of folders.
 */
export async function tryFile(
	filename: string,
	directories: string[]
): Promise<string> {
	const debug = mrmDebug.extend("tryFile");
	debug("trying for %s", kleur.cyan(filename));

	try {
		return promiseFirst(
			directories.map(dir => {
				const filepath = path.resolve(dir, filename);
				return async function (): Promise<string> {
					debug("entering: %s", kleur.yellow(dir));
					await fs.promises.access(filepath);
					debug(" | %s", kleur.green(filepath));
					return filepath;
				};
			})
		);
	} catch (err) {
		throw new Error(`File "${filename}" not found.`);
	}
}
