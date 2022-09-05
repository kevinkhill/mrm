import { readFile } from "fs/promises";
import kleur from "kleur";

import { CONFIG_FILENAME } from "../constants";
import type { CliArgs, MrmOptions } from "../types/mrm";
import { mrmDebug, tryFile } from "./utils";

const debug = mrmDebug.extend("config");

/**
 * Load the configuration from file and command line
 */
export async function getConfig(
	directories: string[],
	argv: CliArgs
): Promise<MrmOptions> {
	const configFromFile = await getConfigFromFile(directories);
	debug("loaded: %O", configFromFile);

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
	try {
		const filepath = await tryFile(CONFIG_FILENAME, directories);
		debug("found: %s", kleur.green(filepath));

		return JSON.parse(await readFile(filepath, "utf8"));
	} catch (err) {
		return {};
	}
}

/**
 * Get config options from command line, passed as --config:foo bar.
 */
export function getConfigFromCommandLine(argv: CliArgs): Partial<MrmOptions> {
	return Object.keys(argv)
		.filter(k => k.startsWith("config:"))
		.reduce((options, key) => {
			return {
				...options,
				[key.replace(/^config:/, "")]: argv[key],
			};
		}, {});
}
