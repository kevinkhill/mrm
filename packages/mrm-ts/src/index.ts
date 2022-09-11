import kleur from "kleur";
import { random } from "middleearth-names";
import minimist from "minimist";
import updateNotifier from "update-notifier";

import packageJson from "../package.json";
import { CONFIG_FILENAME, EXAMPLES, PREFIX } from "./constants";
import {
	getConfig,
	isInvalidTaskError,
	isUndefinedOptionError,
	isUnknownAliasError,
	isUnknownTaskError,
	longest,
	mrmDebug,
	printError,
	toNaturalList,
} from "./lib";
import { TaskStore } from "./lib/TaskStore";
import type { CliArgs, TaskRecords } from "./types/mrm";

const cliDebug = mrmDebug.extend("CLI");

let loadingDotsInterval: NodeJS.Timer;

/**
 * mrm, the cli tool
 */
export async function mrm() {
	const debug = cliDebug;
	const argv = minimist(process.argv.slice(2), {
		alias: {
			i: "interactive",
		},
		boolean: ["silent", "dump", "dry-run", "examine", "useNewTaskSignature"],
	}) as CliArgs;

	debug("argv: %O", argv);

	// Create a new instance of the TaskStore and initialize it.
	const MrmTasks = new TaskStore(argv);

	// Collect positional args as tasks to run
	const tasks = argv._;

	// How are we executing
	const binaryPath = process.env._;
	const binaryName =
		binaryPath && binaryPath.endsWith("/npx") ? "npx mrm" : "mrm";

	// Preset
	const preset = argv.preset || "default";

	// Show shome loading dots while we wait.
	if (!mrmDebug.enabled && !argv.silent) {
		process.stdout.write(`${PREFIX} Fetching the default preset`);
		loadingDotsInterval = setInterval(() => {
			process.stdout.write(".");
		}, 1000);
	}

	await MrmTasks.initStore();

	// Gather options from the directories
	const options = await getConfig(MrmTasks.PATH, argv);
	debug("options: %O", options);

	MrmTasks.mergeOptions(options);

	// Now that we are loaded, kill the dots timer.
	if (!mrmDebug.enabled && !argv.silent) {
		clearInterval(loadingDotsInterval);
		console.log(kleur.green("done"));
	}

	if (argv["dump"]) {
		console.log("\n", kleur.yellow().underline("Options"), "\n");
		console.log(MrmTasks);
		return;
	}

	/**
	 * If called with no tasks, `help` as a "task", or `--help`
	 * show the mrm usage console output and exit.
	 */
	if (tasks.length === 0 || tasks[0] === "help") {
		if (!argv.silent) {
			console.log(PREFIX, kleur.yellow("No tasks to run"));
		}

		// Gather all the tasks from the directories
		commandHelp(binaryName, await MrmTasks.getAllTasks());
		return;
	}

	// Let's run some tasks!
	try {
		await MrmTasks.run(tasks);
	} catch (err: unknown) {
		if (isUnknownAliasError(err)) {
			printError(err.message);
		} else if (isUnknownTaskError(err)) {
			const { taskName } = err.extra;

			if (MrmTasks.isDefaultPreset) {
				const modules = MrmTasks.PATH.slice(0, -1)
					.map(d => `${d}/${taskName}/index.js`)
					.concat([
						`"${taskName}" in the default mrm tasks`,
						`mrm-task-${taskName} package in local node_modules`,
						`${taskName} package in local node_modules`,
						`mrm-task-${taskName} package on the npm registry`,
						`${taskName} package on the npm registry`,
					]);
				printError(`${err.message}

We've tried these locations:

- ${modules.join("\n- ")}`);
			} else {
				printError(`Task "${taskName}" not found in the "${preset}" preset.

Note that when a preset is specified no default search locations are used.`);
			}
		} else if (isInvalidTaskError(err)) {
			printError(`${err.message}

Make sure your task module exports a function.`);
		} else if (isUndefinedOptionError(err)) {
			const { unknown } = err.extra;
			const values = unknown.map(name => [name, random()]);
			const configList = toNaturalList(unknown);
			const heading = `Required config options are missed: ${configList}.`;
			const cliHelp = `  ${binaryName} ${tasks.join(" ")} ${values
				.map(([n, v]) => `--config:${n} "${v}"`)
				.join(" ")}`;

			if (MrmTasks.isDefaultPreset) {
				const userDirectories = MrmTasks.PATH.slice(0, -1);

				printError(`${heading}

1. Create a "${CONFIG_FILENAME}" file:

{
${values.map(([n, v]) => `  "${n}": "${v}"`).join(",\n")}
}

In one of these folders:

- ${userDirectories.join("\n- ")}

2. Or pass options via command line:

${cliHelp}
	`);
			} else {
				printError(`${heading}

You can pass the option via command line:

${cliHelp}

Note that when a preset is specified no default search locations are used.`);
			}
		} else {
			throw err;
		}
	}
}

/**
 * Build and output for the command help for `mrm`
 */
function commandHelp(binaryName: string, allTasks: TaskRecords) {
	console.log("\n");
	console.log(
		[
			kleur.underline("Usage"),
			getUsage(binaryName),
			kleur.underline("Available tasks"),
			buildTasksList(allTasks),
		].join("\n\n")
	);
	console.log("\n");
}

/**
 * Get a pretty printed explanation of how to use `mrm`
 */
function getUsage(binaryName: string): string {
	const commands = EXAMPLES.map(x => x.join(""));
	const commandsWidth = longest(commands).length;

	return EXAMPLES.map(([command, opts, description]) =>
		[
			"   ",
			kleur.bold(binaryName),
			kleur.cyan(command),
			kleur.yellow(opts),
			"".padEnd(commandsWidth - (command + opts).length),
			description && `# ${description}`,
		].join(" ")
	).join("\n");
}

/**
 * Build a list of all the tasks and how they run
 */
function buildTasksList(allTasks: TaskRecords) {
	const names = Object.keys(allTasks).sort();
	const nameColWidth = names.length > 0 ? longest(names).length : 0;

	return names
		.map(name => {
			const description = Array.isArray(allTasks[name])
				? `Runs ${toNaturalList(allTasks[name])}`
				: allTasks[name];
			return (
				"    " + kleur.cyan(name.padEnd(nameColWidth)) + "  " + description
			);
		})
		.join("\n");
}

/**
 * Catch unhandled errors potentially thrown by tasks?
 */
process.on("unhandledRejection", (err: Error) => {
	// if (String(err.constructor.name).startsWith('Mrm')) {
	cliDebug("ERROR");
	cliDebug(err);
	printError(err.message);
	process.exit(1);
	// } else {
	// 	throw err;
	// }
});

const notifier = updateNotifier({ pkg: packageJson });
cliDebug("current pkg version: %s", notifier.update?.current);
cliDebug("latest pkg version: %s", notifier.update?.latest);

notifier.notify();
mrm();