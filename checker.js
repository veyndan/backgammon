import Point from "./point.js";
import Player from "./player.js";

export default class Checker {
	/**
	 * @param {Player} player
	 * @param {Point} point
	 */
	constructor(player, point) {
		this.player = player;
		this.point = point;
	}

	/**
	 * @param {number} offset
	 * @return {?Checker}
	 */
	moveBy(offset) {
		const potentialPoint = this.point.value + (this.player.value === Player.One.value ? -offset : offset);
		if (potentialPoint < Point.MIN.value || potentialPoint > Point.MAX.value) {
			return null;
		} else {
			return new Checker(this.player, new Point(potentialPoint));
		}
	}
}
