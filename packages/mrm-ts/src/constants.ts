import envPaths from "env-paths";
import kleur from "kleur";

export const NPX_RESOLVER_QUIET = true;

export const PREFIX = `[${kleur.cyan("mrm")}]`;

/**
 * Filename for mrm configuration
 */
export const CONFIG_FILENAME = "config.json";

/**
 * Path to mrm's local task cache
 */
export const TASK_CACHE_DIR = envPaths("mrm", { suffix: "tasks" }).cache;

/**
 * CLI examples
 */
export const EXAMPLES = [
	["", "", "List of available tasks"],
	["<task>", "", "Run a task or an alias"],
	["<task>", "--dir ~/unicorn", "Custom config and tasks folder"],
	["<task>", "--preset unicorn", "Load config and tasks from a preset"],
	[
		"<task>",
		"--config:foo coffee --config:bar pizza",
		"Override config options",
	],
];
