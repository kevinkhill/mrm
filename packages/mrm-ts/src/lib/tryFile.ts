import fs from "fs";
import kleur from "kleur";
import path from "path";

import { promiseFirst } from "./promises";

/**
 * Try to load a file from a list of folders.
 *
 * @param {string[]} directories
 * @param {string} filename
 * @return {Promise<string>} Absolute path or undefined
 */
// eslint-disable-next-line require-await
export async function tryFile(directories, filename): Promise<any> {
	const debug = mrmDebug.extend("tryFile");
	debug("search: %s", kleur.bold().cyan(filename));

	try {
		return promiseFirst(
			directories.map(dir => {
				debug("entering: %s", kleur.yellow(dir));
				const filepath = path.resolve(dir, filename);

				return async function () {
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
