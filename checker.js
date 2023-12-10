export default class Checker {
	/**
	 * @param {string} player
	 * @param {number} point
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
		return new Checker(this.player, this.point + (this.player === `1` ? -offset : offset));
	}
}
