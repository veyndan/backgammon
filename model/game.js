"use strict";

// noinspection ES6UnusedImports
import Board from "./board.js";
// noinspection ES6UnusedImports
import Turn from "./turn.js";
import Player from "./player.js";

export default class Game {
	/** @type {Board} */
	#board;
	/** @type {Turn} */
	#turn;

	/**
	 * @param {Board} board
	 * @param {Turn} turn
	 */
	constructor(board, turn) {
		this.#board = board;
		this.#turn = turn;
	}

	get board() {
		return this.#board;
	}

	get turn() {
		return this.#turn;
	}

	changeTurn() {
		this.#turn = new Turn(this.#turn.player.value === Player.One.value ? Player.Two : Player.One);
	}
}
