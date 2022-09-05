import type { ParsedArgs } from "minimist";

export type TaskRecords = Record<string, string[]>;

/**
 * The main options interface for mrm
 *
 * @todo collect all the different possible options?
 */
export interface MrmOptions {
	[k: string]: unknown;
	name: string;
	email: string;
	github: string;
	aliases?: Record<string, undefined | string[]>;
	eslintPeerDependencies?: string[];
}

/**
 * The returned object from `minimist` with mrm's extra options
 */
export interface CliArgs extends ParsedArgs {
	dir?: string;
	silent: boolean;
	interactive: boolean;
}

/**
 * Starting a task type...
 */
export interface MrmTask {
	(): void;
	parameters: Record<string, any>;
}
