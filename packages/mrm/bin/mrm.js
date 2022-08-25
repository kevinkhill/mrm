#!/usr/bin/env node
//@ts-check

import kleur from 'kleur';
import listify from 'listify';
import { padEnd, sortBy } from 'lodash-es';
import longest from 'longest';
import { random } from 'middleearth-names';
import minimist from 'minimist';
import { readFileSync } from 'node:fs';
import { lstat } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import updateNotifier from 'update-notifier';

import {
	CONSTANTS,
	ensureDefaultTasksAvailable,
	getAllTasks,
	getConfig,
	getPackageName,
	installDegitDependencies,
	mrmDebug,
	MrmInvalidTask,
	MrmUndefinedOption,
	MrmUnknownAlias,
	MrmUnknownTask,
	promiseFirst,
	resolveUsingDegit,
	resolveUsingNpx,
	run,
} from '../src/index.mjs';

const { CONFIG_FILENAME, DEFAULT_DIRECTORIES, EXAMPLES, TASK_CACHE_DIR } =
	CONSTANTS;

const cliDebug = mrmDebug.extend('cli');

/* Return the functionality of `require` from commonjs */
const require = createRequire(import.meta.url);

/**
 * mrm, the cli tool
 *
 * Some new fun flags:
 * --useExperimentalDegitResolver
 *    This will use the new degit resolver for downloading and npm for installing deps
 *
 * --refreshLocalTaskCache
 *    This will wipe the local task cache, for degit to re-populate
 *
 */
async function main() {
	const debug = cliDebug;
	const argv = minimist(process.argv.slice(2), {
		alias: {
			i: 'interactive',
		},
		boolean: ['dryRun'],
	});

	debug(argv);

	// Collect positional args as tasks to run
	const tasks = argv._;
	const { dryRun, useExperimentalDegitResolver, refreshLocalTaskCache } = argv;

	if (useExperimentalDegitResolver) {
		console.log(kleur.bgYellow().red('Experimental degit resolver activated.'));
	}

	// How are we executing
	const binaryPath = process.env._;
	const binaryName =
		binaryPath && binaryPath.endsWith('/npx') ? 'npx mrm' : 'mrm';

	// Preset
	const preset = argv.preset || 'default';
	const isDefaultPreset = preset === 'default';

	// Task Dirs
	const directories = [...DEFAULT_DIRECTORIES, TASK_CACHE_DIR];

	// Custom config / tasks directory
	if (argv.dir) {
		const resolvedDir = path.resolve(argv.dir);
		try {
			const stat = await lstat(resolvedDir);
			if (stat.isDirectory()) {
				directories.push(resolvedDir);
			}
		} catch (_) {
			printError(`Directory "${resolvedDir}" not found.`);
			return 1;
		}
	}

	debug('collecting configs from %O', directories);

	const config = await getConfig(directories, CONFIG_FILENAME, argv);
	const options = {
		...config,
		refreshLocalTaskCache,
		useExperimentalDegitResolver,
	};
	debug(options);

	// Install stuff with degit and npm
	if (useExperimentalDegitResolver) {
		// options.degit.dependencies['mrm-preset-default'] =
		// 	'sapegin/mrm/packages/mrm-preset-default';

		['ci', 'codecov', 'contributing'].forEach(defaultTaskPkg => {
			const degitSpec = `sapegin/mrm/packages/mrm-task-${defaultTaskPkg}`;
			options.degit.dependencies[defaultTaskPkg] = degitSpec;
		});

		// options.degit.dependencies['typescript'] =
		// 	'sapegin/mrm/packages/mrm-task-typescript';

		await installDegitDependencies(options);
		// await ensureDefaultTasksAvailable(options);
	}

	if (tasks.length === 0 || tasks[0] === 'help') {
		await commandHelp();
		return;
	}

	try {
		if (dryRun) {
			console.log('\n', kleur.yellow().underline('Tasks'), '\n');
			console.log(tasks);
			console.log('\n', kleur.yellow().underline('Directories'), '\n');
			console.log(directories);
			console.log('\n', kleur.yellow().underline('Options'), '\n');
			console.log(options);
		} else {
			await run(tasks, directories, options, argv);
		}
	} catch (err) {
		if (err.constructor === MrmUnknownAlias) {
			printError(err.message);
		} else if (err.constructor === MrmUnknownTask) {
			const { taskName } = err.extra;
			if (isDefaultPreset) {
				const modules = directories
					.slice(0, -1)
					.map(d => `${d}/${taskName}/index.js`)
					.concat([
						`"${taskName}" in the default mrm tasks`,
						`mrm-task-${taskName} package in local node_modules`,
						`${taskName} package in local node_modules`,
						`mrm-task-${taskName} package on the npm registry`,
						`${taskName} package on the npm registry`,
					]);
				printError(
					`${err.message}

We've tried these locations:

- ${modules.join('\n- ')}`
				);
			} else {
				printError(`Task "${taskName}" not found in the "${preset}" preset.

Note that when a preset is specified no default search locations are used.`);
			}
		} else if (err.constructor === MrmInvalidTask) {
			printError(`${err.message}

Make sure your task module exports a function.`);
		} else if (err.constructor === MrmUndefinedOption) {
			const { unknown } = err.extra;
			const values = unknown.map(name => [name, random()]);
			const heading = `Required config options are missed: ${listify(
				unknown
			)}.`;
			const cliHelp = `  ${binaryName} ${tasks.join(' ')} ${values
				.map(([n, v]) => `--config:${n} "${v}"`)
				.join(' ')}`;
			if (isDefaultPreset) {
				const userDirectories = directories.slice(0, -1);
				printError(
					`${heading}

1. Create a "${CONFIG_FILENAME}" file:

{
${values.map(([n, v]) => `  "${n}": "${v}"`).join(',\n')}
}

In one of these folders:

- ${userDirectories.join('\n- ')}

2. Or pass options via command line:

${cliHelp}
	`
				);
			} else {
				printError(
					`${heading}

You can pass the option via command line:

${cliHelp}

Note that when a preset is specified no default search locations are used.`
				);
			}
		} else {
			throw err;
		}
	}

	// 		const presetPackageName = getPackageName('preset', preset);
	// 		try {
	// 			const presetPath = await promiseFirst([
	// 				() => require.resolve(presetPackageName),
	// 				() => require.resolve(preset),
	// 				() => remoteResolver(presetPackageName),
	// 				() => remoteResolver(preset),
	// 			]);
	// 			return [...paths, path.dirname(presetPath)];
	// 		} catch {
	// 			printError(`Preset "${preset}" not found.

	// We've tried to load "${presetPackageName}" and "${preset}" npm packages.`);
	// 			return process.exit(1);
	// 		}
	// 	}

	function getUsage() {
		const commands = EXAMPLES.map(x => x.join(''));
		const commandsWidth = longest(commands).length;
		return EXAMPLES.map(([command, opts, description]) =>
			[
				'   ',
				kleur.bold(binaryName),
				kleur.cyan(command),
				kleur.yellow(opts),
				padEnd('', commandsWidth - (command + opts).length),
				description && `# ${description}`,
			].join(' ')
		).join('\n');
	}

	async function getTasksList() {
		const allTasks = await getAllTasks(directories, options);
		const names = sortBy(Object.keys(allTasks));
		const nameColWidth = names.length > 0 ? longest(names).length : 0;

		return names
			.map(name => {
				const description = Array.isArray(allTasks[name])
					? `Runs ${listify(allTasks[name])}`
					: allTasks[name];
				return (
					'    ' + kleur.cyan(padEnd(name, nameColWidth)) + '  ' + description
				);
			})
			.join('\n');
	}

	async function commandHelp() {
		console.log(
			[
				kleur.underline('Usage'),
				getUsage(),
				kleur.underline('Available tasks'),
				await getTasksList(),
			].join('\n\n')
		);
		console.log('\n');
	}
}

/**
 * Check for newer versions of the tool
 */
function runUpdater() {
	const __dirname = path.dirname(fileURLToPath(import.meta.url));
	const pkgPath = path.resolve(__dirname, '..', 'package.json');
	const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
	const notifier = updateNotifier({ pkg });

	cliDebug('current pkg version: %s', pkg.version);
	cliDebug('latest pkg version: %s', notifier.update?.latest);

	return notifier.notify();
}

/**
 * Pretty Error messages
 */
function printError(message) {
	console.log();
	console.error(kleur.bold().red(message));
	console.log();
}

/**
 * Catch unhandled errors potentially thrown by tasks?
 */
process.on(
	'unhandledRejection',
	/** @type err {Error} */ err => {
		// if (String(err.constructor.name).startsWith('Mrm')) {
		cliDebug('ERROR');
		cliDebug(err);
		printError(err.message);
		process.exit(1);
		// } else {
		// 	throw err;
		// }
	}
);

runUpdater();
main();
