"use strict";

// noinspection ES6UnusedImports
import Board from "./board.js";
// noinspection ES6UnusedImports
import Turn, {Touch} from "./turn.js";
import Player from "./player.js";

export default class Game {
	/**
	 * @param {Board} board
	 * @param {Turn} turn
	 */
	constructor(board, turn) {
		this.board = Object.freeze(board);
		this.turn = Object.freeze(turn);
		Object.freeze(this);
	}

	/**
	 * @return {Game}
	 */
	changeTurn() {
		return new Game(this.board, new Turn(this.turn.player.value === Player.One.value ? Player.Two : Player.One));
	}

	/**
	 * @param {Touch} value
	 * @return {Game}
	 */
	touch(value) {
		return new Game(this.board, new Turn(this.turn.player, this.turn.touches.concat(value)));
	}

	/**
	 * @return {Game}
	 */
	undoTouch() {
		return new Game(this.board, new Turn(this.turn.player, this.turn.touches.slice(0, -1)));
	}
}
