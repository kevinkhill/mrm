import { lstat } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";

import { resolveUsingNpx } from "./npxResolver";
import { promiseFirst } from "./promises";
import { getPackageName, printError } from "./utils";

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

	// const require = createRequire(import.meta.url);
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
