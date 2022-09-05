import kleur from "kleur";
import npx from "libnpx";
import { lstat } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import which from "which";

import { promiseFirst } from "./promises";
import { getPackageName, mrmDebug, printError } from "./utils";

const NPX_RESOLVER_QUIET = true;

// Return the functionality of `require` from commonjs
const require = createRequire(import.meta.url);

/**
 * Resolve a set of directories using npx
 */
export async function resolveDirectories(
	paths: string[],
	preset: string,
	customDir?: string
): Promise<string[]> {
	// Custom config / tasks directory
	if (customDir) {
		const resolvedDir = path.resolve(customDir);
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
		process.exit(1);
	}
}

/**
 * Resolve a module on-the-fly using npx under the hood
 */
export async function resolveUsingNpx(packageName: string): Promise<string> {
	const debug = mrmDebug.extend("npxResolver");
	const npm = await which("npm");

	debug(`ensure packages: %s`, kleur.bold().cyan(packageName));
	const { prefix } = await npx._ensurePackages(packageName, {
		npm,
		q: NPX_RESOLVER_QUIET,
	});

	debug(`temp dir: %s`, kleur.yellow(prefix));
	const resolved = require.resolve(packageName, {
		paths: [
			path.join(prefix, "lib", "node_modules"),
			path.join(prefix, "lib64", "node_modules"),
		],
	});

	if (!resolved) {
		throw Error(`npx failed resolving ${packageName}`);
	}

	debug(`resolved: %s`, kleur.yellow(resolved));

	return resolved;
}
