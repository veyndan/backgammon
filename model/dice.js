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

	/**
	 * @return {boolean}
	 */
	get isDoubles() {
		return this.values[0].value === this.values[1].value;
	}

	/**
	 * @return {Dice}
	 */
	get swapped() {
		if (this.isDoubles) {
			throw new Error(`Doubles cannot be swapped.`);
		}
		return new Dice(this.values[1], this.values[0]);
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

	/**
	 * @param {() => number} mathRandom
	 * @return {Die}
	 */
	static random(mathRandom = Math.random) {
		return new Die(Math.floor(mathRandom() * 6 + 1));
	}
}
