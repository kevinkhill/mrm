import type { CliArgs, MrmOptions } from "../types/mrm";
export declare function run(taskList: string | string[], directories: string[], options: MrmOptions, argv: CliArgs): Promise<any>;
export declare function runAlias(aliasName: string, directories: string[], options: MrmOptions, argv: CliArgs): Promise<any>;
export declare function runTask(taskName: string, directories: string[], options: MrmOptions, argv: CliArgs): Promise<string>;
