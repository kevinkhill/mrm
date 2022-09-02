import type { MrmOptions } from "../types/mrm";
export declare function getAllAliases(options: MrmOptions): MrmOptions["aliases"];
export declare function isValidAlias(alias: string, options: MrmOptions): boolean;
export declare function getAllTasks(directories: string[], options: Partial<MrmOptions>): Promise<Record<string, string[]>>;
