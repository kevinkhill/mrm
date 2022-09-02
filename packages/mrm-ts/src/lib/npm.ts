import { execa, ExecaReturnValue } from "execa";
import kleur from "kleur";
import { lstat } from "node:fs/promises";
import path from "node:path";
import which from "which";

import { TASK_CACHE_DIR } from "../constants";
import { mrmDebug } from "../index";
import { MrmOptions } from "../types/mrm";
import { resolveUsingDegit } from "./degit";

/**
 * Run an `npm` command in a directory
 */
export async function npmCommand(
	command: string[],
	cwd: string
): Promise<ExecaReturnValue<string>> {
	const debug = mrmDebug.extend("npmCommand");

	const npm = await which("npm");

	debug("entering: %s", cwd);
	debug("command: %s", command);

	return await execa(npm, command, { cwd });
}

/**
 * Install `mrm-preset-default` into the local cache with `npm`
 */
export async function ensureDefaultTasksAvailable(options: MrmOptions) {
	const debug = mrmDebug.extend("ensureDefaultTasks");

	// const initOutput = await npmCommand(['init', '-y'], TASK_CACHE_DIR);
	// debug(initOutput);

	// const installOutput = await npmCommand(
	// 	['install', '--save', 'mrm-preset-default'],
	// 	TASK_CACHE_DIR
	// );
	// debug(installOutput);
	return await resolveUsingDegit("sapegin/mrm", options);
	// return await installWithNpm('mrm-preset-default', TASK_CACHE_DIR);
}

/**
 * Install a package with `npm`
 */
export async function installWithNpm(pkgSpec: string, cwd: string): string {
	const debug = mrmDebug.extend("npmInstaller");
	const resolvedDir = path.resolve(cwd);

	const stat = await lstat(resolvedDir);
	if (!stat.isDirectory()) {
		throw new Error(`"${cwd}" did not resolve to a directory.`);
	}

	debug("entering: %s", kleur.yellow(resolvedDir));

	try {
		const npm = await which("npm");
		const { stdout } = await execa(npm, ["install", pkgSpec], { cwd });
		debug(stdout);
		return resolvedDir;
	} catch (_) {
		throw new Error(`Directory "${resolvedDir}" not found.`);
	}
}
