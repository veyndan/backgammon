"use strict";

// noinspection ES6UnusedImports
import Player from "./player.js";
import { Position } from "./position.js";

export default class Turn {
	/**
	 * @param {Player} player
	 */
	constructor(player) {
		this.player = player;
		/**
		 * @type {Touch[]}
		 */
		this.touches = [];
	}
}

export class Touch {
	/**
	 * @param {Move[]} moves
	 */
	constructor(moves) {
		this.moves = moves;
	}
}

export class Move {
	/**
	 * @param {Player} player
	 * @param {Position} from
	 * @param {Position} to
	 */
	constructor(player, from, to) {
		this.player = player;
		this.from = from;
		this.to = to;
	}
}
