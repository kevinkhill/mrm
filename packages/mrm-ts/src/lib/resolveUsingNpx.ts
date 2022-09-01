import npx from "libnpx";
import { lstat } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import which from "which";

import { mrmDebug } from "../index";
import { CliArgs } from "../types/mrm";
import { printError } from "./console";
import { promiseFirst } from "./promises";
import { getPackageName } from "./utils";

/* Return the functionality of `require` from commonjs */
const require = createRequire(import.meta.url);

/**
 * Resolve a module on-the-fly using npx under the hood
 *
 * @param  {string} packageName
 * @return {Promise<string>}
 */
export async function resolveUsingNpx(packageName: string) {
	const debug = mrmDebug.extend("npxResolver");
	const npm = await which("npm");

	debug(`npx._ensurePackages('%s')`, packageName);
	const { prefix } = await npx._ensurePackages(packageName, {
		npm,
		q: !mrmDebug.enabled,
	});

	debug(`npx temp dir`, prefix);
	const resolved = require.resolve(packageName, {
		paths: [
			path.join(prefix, "lib", "node_modules"),
			path.join(prefix, "lib64", "node_modules"),
		],
	});

	if (!resolved) {
		throw Error(`npx failed resolving ${packageName}`);
	}

	debug(`+++ %s`, resolved);
	return resolved;
}

export async function resolveDirectories(
	paths: string[],
	preset: string,
	argv: CliArgs
): Promise<string[]> {
	// Custom config / tasks directory
	if (argv.dir) {
		const resolvedDir = path.resolve(argv.dir);
		const stat = await lstat(resolvedDir);
		if (stat.isDirectory()) {
			printError(`Directory "${resolvedDir}" not found.`);
			process.exit(1);
		}

		paths.unshift(resolvedDir);
	}
	const presetPackageName = getPackageName("preset", preset);
	try {
		const presetPath = await promiseFirst([
			() => require.resolve(presetPackageName),
			() => require.resolve(preset),
			() => resolveUsingNpx(presetPackageName),
			() => resolveUsingNpx(preset),
		]);
		return [...paths, path.dirname(presetPath)];
	} catch {
		printError(`Preset "${preset}" not found.

	We've tried to load "${presetPackageName}" and "${preset}" npm packages.`);
		return process.exit(1);
	}
}
