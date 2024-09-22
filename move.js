import Player from "./player.js";
import { Position } from "./position.js";

export default class Move {
	/**
	 * @param {Player} player
	 * @param {Position} from
	 * @param {Position} to
	 */
	constructor(player, from, to) {
		this.player = player;
		this.from = from;
		this.to = to;
	}
}
