export declare function promiseSeries<T>(array: string[], fn: (arrItem: string) => Promise<T>): Promise<Record<string, T>>;
export declare function promiseFirst<T>(thunks: Array<(() => Promise<T>) | (() => T)>, errors?: Error[]): Promise<T>;
