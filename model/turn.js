"use strict";

// noinspection ES6UnusedImports
import Player from "./player.js";
import { Position } from "./position.js";

export default class Turn {
	/**
	 * @param {Player} player
	 * @param {Touch[]} touches
	 */
	constructor(player, touches = []) {
		this.player = Object.freeze(player);
		this.touches = Object.freeze(touches);
		Object.freeze(this);
	}
}

export class Touch {
	/**
	 * @param {Move[]} moves
	 */
	constructor(moves) {
		this.moves = Object.freeze(moves);
		Object.freeze(this);
	}
}

export class Move {
	/**
	 * @param {Player} player
	 * @param {Position} from
	 * @param {Position} to
	 */
	constructor(player, from, to) {
		this.player = Object.freeze(player);
		this.from = Object.freeze(from);
		this.to = Object.freeze(to);
		Object.freeze(this);
	}
}
