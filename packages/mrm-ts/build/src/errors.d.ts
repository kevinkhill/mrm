interface ExtraRecordTaskName {
    taskName: string | string[];
}
interface ExtraRecordUnknown {
    unknown: string[];
}
export declare class MrmBaseError extends Error {
    extra?: ExtraRecordTaskName | ExtraRecordUnknown;
    constructor(message: string, extra?: MrmBaseError["extra"]);
}
export declare class MrmUnknownAlias extends MrmBaseError {
    constructor(message: string);
}
export declare class MrmUnknownTask extends MrmBaseError {
    extra: ExtraRecordTaskName;
    constructor(message: string, extra?: ExtraRecordTaskName);
}
export declare class MrmInvalidTask extends MrmBaseError {
    constructor(message: string, extra?: ExtraRecordTaskName);
}
export declare class MrmUndefinedOption extends MrmBaseError {
    extra: ExtraRecordUnknown;
    constructor(message: string, extra?: ExtraRecordUnknown);
}
export declare function isUnknownAliasError(err: unknown): err is MrmUnknownAlias;
export declare function isUnknownTaskError(err: unknown): err is MrmUnknownTask;
export declare function isInvalidTaskError(err: unknown): err is MrmInvalidTask;
export declare function isUndefinedOptionError(err: unknown): err is MrmUndefinedOption;
export {};
