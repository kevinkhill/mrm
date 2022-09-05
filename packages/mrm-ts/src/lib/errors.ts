interface ExtraRecordTaskName {
	taskName: string | string[];
}

interface ExtraRecordUnknown {
	unknown: string[];
}

export class MrmBaseError extends Error {
	declare extra?: ExtraRecordTaskName | ExtraRecordUnknown;
	constructor(message: string, extra?: MrmBaseError["extra"]) {
		super(message);
		this.name = this.constructor.name;
		this.extra = extra;
	}
}

export class MrmPathNotExist extends MrmBaseError {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}

export class MrmUnknownAlias extends MrmBaseError {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}

export class MrmUnknownTask extends MrmBaseError {
	declare extra: ExtraRecordTaskName;
	constructor(message: string, extra?: ExtraRecordTaskName) {
		super(message);
		this.name = this.constructor.name;
		if (extra) {
			this.extra = extra;
		}
	}
}

export class MrmInvalidTask extends MrmBaseError {
	constructor(message: string, extra?: ExtraRecordTaskName) {
		super(message);
		this.name = this.constructor.name;
		this.extra = extra;
	}
}

export class MrmUndefinedOption extends MrmBaseError {
	declare extra: ExtraRecordUnknown;
	constructor(message: string, extra?: ExtraRecordUnknown) {
		super(message);
		this.name = this.constructor.name;
		if (extra) {
			this.extra = extra;
		}
	}
}

/**
 * Type guard for `MrmUnknownAlias`
 */
export function isUnknownAliasError(err: unknown): err is MrmUnknownAlias {
	return (err as MrmBaseError).constructor === MrmUnknownAlias;
}

/**
 * Type guard for `MrmUnknownTask`
 */
export function isUnknownTaskError(err: unknown): err is MrmUnknownTask {
	return (err as MrmBaseError).constructor === MrmUnknownTask;
}

/**
 * Type guard for `MrmInvalidTask`
 */
export function isInvalidTaskError(err: unknown): err is MrmInvalidTask {
	return (err as MrmBaseError).constructor === MrmInvalidTask;
}

/**
 * Type guard for `MrmUndefinedOption`
 */
export function isUndefinedOptionError(
	err: unknown
): err is MrmUndefinedOption {
	return (err as MrmBaseError).constructor === MrmUndefinedOption;
}
