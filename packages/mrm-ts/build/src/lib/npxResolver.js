import kleur from 'kleur';
import npx from 'libnpx';
import { lstat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import which from 'which';
import { mrmDebug } from '../index';
import { printError } from './console';
import { promiseFirst } from './promises';
import { getPackageName } from './utils';
const NPX_RESOLVER_QUIET = true;
const require = createRequire(import.meta.url);
export async function resolveDirectories(paths, preset, customDir) {
	if (customDir) {
		const resolvedDir = path.resolve(customDir);
		const stat = await lstat(resolvedDir);
		if (stat.isDirectory()) {
			printError(`Directory "${resolvedDir}" not found.`);
			process.exit(1);
		}
		paths.unshift(resolvedDir);
	}
	const presetPackageName = getPackageName('preset', preset);
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
export async function resolveUsingNpx(packageName) {
	const debug = mrmDebug.extend('npxResolver');
	const npm = await which('npm');
	debug(`npx._ensurePackages('%s')`, packageName);
	const { prefix } = await npx._ensurePackages(packageName, {
		npm,
		q: NPX_RESOLVER_QUIET,
	});
	debug(`npx temp dir`, kleur.yellow(prefix));
	const resolved = require.resolve(packageName, {
		paths: [
			path.join(prefix, 'lib', 'node_modules'),
			path.join(prefix, 'lib64', 'node_modules'),
		],
	});
	debug(`package: %s`, kleur.yellow(resolved));
	debug(`resolved: %s`, kleur.yellow(resolved));
	if (!resolved) {
		throw Error(`npx failed resolving ${packageName}`);
	}
	debug(`+++ %s`, resolved);
	return resolved;
}
//# sourceMappingURL=npxResolver.js.map
