"use strict";

// noinspection ES6UnusedImports
import Board from "./board.js";
// noinspection ES6UnusedImports
import Turn from "./turn.js";

export default class Game {
	/** @type {Board} */
	#board;

	/**
	 * @param {Board} board
	 * @param {Turn} turn
	 */
	constructor(board, turn) {
		this.#board = board;
		this.turn = turn;
	}

	get board() {
		return this.#board;
	}
}
