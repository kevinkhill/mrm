import { Question } from "inquirer";
import type { ParsedArgs } from "minimist";
import * as MrmCore from "mrm-core";

export type TaskRecords = Record<string, string[]>;

export interface ConfigQuestion extends Question {
	type: "config";
}

/**
 * The returned object from `minimist` with mrm's extra options
 */
export interface CliArgs extends ParsedArgs {
	dir?: string;
	preset?: string;
	silent: boolean;
	options: boolean;
	examine: boolean;
	"dry-run": boolean;
	interactive: boolean;
	useNewTaskSignature: boolean;
}

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
 * Task Module
 */
export interface MrmTask {
	description: string;
	parameters: {
		default: Question | ConfigQuestion;
		[K: string]: Question | ConfigQuestion;
	};

	// The original call signature of a task module
	(config: Partial<MrmOptions>, argv: CliArgs): void;

	// New destructured task payload with `mrm-core` included
	(payload: {
		config: Partial<MrmOptions>;
		argv: CliArgs;
		mrmCore: typeof MrmCore;
	}): void;
}
