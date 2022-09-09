import kleur from "kleur";
import { spawn, SpawnOptionsWithoutStdio } from "node:child_process";
import { lstat } from "node:fs/promises";
import path from "node:path";
import which from "which";

import { mrmDebug } from "./utils";

async function npmAsync(
	command: string[],
	options?: SpawnOptionsWithoutStdio
): Promise<string> {
	const npm = await which("npm");

	return new Promise((resolve, reject) => {
		let data = "";
		let error = "";
		const process = spawn(npm, command, options);
		process.stdout.on("data", stdout => (data += stdout.toString()));
		process.stderr.on("data", stderr => (error += stderr.toString()));
		process.on("error", err => reject(err));
		process.on("close", code => {
			code !== 0 ? reject(error) : resolve(data);
			process.stdin.end();
		});
	});
}

/**
 * Run an `npm` command in a directory
 */
export async function npmCommand(
	command: string[],
	cwd: string
): Promise<string> {
	const debug = mrmDebug.extend("npmCommand");

	debug("entering: %s", cwd);
	debug("command: %s", command);

	return await npmAsync(command, { cwd });
}

/**
 * Install a package with `npm`
 */
export async function installWithNpm(
	pkgSpec: string,
	cwd: string
): Promise<string> {
	const debug = mrmDebug.extend("npmInstaller");
	const resolvedDir = path.resolve(cwd);

	const stat = await lstat(resolvedDir);
	if (!stat.isDirectory()) {
		throw new Error(`"${cwd}" did not resolve to a directory.`);
	}

	debug("entering: %s", kleur.yellow(resolvedDir));

	try {
		const stdout = await npmAsync(["install", pkgSpec], { cwd });
		debug(stdout);
		return resolvedDir;
	} catch (_) {
		throw new Error(`Directory "${resolvedDir}" not found.`);
	}
}
