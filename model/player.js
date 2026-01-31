"use strict";

const ONE_VALUE = `1`;
const TWO_VALUE = `2`;

export default class Player {
	constructor(value) {
		if (![ONE_VALUE, TWO_VALUE].includes(value)) {
			throw new RangeError(`The argument must be "${ONE_VALUE}" or "${TWO_VALUE}".`);
		}
		this.value = Object.freeze(value);
		Object.freeze(this);
	}

	static get One() {
		return new Player(ONE_VALUE);
	}

	static get Two() {
		return new Player(TWO_VALUE);
	}

	toString() {
		return `Player(${this.value})`;
	}
}
