// @ts-check

export class MrmUnknownTask extends Error {
	constructor(message, extra) {
		super(message);
		this.name = this.constructor.name;
		this.extra = extra;
	}
}

export class MrmInvalidTask extends Error {
	constructor(message, extra) {
		super(message);
		this.name = this.constructor.name;
		this.extra = extra;
	}
}

export class MrmUnknownAlias extends Error {
	constructor(message) {
		super(message);
		this.name = this.constructor.name;
	}
}

export class MrmUndefinedOption extends Error {
	constructor(message, extra) {
		super(message);
		this.name = this.constructor.name;
		this.extra = extra;
	}
}
