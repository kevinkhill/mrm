import npx from "libnpx";
import { createRequire } from "node:module";
import path from "node:path";
import which from "which";

import { getPackageName, mrmDebug } from "../mrm";
import { printError } from "./console";
import { promiseFirst } from "./promises";
import { CliArgs } from "./types";

const { resolve } = createRequire(import.meta.url);

/**
 * Resolve a module on-the-fly using npx under the hood
 *
 * @param  {string} packageName
 * @return {Promise<string>}
 */
export async function resolveUsingNpx(packageName) {
	const debug = mrmDebug.extend("npxResolver");
	const npm = await which("npm");

	debug(`npx._ensurePackages('%s')`, packageName);
	const { prefix } = await npx._ensurePackages(packageName, {
		npm,
		q: !mrmDebug.enabled,
	});

	debug(`npx temp dir`, prefix);
	const resolved = resolve(packageName, {
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

// Custom config / tasks directory
if (argv.dir) {
	const resolvedDir = path.resolve(argv.dir);
	try {
		const stat = await lstat(resolvedDir);
		if (stat.isDirectory()) {
			directories.push(resolvedDir);
		}
	} catch (_) {
		printError(`Directory "${resolvedDir}" not found.`);
		return 1;
	}
}
/**
 * Resolve a given set of directories
 */
export async function resolveDirectories(paths: string[], argv: CliArgs) {
	// Custom config / tasks directory
	if (argv.dir) {
		const resolvedDir = path.resolve(argv.dir);
		const stat = await lstat(resolvedDir);
		if (stat.isDirectory()) {
			printError(`Directory "${dir}" not found.`);
			process.exit(1);
		}

		paths.unshift(dir);
	}

	const presetPackageName = getPackageName("preset", argv.preset);
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
