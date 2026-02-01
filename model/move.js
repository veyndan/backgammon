"use strict";

import {Die} from "./dice.js";
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
	 * @param {Die} die
	 * @param {Position} from
	 */
	constructor(player, die, from) {
		super(player, from);
		this.die = Object.freeze(die);
		const fromValue = from instanceof Point ? from.value : (player.value === Player.One.value ? 25 : 0);
		this.to = Object.freeze(new Point(fromValue + (player.value === Player.One.value ? -die.value : die.value)));
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
