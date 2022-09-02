import { createRequire } from 'node:module';
import { CONFIG_FILENAME } from '../constants';
import { tryFile } from './utils';
export async function getConfig(directories, argv) {
	const configFromFile = await getConfigFromFile(directories);
	return {
		...configFromFile,
		...getConfigFromCommandLine(argv),
	};
}
export async function getConfigFromFile(directories) {
	const require = createRequire(import.meta.url);
	try {
		const filepath = await tryFile(directories, CONFIG_FILENAME);
		return require(filepath);
	} catch (err) {
		return {};
	}
}
export function getConfigFromCommandLine(argv) {
	const options = {};
	for (const [value, key] of Object.entries(argv)) {
		if (key.startsWith('config:')) {
			options[key.replace(/^config:/, '')] = value;
		}
	}
	return options;
}
//# sourceMappingURL=config.js.map
