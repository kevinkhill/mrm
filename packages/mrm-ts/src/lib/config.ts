import { forEach } from "lodash-es";
import { createRequire } from "node:module";

import { tryFile } from "./utils";

import type { CliArgs, MrmOptions } from "../types/mrm";

export async function getConfig(
	directories: string[],
	filename: string,
	argv: CliArgs
): Promise<MrmOptions> {
	const configFromFile = await getConfigFromFile(directories, filename);

	return {
		...configFromFile,
		...getConfigFromCommandLine(argv),
	} as MrmOptions;
}

/**
 * Find and load config file.
 *
 * @param {string[]} directories
 * @param {string} filename
 * @return {Promise<Object>}
 */
export async function getConfigFromFile(
	directories: string[],
	filename: string
): Promise<Partial<MrmOptions>> {
	const require = createRequire(import.meta.url);

	try {
		const filepath = await tryFile(directories, filename);

		return require(filepath);
	} catch (err) {
		return {};
	}
}

/**
 * Get config options from command line, passed as --config:foo bar.
 *
 * @param {Object} argv
 * @return {Object}
 */
export function getConfigFromCommandLine(argv: CliArgs) {
	const options = {} as Partial<MrmOptions>;

	forEach(argv, (value, key) => {
		if (key.startsWith("config:")) {
			options[key.replace(/^config:/, "")] = value;
		}
	});

	return options;
}
