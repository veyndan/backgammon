"use strict";

import {Die} from "./dice.js";
// noinspection ES6UnusedImports
import Player from "./player.js";
import {Point, Position} from "./position.js";

class Move {
	/**
	 * @param {Player} player
	 */
	constructor(player) {
		this.player = Object.freeze(player);
	}
}

export class Advancement extends Move {
	/**
	 * @param {Player} player
	 * @param {Die} die
	 * @param {Position} from
	 * @param {Point} to
	 */
	constructor(player, die, from, to) {
		super(player);
		this.die = Object.freeze(die);
		this.from = Object.freeze(from);
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
		super(player);
		this.from = Object.freeze(from);
		Object.freeze(this);
	}
}
