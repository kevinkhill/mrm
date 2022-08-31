import degit from "degit";
import { execa } from "execa";
import kleur from "kleur";
import makeDir from "make-dir";
import { constants } from "node:fs";
import { access } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import rimraf from "rimraf";
import which from "which";

import { CONFIG_FILENAME, TASK_CACHE_DIR } from "../constants";
import { mrmDebug } from "../mrm";
import { parseSpec } from "./parseSpec";

/**
 * @typedef DegitConfig
 * @type {object}
 * @property options {Record<"cache"|"force", boolean>}
 * @property dependencies {Record<string, string>};
 *
 * @typedef MrmOptions
 * @type {Record<string, unknown> & { degit: DegitConfig }}
 */

/**
 * Using the provided dependencies object, converts into a new object
 * with the spec as the key, to get the mapping to its' target dir
 *
 * @param dependencies {object}
 * @return string[]
 */
export function getDegitPathMappings(dependencies) {
	return Object.entries(dependencies).reduce(
		(prev, [dest, entry]) => ({ ...prev, [entry]: dest }),
		{}
	);
}

/**
 * Download and install the dependencies of extra tasks with degit
 *
 * @param options {MrmOptions}
 * @return string[]
 */
export async function installDegitDependencies(options) {
	const debug = mrmDebug.extend("degitInstaller");

	// Ensure the cache dir is available
	makeDir(TASK_CACHE_DIR);
	debug("local task cache: %s", kleur.yellow(TASK_CACHE_DIR));

	if (options.refreshLocalTaskCache) {
		const taskGlob = `${TASK_CACHE_DIR}/*`;
		debug.extend("rimraf")("cleaning...");
		await promisify(rimraf)(taskGlob);
	}

	const degitConfig = options.degit;

	if (!degitConfig) {
		throw new Error(
			`You must provide the ".degit" config property in "${CONFIG_FILENAME}" to use this feature.`
		);
	}

	const { dependencies } = degitConfig;
	debug("dependencies from config: %O", dependencies);

	const pkgInstaller = async degitSpec => {
		debug("resolving: %s", kleur.yellow(degitSpec));
		const resolvedPath = await resolveUsingDegit(degitSpec, options);
		debug("resolved: %s", kleur.yellow(resolvedPath));
		return resolvedPath;
	};

	const packageSpecs = Object.values(dependencies);

	return Promise.allSettled(packageSpecs.map(pkgSpec => pkgInstaller(pkgSpec)));
}

/**
 * Resolve a module on-the-fly using degit under the hood
 *
 * @param  {string} packageName
 * @param  {MrmOptions} options
 * @return {Promise<string>}
 */
export async function resolveUsingDegit(packageName, options) {
	const debug = mrmDebug.extend("resolveUsingDegit");

	// Grab the props we need from the options
	const { options: degitOptions, dependencies } = options.degit;

	// Assign the destination before mutating the spec string
	const pathMappings = getDegitPathMappings(dependencies);
	const destPath = path.join(TASK_CACHE_DIR, pathMappings[packageName]);
	const details = parseSpec(packageName);
	// Parse out the username / scope
	// if (packageName.includes(':')) {
	// 	packageName = packageName.split(':')[1];
	// }
	// const [userOrScope, taskName] = packageName.split('/');

	debug(details);
	debug(`destination: %s`, kleur.yellow(destPath));

	// debug(`package name: %s`, kleur.blue(packageName));
	// debug(`user / scope: %s`, kleur.blue(userOrScope));
	// debug(`task name: %s`, kleur.blue(taskName));

	// Setup degit with the source spec and options
	const emitter = degit(packageName, {
		cache: degitOptions.cache ?? true,
		force: degitOptions.force ?? false,
		verbose: debug.enabled,
	});
	emitter.on("warn", e => debug(e.message));
	emitter.on("info", e => console.log(e.message));

	await emitter.clone(destPath);

	debug("entering: %s", kleur.yellow(destPath));

	// try {
	// 	const lockFile = 'package-lock.json';
	// 	await access(path.join(destPath, lockFile), constants.R_OK);
	// 	debug('%s found; skipping dependency install', lockFile);
	// } catch (_) {
	debug("installing dependencies");
	const npm = await which("npm");
	const { stdout } = await execa(npm, ["install"], { cwd: destPath });
	debug(stdout);
	// }

	return destPath;
}
