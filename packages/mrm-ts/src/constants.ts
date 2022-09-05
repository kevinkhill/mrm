import envPaths from "env-paths";
import kleur from "kleur";
import { homedir } from "node:os";
import path from "node:path";

export const PREFIX = `[${kleur.cyan("mrm")}]`;

/**
 * Filename for mrm configuration
 */
export const CONFIG_FILENAME = "config.json";

/**
 * Configuration for the degit resolver
 */
export const DEGIT_USE_FORCE = true;
export const DEGIT_USE_CACHE = true;

/**
 * Default Directories for mrm tasks and config
 */
export const DEFAULT_DIRECTORIES = [
	path.resolve(homedir(), "dotfiles/mrm"),
	path.resolve(homedir(), ".mrm"),
];

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
