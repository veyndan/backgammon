"use strict";

// noinspection ES6UnusedImports
import Player from "./player.js";
import {Point, Position} from "./position.js";

class Move {
	/**
	 * @param {Player} player
	 * @param {Position} from
	 */
	constructor(player, from) {
		this.player = Object.freeze(player);
		this.from = Object.freeze(from);
	}
}

export class Advancement extends Move {
	/**
	 * @param {Player} player
	 * @param {Position} from
	 * @param {Point} to
	 */
	constructor(player, from, to) {
		super(player, from);
		this.to = Object.freeze(to);
		Object.freeze(this);
	}
}

export class Hit extends Move {
	/**
	 * @param {Player} player
	 * @param {Point} from
	 */
	constructor(player, from) {
		super(player, from);
		Object.freeze(this);
	}
}
