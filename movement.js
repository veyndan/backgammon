import Player from "./player.js";
import { Position } from "./position.js";

export class Move {
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

export class Touch {
	/**
	 * @param {Move[]} moves
	 */
	constructor(moves) {
		this.moves = moves;
	}
}

export class Turn {
	/**
	 * @param {Player} player
	 * @param {Touch[]} touches
	 */
	constructor(player, touches = []) {
		this.player = player;
		this.touches = touches;
	}
}
