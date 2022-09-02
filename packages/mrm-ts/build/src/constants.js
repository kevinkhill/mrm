import envPaths from 'env-paths';
import { homedir } from 'node:os';
import path from 'node:path';
export const CONFIG_FILENAME = 'config.json';
export const DEGIT_USE_FORCE = true;
export const DEGIT_USE_CACHE = true;
export const DEFAULT_DIRECTORIES = [
	path.resolve(homedir(), 'dotfiles/mrm'),
	path.resolve(homedir(), '.mrm'),
];
export const TASK_CACHE_DIR = envPaths('mrm', { suffix: 'tasks' }).cache;
export const EXAMPLES = [
	['', '', 'List of available tasks'],
	['<task>', '', 'Run a task or an alias'],
	['<task>', '--dir ~/unicorn', 'Custom config and tasks folder'],
	['<task>', '--preset unicorn', 'Load config and tasks from a preset'],
	[
		'<task>',
		'--config:foo coffee --config:bar pizza',
		'Override config options',
	],
];
//# sourceMappingURL=constants.js.map
