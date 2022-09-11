import type { CliArgs, MrmOptions } from "../types/mrm";
export declare function getConfig(directories: string[], argv: CliArgs): Promise<MrmOptions>;
export declare function getConfigFromFile(directories: string[]): Promise<Partial<MrmOptions>>;
export declare function getConfigFromCommandLine(argv: CliArgs): Partial<MrmOptions>;
