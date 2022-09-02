export declare const join: (sep: string, items: string[]) => string;
export declare function longest(input: string[]): string;
export declare function getPackageName(type: "task" | "preset", packageName: string): string;
export declare function tryFile(directories: string[], filename: string): Promise<string>;
