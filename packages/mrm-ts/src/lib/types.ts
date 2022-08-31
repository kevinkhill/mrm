import type { ParsedArgs } from "minimist";

/**
 * The main options interface for mrm
 *
 * @todo collect all the different possible options?
 */
export interface MrmOptions {
	name: string;
	email: string;
	github: string;
	aliases: Record<string, string[]>;
	eslintPeerDependencies: string[];
}

/**
 * The returned object from `minimist`
 */
export interface CliArgs extends ParsedArgs {
	dir?: string;
	interactive?: boolean;
}

/**
 * Starting a task type...
 */
export interface MrmTask {
	(): void;
	parameters: Record<string, any>;
}
