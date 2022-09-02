import { ExecaReturnValue } from "execa";
export declare function npmCommand(command: string[], cwd: string): Promise<ExecaReturnValue<string>>;
export declare function installWithNpm(pkgSpec: string, cwd: string): Promise<string>;
