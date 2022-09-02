import type { ParsedArgs } from "minimist";
export declare type TaskRecords = Record<string, string[]>;
export interface MrmOptions {
    [k: string]: unknown;
    name: string;
    email: string;
    github: string;
    aliases: Record<string, string[]>;
    eslintPeerDependencies: string[];
}
export interface CliArgs extends ParsedArgs {
    dir?: string;
    interactive?: boolean;
}
export interface MrmTask {
    (): void;
    parameters: Record<string, any>;
}
