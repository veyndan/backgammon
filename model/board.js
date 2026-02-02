"use strict";

import {Advancement} from "./move.js";
import {Point} from "./position.js";
import Player from "./player.js";

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
	 * @param {Advancement} advancement
	 * @return {?Board}
	 */
	withMove(advancement) {
		const positionValue = advancement.from instanceof Point
			? advancement.from.value
			: (advancement.player.value === Player.One.value ? 25 : 0);

		if (this.mailbox[positionValue] === 0) {
			throw Error(`Unable to move checker as no checker resides on ${advancement.from}.`);
		}

		const potentialPointValue = positionValue + (advancement.player.value === Player.One.value ? -advancement.die.value : advancement.die.value);

		if (advancement.player.value === Player.One.value && this.mailbox[potentialPointValue] >= 0) {
			const potentialMailbox = [...this.mailbox];
			potentialMailbox[positionValue]--;
			potentialMailbox[potentialPointValue]++;
			return new Board(potentialMailbox);
		} else if (advancement.player.value === Player.Two.value && this.mailbox[potentialPointValue] <= 0) {
			const potentialMailbox = [...this.mailbox];
			potentialMailbox[positionValue]++;
			potentialMailbox[potentialPointValue]--;
			return new Board(potentialMailbox);
		} else if (advancement.player.value === Player.One.value && this.mailbox[potentialPointValue] === -1) {
			const potentialMailbox = [...this.mailbox];
			potentialMailbox[positionValue]--;
			potentialMailbox[potentialPointValue] = 1;
			potentialMailbox[0]--;
			return new Board(potentialMailbox);
		} else if (advancement.player.value === Player.Two.value && this.mailbox[potentialPointValue] === 1) {
			const potentialMailbox = [...this.mailbox];
			potentialMailbox[positionValue]++;
			potentialMailbox[potentialPointValue] = -1;
			potentialMailbox[25]++;
			return new Board(potentialMailbox);
		} else if (advancement.player.value === Player.One.value && this.mailbox[potentialPointValue] < -1) {
			return null;
		} else if (advancement.player.value === Player.Two.value && this.mailbox[potentialPointValue] > 1) {
			return null;
		} else {
			throw Error(`Prior conditionals should've been exhaustive.`);
		}
	}
}
