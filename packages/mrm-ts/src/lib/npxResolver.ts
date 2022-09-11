import kleur from "kleur";
import npx from "libnpx";
import path from "node:path";
import which from "which";

import { NPX_RESOLVER_QUIET } from "../constants";
import { mrmDebug } from "./utils";

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
