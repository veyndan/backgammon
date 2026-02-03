"use strict";

import {Die} from "./dice.js";
// noinspection ES6UnusedImports
import Player from "./player.js";
import {Point, Position} from "./position.js";

export default class Move {
	/**
	 * @param {Player} player
	 * @param {Die} die
	 * @param {Position} from
	 */
	constructor(player, die, from) {
		this.player = Object.freeze(player);
		this.die = Object.freeze(die);
		this.from = Object.freeze(from);
	}
}

export class Advancement extends Move {
	/**
	 * @param {Player} player
	 * @param {Die} die
	 * @param {Position} from
	 * @param {Point} to
	 * @param {boolean} didHitOpposingChecker
	 */
	constructor(player, die, from, to, didHitOpposingChecker) {
		super(player, die, from);
		this.to = Object.freeze(to);
		this.didHitOpposingChecker = Object.freeze(didHitOpposingChecker);
		Object.freeze(this);
	}
}
