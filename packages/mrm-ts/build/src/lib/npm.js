import { execa } from 'execa';
import kleur from 'kleur';
import { lstat } from 'node:fs/promises';
import path from 'node:path';
import which from 'which';
import { mrmDebug } from '../index';
export async function npmCommand(command, cwd) {
	const debug = mrmDebug.extend('npmCommand');
	const npm = await which('npm');
	debug('entering: %s', cwd);
	debug('command: %s', command);
	return await execa(npm, command, { cwd });
}
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
//# sourceMappingURL=npm.js.map
