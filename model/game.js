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

export default class Game {}

export class GameTurnStart extends Game {
	/**
	 * @param {Board} commitedBoard
	 * @param {Player} player
	 */
	constructor(commitedBoard, player) {
		super();
		this.committedBoard = Object.freeze(commitedBoard);
		this.player = Object.freeze(player);
		Object.freeze(this);
	}

	/**
	 * @param {Dice} value
	 * @return {GameTurnRollDice}
	 */
	withDice(value) {
		return new GameTurnRollDice(this.committedBoard, this.player, [], value);
	}
}

export class GameTurnRollDice extends Game {
	/** @type {Board} */
	#committedBoard
	/** @type {Dice} */
	#dice;

	/**
	 * @param {Board} commitedBoard
	 * @param {Player} player
	 * @param {Readonly<Move[]>} moves
	 * @param {Dice} dice
	 */
	constructor(commitedBoard, player, moves, dice) {
		super();
		this.#committedBoard = Object.freeze(commitedBoard);
		this.player = Object.freeze(player);
		this.moves = Object.freeze(moves);
		this.#dice = Object.freeze(dice);
		Object.freeze(this);
	}

	/**
	 * @return {boolean}
	 */
	get isTurnCommittable() {
		return this.playableDice.length === 0;
	}

	/**
	 * @return {boolean}
	 */
	get isMoveUndoable() {
		return this.moves.length > 0;
	}

	get uncommittedBoard() {
		return this.moves.reduce((previousValue, currentValue) => previousValue.withMove(currentValue), this.#committedBoard);
	}

	/**
	 * @return {Readonly<Die>}
	 */
	get lastPlayedDie() {
		return this.moves.at(-1).die;
	}

	/**
	 * @return {Readonly<Die[]>}
	 */
	get playableDice() {
		if (this.#dice.isDoubles) {
			return Object.freeze(this.#dice.values.concat(this.#dice.values).slice(this.moves.length));
		} else {
			return this.#dice.values.filter(die => !this.moves.map(move => move.die.value).includes(die.value));
		}
	}

	/**
	 * @param {Player} player
	 * @param {Position} from
	 * @return {boolean}
	 */
	isCheckerMovable(player, from) {
		if (this.player.value !== player.value) return false;
		return this.playableDice
			.some(die => this.uncommittedBoard.getMove(player, die, from) !== null);
	}

	/**
	 * @param {Player} player
	 * @param {Position} from
	 * @return {?Move}
	 */
	firstValidMove(player, from) {
		if (this.player.value !== player.value) return null;
		const validMove = this.playableDice
			.map(die => this.uncommittedBoard.getMove(player, die, from))
			.find(move => move !== null);
		return validMove !== undefined ? validMove : null;
	}

	/**
	 * @return {GameTurnRollDice}
	 */
	withSwappedDice() {
		return new GameTurnRollDice(this.#committedBoard, this.player, this.moves, this.#dice.swapped);
	}

	/**
	 * @return {GameTurnStart}
	 */
	withChangedTurn() {
		return new GameTurnStart(this.uncommittedBoard,  this.player.other);
	}

	/**
	 * @param {Move} value
	 * @return {GameTurnRollDice}
	 */
	withMove(value) {
		return new GameTurnRollDice(this.#committedBoard, this.player, this.moves.concat(value), this.#dice);
	}

	/**
	 * @return {GameTurnRollDice}
	 */
	withUndoneMove() {
		return new GameTurnRollDice(this.#committedBoard, this.player, this.moves.slice(0, -1), this.#dice);
	}
}
