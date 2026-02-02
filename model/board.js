"use strict";

import {Die} from "./dice.js";
import {Advancement} from "./move.js";
import {Bar, Point, Position} from "./position.js";
import Player from "./player.js";
import {Touch} from "./turn.js";

export default class Board {
	/**
	 * @param {number[]} mailbox An array based representation of the board with
	 * 	exactly 26 entries. The first entry represents the bar for player 2. The
	 * 	last entry represents the bar for player 1. The remaining middle 24
	 * 	entries represent the points on the board, where the index of the point
	 * 	represents the point's number. Positive numbers within the array
	 * 	indicates a position where checkers of player 1 reside. Negative numbers
	 * 	within the array indicates a position where checker of player 2 reside.
	 * 	Zero's within the array indicates a position where no checkers of either
	 * 	player reside. The absolute value of a position indicates the number of
	 * 	checkers that reside on that position.
	 *
	 */
	constructor(mailbox) {
		const player1CheckerCount = mailbox.reduce((previousValue, currentValue) => previousValue + Math.max(currentValue, 0), 0);
		if (player1CheckerCount !== 15) {
			throw Error(`Player 1 should have exactly 15 checkers on the board, but found ${player1CheckerCount}.`);
		}
		const player2CheckerCount = mailbox.reduce((previousValue, currentValue) => previousValue - Math.min(currentValue, 0), 0);
		if (player2CheckerCount !== 15) {
			throw Error(`Player 2 should have exactly 15 checkers on the board, but found ${player2CheckerCount}.`);
		}
		this.mailbox = Object.freeze(mailbox);
		Object.freeze(this);
	}

	/**
	 * @return {Board}
	 */
	static startingPosition() {
		return new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
	}

	/**
	 * @param {Player} player
	 * @param {Die} die
	 * @param {Position} from
	 * @return {?Touch}
	 */
	getTouch(player, die, from) {
		const positionValue = from instanceof Point
			? from.value
			: (player.value === Player.One.value ? 25 : 0);

		if (this.mailbox[positionValue] === 0) {
			throw Error(`Unable to get touch for checker as no checker resides on ${from}.`);
		}

		const potentialPointValue = positionValue + (player.value === Player.One.value ? -die.value : die.value);

		if (player.value === Player.One.value && from instanceof Point && from.value - die.value < 1) {
			return null
		} else if (player.value === Player.Two.value && from instanceof Point && from.value + die.value > 24) {
			return null
		} else if (player.value === Player.One.value && this.mailbox[potentialPointValue] >= 0) {
			if (from instanceof Bar || this.mailbox[25] === 0) {
				return new Touch(new Advancement(player, die, from, new Point(potentialPointValue)), false);
			} else {
				return null;
			}
		} else if (player.value === Player.Two.value && this.mailbox[potentialPointValue] <= 0) {
			if (from instanceof Bar || this.mailbox[0] === 0) {
				return new Touch(new Advancement(player, die, from, new Point(potentialPointValue)), false);
			} else {
				return null;
			}
		} else if (player.value === Player.One.value && this.mailbox[potentialPointValue] === -1) {
			return new Touch(new Advancement(player, die, from, new Point(potentialPointValue)), true);
		} else if (player.value === Player.Two.value && this.mailbox[potentialPointValue] === 1) {
			return new Touch(new Advancement(player, die, from, new Point(potentialPointValue)), true);
		} else if (player.value === Player.One.value && this.mailbox[potentialPointValue] < -1) {
			return null;
		} else if (player.value === Player.Two.value && this.mailbox[potentialPointValue] > 1) {
			return null;
		} else {
			throw Error(`Prior conditionals should've been exhaustive.`);
		}
	}

	/**
	 * @param {Touch} touch
	 * @return {Board}
	 */
	withMove(touch) {
		const mailbox = [...this.mailbox];
		if (touch.advancement.player.value === Player.One.value) {
			if (touch.advancement.from instanceof Point) {
				mailbox[touch.advancement.from.value]--;
				mailbox[touch.advancement.to.value]++;
			} else if (touch.advancement.from instanceof Bar) {
				mailbox[25]--;
				mailbox[touch.advancement.to.value]++;
			} else {
				throw new Error();
			}
		} else if (touch.advancement.player.value === Player.Two.value) {
			if (touch.advancement.from instanceof Point) {
				mailbox[touch.advancement.from.value]++;
				mailbox[touch.advancement.to.value]--;
			} else if (touch.advancement.from instanceof Bar) {
				mailbox[0]++;
				mailbox[touch.advancement.to.value]--;
			} else {
				throw new Error();
			}
		} else {
			throw new Error();
		}
		if (touch.hit !== null) {
			if (touch.hit.player.value === Player.One.value) {
				mailbox[touch.hit.from.value]--;
				mailbox[25]++;
			} else if (touch.hit.player.value === Player.Two.value) {
				mailbox[touch.hit.from.value]++;
				mailbox[0]--;
			} else {
				throw new Error();
			}
		}
		return new Board(mailbox);
	}
}
