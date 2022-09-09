/**
 * Stub Declaration for `middleearth-names`
 *
 * @link https://www.npmjs.com/package/middleearth-names
 */
declare module "middleearth-names" {
	export function all(): string[];
	export function random(): string;
}

/**
 * Stub Declaration for `npx`
 *
 * Extracted from https://github.com/npm/npx/blob/latest/index.js
 *
 * @link https://www.npmjs.com/package/libnpx
 */
declare module "libnpx" {
	export function _localBinPath(cwd);
	export function _getEnv(opts);
	export async function _ensurePackages(
		package: string,
		opts
	): Promise<{ prefix: string }>;
	export function _getExistingPath(command, opts);
	export function _getNpmCache(opts);
	export function _buildArgs(specs, prefix, opts);
	export function _installPackages(specs, prefix, opts);
	export function _execCommand(_existing, argv);
	export function _findNodeScript(existing, opts);
}
