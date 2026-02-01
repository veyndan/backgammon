"use strict";

export default class Dice {
	/**
	 * @param {Die} die1
	 * @param {Die} die2
	 */
	constructor(die1, die2) {
		this.values = Object.freeze([die1, die2]);
		Object.freeze(this);
	}
}

export class Die {
	/**
	 * @param {number} value
	 */
	constructor(value) {
		if (value < 1 || value > 6) {
			throw RangeError(`Die must be between 1 and 6, but got ${value}.`);
		}
		this.value = Object.freeze(value);
		Object.freeze(this);
	}
}
