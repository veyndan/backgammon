"use strict";

// noinspection ES6UnusedImports
import Board from "./board.js";
// noinspection ES6UnusedImports
import Dice, { Die } from "./dice.js";
// noinspection ES6UnusedImports
import Player from "./player.js";
// noinspection ES6UnusedImports
import {Position} from "./position.js";
// noinspection ES6UnusedImports
import Turn, {Touch} from "./turn.js";

export default class Game {
	/** @type {Board} */
	#committedBoard

	/**
	 * @param {Board} commitedBoard
	 * @param {Turn} turn
	 */
	constructor(commitedBoard, turn) {
		this.#committedBoard = Object.freeze(commitedBoard);
		this.turn = Object.freeze(turn);
		Object.freeze(this);
	}

	/**
	 * @return {boolean}
	 */
	get isTurnCommittable() {
		return this.turn.isCommittable;
	}

	/**
	 * @return {boolean}
	 */
	get isTouchUndoable() {
		return this.turn.isTouchUndoable;
	}

	get uncommittedBoard() {
		return this.turn.touches.reduce((previousValue, currentValue) => previousValue.withMove(currentValue), this.#committedBoard);
	}

	/**
	 * @return {Readonly<Die[]>}
	 */
	get playableDice() {
		return this.turn.playableDice;
	}

	/**
	 * @param {Player} player
	 * @param {Position} from
	 * @return {boolean}
	 */
	isCheckerMovable(player, from) {
		return this.playableDice
			.some(die => this.uncommittedBoard.getTouch(player, die, from) !== null);
	}

	/**
	 * @param {Dice} value
	 * @return {Game}
	 */
	withDice(value) {
		return new Game(this.#committedBoard, this.turn.withDice(value));
	}

	/**
	 * @return {Game}
	 */
	withChangedTurn() {
		return new Game(this.uncommittedBoard, this.turn.other);
	}

	/**
	 * @param {Touch} value
	 * @return {Game}
	 */
	withTouch(value) {
		return new Game(this.#committedBoard, this.turn.withTouch(value));
	}

	/**
	 * @return {Game}
	 */
	withUndoneTouch() {
		return new Game(this.#committedBoard, this.turn.withUndoneTouch());
	}
}
