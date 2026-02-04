"use strict";

// noinspection ES6UnusedImports
import Board from "./board.js";
// noinspection ES6UnusedImports
import Dice, { Die } from "./dice.js";
// noinspection ES6UnusedImports
import Move from "./move.js";
// noinspection ES6UnusedImports
import Player from "./player.js";
// noinspection ES6UnusedImports
import {Position} from "./position.js";
// noinspection ES6UnusedImports
import {TurnRollDice, TurnStart} from "./turn.js";

export default class Game {}

export class GameTurnStart extends Game {
	/**
	 * @param {Board} commitedBoard
	 * @param {TurnStart} turn
	 */
	constructor(commitedBoard, turn) {
		super();
		this.committedBoard = Object.freeze(commitedBoard);
		this.turn = Object.freeze(turn);
		Object.freeze(this);
	}

	/**
	 * @param {Dice} value
	 * @return {GameTurnRollDice}
	 */
	withDice(value) {
		return new GameTurnRollDice(this.committedBoard, this.turn.withDice(value));
	}
}

export class GameTurnRollDice extends Game {
	/** @type {Board} */
	#committedBoard

	/**
	 * @param {Board} commitedBoard
	 * @param {TurnRollDice} turn
	 */
	constructor(commitedBoard, turn) {
		super();
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
	get isMoveUndoable() {
		return this.turn.isMoveUndoable;
	}

	get uncommittedBoard() {
		return this.turn.moves.reduce((previousValue, currentValue) => previousValue.withMove(currentValue), this.#committedBoard);
	}

	/**
	 * @return {Readonly<Die>}
	 */
	get lastPlayedDie() {
		return this.turn.lastPlayedDie;
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
		if (this.turn.player.value !== player.value) return false;
		return this.playableDice
			.some(die => this.uncommittedBoard.getMove(player, die, from) !== null);
	}

	/**
	 * @param {Player} player
	 * @param {Position} from
	 * @return {?Move}
	 */
	firstValidMove(player, from) {
		if (this.turn.player.value !== player.value) return null;
		const validMove = this.playableDice
			.map(die => this.uncommittedBoard.getMove(player, die, from))
			.find(move => move !== null);
		return validMove !== undefined ? validMove : null;
	}

	/**
	 * @return {GameTurnRollDice}
	 */
	withSwappedDice() {
		return new GameTurnRollDice(this.#committedBoard, this.turn.withSwappedDice());
	}

	/**
	 * @return {GameTurnStart}
	 */
	withChangedTurn() {
		return new GameTurnStart(this.uncommittedBoard, this.turn.other);
	}

	/**
	 * @param {Move} value
	 * @return {GameTurnRollDice}
	 */
	withMove(value) {
		return new GameTurnRollDice(this.#committedBoard, this.turn.withMove(value));
	}

	/**
	 * @return {GameTurnRollDice}
	 */
	withUndoneMove() {
		return new GameTurnRollDice(this.#committedBoard, this.turn.withUndoneMove());
	}
}
