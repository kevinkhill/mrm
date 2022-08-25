// @ts-check

import npx from 'libnpx';
import { createRequire } from 'node:module';
import path from 'node:path';
import which from 'which';

import { mrmDebug } from './index.mjs';

const { resolve } = createRequire(import.meta.url);

/**
 * Resolve a module on-the-fly using npx under the hood
 *
 * @param  {string} packageName
 * @return {Promise<string>}
 */
export async function resolveUsingNpx(packageName) {
	const debug = mrmDebug.extend('npxResolver');
	const npm = await which('npm');

	debug(`npx._ensurePackages('%s')`, packageName);
	const { prefix } = await npx._ensurePackages(packageName, {
		npm,
		q: !mrmDebug.enabled,
	});

	debug(`npx temp dir`, prefix);
	const resolved = resolve(packageName, {
		paths: [
			path.join(prefix, 'lib', 'node_modules'),
			path.join(prefix, 'lib64', 'node_modules'),
		],
	});

	if (!resolved) {
		throw Error(`npx failed resolving ${packageName}`);
	}

	debug(`+++ %s`, resolved);
	return resolved;
}
