"use strict";

// noinspection ES6UnusedImports
import Board from "./board.js";
// noinspection ES6UnusedImports
import Turn from "./turn.js";
import Player from "./player.js";

export default class Game {
	/**
	 * @param {Board} board
	 * @param {Turn} turn
	 */
	constructor(board, turn) {
		this.board = board;
		this.turn = turn;
		Object.freeze(this);
	}

	/**
	 * @return {Game}
	 */
	changeTurn() {
		return new Game(this.board, new Turn(this.turn.player.value === Player.One.value ? Player.Two : Player.One));
	}
}
