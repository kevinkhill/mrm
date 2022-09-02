import fs from 'fs';
import kleur from 'kleur';
import path from 'path';
import { mrmDebug } from '../index';
import { promiseFirst } from './promises';
export const join = (sep, items) => items.join(sep);
export function longest(input) {
	return input.reduce((a, b) => (a.length > b.length ? a : b), '');
}
export function getPackageName(type, packageName) {
	const [scopeOrTask, scopedTaskName] = packageName.split('/');
	return scopedTaskName
		? `${scopeOrTask}/mrm-${type}-${scopedTaskName}`
		: `mrm-${type}-${scopeOrTask}`;
}
export async function tryFile(directories, filename) {
	const debug = mrmDebug.extend('tryFile');
	debug('trying for %s', kleur.cyan(filename));
	try {
		return promiseFirst(
			directories.map((dir) => {
				debug('entering %s', kleur.yellow(dir));
				const filepath = path.resolve(dir, filename);
				return async () => {
					await fs.promises.access(filepath);
					debug('\\ found: %s', kleur.cyan(filepath));
					return filepath;
				};
			})
		);
	} catch (err) {
		throw new Error(`File "${filename}" not found.`);
	}
}
//# sourceMappingURL=utils.js.map
