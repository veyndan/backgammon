"use strict";

// noinspection ES6UnusedImports
import Dice, {Die} from "./dice.js";
// noinspection ES6UnusedImports
import {Advancement, Hit } from "./move.js";
// noinspection ES6UnusedImports
import Player from "./player.js";

export default class Turn {
	/** @type {Dice} */
	#dice;

	/**
	 * @param {Player} player
	 * @param {Readonly<Touch[]>} touches
	 * @param {?Dice} dice
	 */
	constructor(player, touches, dice) {
		this.player = Object.freeze(player);
		this.touches = Object.freeze(touches);
		this.#dice = Object.freeze(dice);
		Object.freeze(this);
	}

	/**
	 * @return {Turn}
	 */
	get other() {
		return new Turn(this.player.other, [], null);
	}

	/**
	 * @return {Readonly<Die[]>}
	 */
	get playableDice() {
		if (this.#dice.values.every(die => die.value === this.#dice.values[0].value)) {
			return Object.freeze(this.#dice.values.concat(this.#dice.values).slice(this.touches.length));
		} else {
			return this.#dice.values.filter(die => !this.touches.map(touch => touch.die.value).includes(die.value));
		}
	}

	/**
	 * @param {Dice} value
	 * @return {Turn}
	 */
	withDice(value) {
		return new Turn(this.player, this.touches, value);
	}

	/**
	 * @param {Touch} value
	 * @return {Turn}
	 */
	withTouch(value) {
		return new Turn(this.player, this.touches.concat(value), this.#dice);
	}

	/**
	 * @return {Turn}
	 */
	withUndoneTouch() {
		return new Turn(this.player, this.touches.slice(0, -1), this.#dice);
	}
}

export class Touch {
	/**
	 * @param {Die} die
	 * @param {Advancement} advancement
	 * @param {?Hit} hit
	 */
	constructor(die, advancement, hit) {
		this.die = Object.freeze(die);
		this.advancement = Object.freeze(advancement);
		this.hit = Object.freeze(hit);
		Object.freeze(this);
	}
}
