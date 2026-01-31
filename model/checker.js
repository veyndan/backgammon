"use strict";

import {Point, Position} from "./position.js";
import Player from "./player.js";

export default class Checker {
	/**
	 * @param {Player} player
	 * @param {Position} position
	 */
	constructor(player, position) {
		this.player = Object.freeze(player);
		this.position = Object.freeze(position);
		Object.freeze(this);
	}

	/**
	 * @param {number} offset
	 * @return {?Checker}
	 */
	moveBy(offset) {
		if (this.position instanceof Point) {
			const potentialPoint = this.position.value + (this.player.value === Player.One.value ? -offset : offset);
			if (potentialPoint < Point.MIN.value || potentialPoint > Point.MAX.value) {
				return null;
			} else {
				return new Checker(this.player, new Point(potentialPoint));
			}
		} else {
			return new Checker(this.player, new Point(this.player.value === Player.One.value ? Point.MAX.value - offset + 1 : offset));
		}
	}
}
