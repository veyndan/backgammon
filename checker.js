import Point from "./point.js";

export default class Checker {
	/**
	 * @param {string} player
	 * @param {Point} point
	 */
	constructor(player, point) {
		this.player = player;
		this.point = point;
	}

	/**
	 * @param {number} offset
	 * @return {Checker}
	 */
	moveBy(offset) {
		return new Checker(this.player, new Point(this.point.value + (this.player === `1` ? -offset : offset)));
	}
}
