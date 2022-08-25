// @ts-check

import execa from 'execa';
import kleur from 'kleur';
import { lstat } from 'node:fs/promises';
import path from 'node:path';
import which from 'which';

import { TASK_CACHE_DIR } from './constants.mjs';
import { mrmDebug, resolveUsingDegit } from './index.mjs';

/**
 * Run an `npm` command in a directory
 *
 * @return Promise<execa.ExecaReturnValue<string>>
 */
export async function npmCommand(command, cwd) {
	const debug = mrmDebug.extend('npmCommand');

	const npm = await which('npm');

	debug('entering: %s', cwd);
	debug('command: %s', command);

	const { stdout } = await execa(npm, command, { cwd });

	return stdout;
}

/**
 * Install `mrm-preset-default` into the local cache with `npm`
 */
export async function ensureDefaultTasksAvailable(options) {
	const debug = mrmDebug.extend('ensureDefaultTasks');

	// const initOutput = await npmCommand(['init', '-y'], TASK_CACHE_DIR);
	// debug(initOutput);

	// const installOutput = await npmCommand(
	// 	['install', '--save', 'mrm-preset-default'],
	// 	TASK_CACHE_DIR
	// );
	// debug(installOutput);
	return await resolveUsingDegit('sapegin/mrm', options);
	// return await installWithNpm('mrm-preset-default', TASK_CACHE_DIR);
}

/**
 * Install a package with `npm`
 *
 * @param pkgSpec {string}
 * @param cwd {string}
 * @return string
 */
export async function installWithNpm(pkgSpec, cwd) {
	const debug = mrmDebug.extend('npmInstaller');
	const resolvedDir = path.resolve(cwd);

	const stat = await lstat(resolvedDir);
	if (!stat.isDirectory()) {
		throw new Error(`"${cwd}" did not resolve to a directory.`);
	}

	debug('entering: %s', kleur.yellow(resolvedDir));

	try {
		const npm = await which('npm');
		const { stdout } = await execa(npm, ['install', pkgSpec], { cwd });
		debug(stdout);
		return resolvedDir;
	} catch (_) {
		throw new Error(`Directory "${resolvedDir}" not found.`);
	}
}
