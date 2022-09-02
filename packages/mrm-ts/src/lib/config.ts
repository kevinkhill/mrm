import { forEach } from "lodash-es";
import { createRequire } from "node:module";

import { CONFIG_FILENAME } from "../constants";
import type { CliArgs, MrmOptions } from "../types/mrm";
import { tryFile } from "./utils";
/**
 * Load the configuration from file and command line
 */
export async function getConfig(
	directories: string[],
	argv: CliArgs
): Promise<MrmOptions> {
	const configFromFile = await getConfigFromFile(directories);

	return {
		...configFromFile,
		...getConfigFromCommandLine(argv),
	} as MrmOptions;
}

/**
 * Find and load config file.
 */
export async function getConfigFromFile(
	directories: string[]
): Promise<Partial<MrmOptions>> {
	const require = createRequire(import.meta.url);

	try {
		const filepath = await tryFile(directories, CONFIG_FILENAME);

		return require(filepath);
	} catch (err) {
		return {};
	}
}

/**
 * Get config options from command line, passed as --config:foo bar.
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
