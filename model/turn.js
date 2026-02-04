"use strict";

// noinspection ES6UnusedImports
import Dice, {Die} from "./dice.js";
// noinspection ES6UnusedImports
import Move from "./move.js";
// noinspection ES6UnusedImports
import Player from "./player.js";

class Turn {}

export class TurnStart extends Turn {
	/**
	 * @param {Player} player
	 */
	constructor(player) {
		super();
		this.player = Object.freeze(player);
		Object.freeze(this);
	}

	/**
	 * @param {Dice} value
	 * @return {TurnRollDice}
	 */
	withDice(value) {
		return new TurnRollDice(this.player, [], value);
	}
}

export class TurnRollDice extends Turn {
	/** @type {Dice} */
	#dice;

	/**
	 * @param {Player} player
	 * @param {Readonly<Move[]>} moves
	 * @param {Dice} dice
	 */
	constructor(player, moves, dice) {
		super();
		this.player = Object.freeze(player);
		this.moves = Object.freeze(moves);
		this.#dice = Object.freeze(dice);
		Object.freeze(this);
	}

	/**
	 * @return {boolean}
	 */
	get isCommittable() {
		return this.playableDice.length === 0;
	}

	/**
	 * @return {boolean}
	 */
	get isMoveUndoable() {
		return this.moves.length > 0;
	}

	/**
	 * @return {TurnStart}
	 */
	get other() {
		return new TurnStart(this.player.other);
	}

	/**
	 * @return {Readonly<Die>}
	 */
	get lastPlayedDie() {
		return this.moves.at(-1).die;
	}

	/**
	 * @return {Readonly<Die[]>}
	 */
	get playableDice() {
		if (this.#dice.isDoubles) {
			return Object.freeze(this.#dice.values.concat(this.#dice.values).slice(this.moves.length));
		} else {
			return this.#dice.values.filter(die => !this.moves.map(move => move.die.value).includes(die.value));
		}
	}

	/**
	 * @return {TurnRollDice}
	 */
	withSwappedDice() {
		return new TurnRollDice(this.player, this.moves, this.#dice.swapped);
	}

	/**
	 * @param {Move} value
	 * @return {TurnRollDice}
	 */
	withMove(value) {
		return new TurnRollDice(this.player, this.moves.concat(value), this.#dice);
	}

	/**
	 * @return {TurnRollDice}
	 */
	withUndoneMove() {
		return new TurnRollDice(this.player, this.moves.slice(0, -1), this.#dice);
	}
}
