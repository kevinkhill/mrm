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
	aliases?: TaskRecords;
	eslintPeerDependencies?: string[];
}

/**
 * The returned object from `minimist` with mrm's extra options
 */
export interface CliArgs extends ParsedArgs {
	dir?: string;
	silent: boolean;
	options: boolean;
	"dry-run": boolean;
	interactive: boolean;
}

/**
 * Starting a task type...
 */
export interface MrmTask {
	(config: Partial<MrmOptions>, argv: CliArgs): void;
	parameters: Record<string, any>;
}
