export class MrmBaseError extends Error {
	constructor(message, extra) {
		super(message);
		this.name = this.constructor.name;
		this.extra = extra;
	}
}
export class MrmUnknownAlias extends MrmBaseError {
	constructor(message) {
		super(message);
		this.name = this.constructor.name;
	}
}
export class MrmUnknownTask extends MrmBaseError {
	constructor(message, extra) {
		super(message);
		this.name = this.constructor.name;
		if (extra) {
			this.extra = extra;
		}
	}
}
export class MrmInvalidTask extends MrmBaseError {
	constructor(message, extra) {
		super(message);
		this.name = this.constructor.name;
		this.extra = extra;
	}
}
export class MrmUndefinedOption extends MrmBaseError {
	constructor(message, extra) {
		super(message);
		this.name = this.constructor.name;
		if (extra) {
			this.extra = extra;
		}
	}
}
export function isUnknownAliasError(err) {
	return err.constructor === MrmUnknownAlias;
}
export function isUnknownTaskError(err) {
	return err.constructor === MrmUnknownTask;
}
export function isInvalidTaskError(err) {
	return err.constructor === MrmInvalidTask;
}
export function isUndefinedOptionError(err) {
	return err.constructor === MrmUndefinedOption;
}
//# sourceMappingURL=errors.js.map
