"use strict";

// noinspection ES6UnusedImports
import Player from "./player.js";
import {Bar, Point, Position} from "./position.js";

export default class Move {
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

export class Advancement extends Move {
	/**
	 * @param {Player} player
	 * @param {Position} from
	 * @param {Point} to
	 */
	constructor(player, from, to) {
		super(player, from, to);
		Object.freeze(this);
	}
}

export class Hit extends Move {
	/**
	 * @param {Player} player
	 * @param {Point} from
	 */
	constructor(player, from) {
		super(player, from, new Bar());
		Object.freeze(this);
	}
}
