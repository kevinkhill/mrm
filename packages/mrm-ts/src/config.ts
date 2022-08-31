import { forEach } from "lodash-es";
import { createRequire } from "node:module";

import { tryFile } from "./lib/tryFile";

export async function getConfig(
	directories: string[],
	filename: string,
	argv: Record<string, unknown>
): Promise<Record<string, unknown>> {
	const configFromFile = await getConfigFromFile(directories, filename);
	return { ...configFromFile, ...getConfigFromCommandLine(argv) };
}

/**
 * Find and load config file.
 *
 * @param {string[]} directories
 * @param {string} filename
 * @return {Promise<Object>}
 */
export async function getConfigFromFile(
	directories,
	filename
): Promise<Record<string, unknown>> {
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
export function getConfigFromCommandLine(argv) {
	const options = {};
	forEach(argv, (value, key) => {
		if (key.startsWith("config:")) {
			options[key.replace(/^config:/, "")] = value;
		}
	});
	return options;
}
