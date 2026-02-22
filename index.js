"use strict";

import Board from "./model/board.js";
// noinspection ES6UnusedImports
import Game, {GameTurnRollDice, GameTurnStart} from "./model/game.js";
import {Advancement} from "./model/move.js";
import Player from "./model/player.js";
import {Bar, Point, Position} from "./model/position.js";
// noinspection ES6UnusedImports
import CheckerElement from "./checker.js";
// noinspection ES6UnusedImports
import DiceRollElement from "./dice-roll.js";
import "./player.js"
import "./point.js"

/**
 * https://rwaldron.github.io/proposal-math-extensions/#sec-math.clamp
 *
 * @param {number} x
 * @param {number} lower
 * @param {number} upper
 * @return {number}
 */
// @ts-ignore https://github.com/Microsoft/TypeScript/issues/7237
Math.clamp = function (x, lower, upper) {
	return Math.min(Math.max(x, lower), upper);
};

/** @type {Game} */
let game = new GameTurnStart(Board.startingPosition(), Player.One);

class CheckerOnBoardElement {
	/**
	 * @param {CheckerElement} target
	 */
	constructor(target) {
		this.target = target;
	}

	/**
	 * @param {boolean} value
	 */
	set isMovable(value) {
		if (value) {
			this.target.dataset[`movable`] = ``;
		} else {
			delete this.target.dataset[`movable`];
		}
	}

	/**
	 * @return {Player}
	 */
	get player() {
		return new Player(/** @type {`1`|`2`} */ (this.target.dataset[`player`]));
	}

	/**
	 * @return {Position}
	 */
	get position() {
		if (this.#isHit) {
			return new Bar();
		} else if (this.#point !== null) {
			return this.#point;
		} else {
			throw Error();
		}
	}

	/**
	 * @param {Position} value
	 */
	set position(value) {
		if (value instanceof Point) {
			this.#point = value;
			this.#isHit = false;
		} else if (value instanceof Bar) {
			this.#point = null;
			this.#isHit = true;
		} else {
			throw Error();
		}
	}

	/**
	 * @return {boolean}
	 */
	get #isHit() {
		return `hit` in this.target.dataset;
	}

	/**
	 * @param {boolean} value
	 */
	set #isHit(value) {
		if (value) {
			this.target.dataset[`hit`] = ``;
		} else {
			delete this.target.dataset[`hit`];
		}
	}

	/**
	 * @return {?Point}
	 */
	get #point() {
		if (`point` in this.target.dataset) {
			return new Point(Number(this.target.dataset[`point`]));
		} else {
			return null;
		}

	}

	/**
	 * @param {?Point} value
	 */
	set #point(value) {
		if (value !== null) {
			this.target.dataset[`point`] = `${value.value}`
		} else {
			delete this.target.dataset[`point`];
		}
	}

	/**
	 * @return {number}
	 */
	get pointStackIndex() {
		return Number(this.target.dataset[`pointStackIndex`]);
	}

	/**
	 * @param {?number} value
	 */
	set pointStackIndex(value) {
		if (value !== null) {
			this.target.dataset[`pointStackIndex`] = `${value}`
		} else {
			delete this.target.dataset[`pointStackIndex`];
		}
	}

	/**
	 * @return {number}
	 */
	get pointStackCount() {
		return Number(this.target.dataset[`pointStackCount`]);
	}

	/**
	 * @param {?number} value
	 */
	set pointStackCount(value) {
		if (value !== null) {
			this.target.dataset[`pointStackCount`] = `${value}`

			this.target.querySelector(`[slot="text"]`).textContent = value > 5 && this.pointStackIndex === value - 1 ? `${this.pointStackIndex + 1}` : null;
		} else {
			delete this.target.dataset[`pointStackCount`];

			this.target.querySelector(`[slot="text"]`).textContent = null;
		}
	}
}

const backgammonElement = /** @type {HTMLDivElement} */ (document.querySelector(`.backgammon`));
const checkersElement = document.getElementById('checkers');
const timerElement = /** @type {HTMLDivElement} */ (document.querySelector(`#timer`));
const timerDelayElement = /** @type {HTMLTimeElement} */ (timerElement.querySelector(`#delay`));
const confirmElement = /** @type {HTMLButtonElement} */ (document.getElementById(`confirm`));
const doubleElement = /** @type {HTMLButtonElement} */ (document.getElementById(`double`));
const rollDiceElement = /** @type {HTMLButtonElement} */ (document.getElementById(`roll-dice`));
const undoElement = /** @type {HTMLButtonElement} */ (document.getElementById(`undo`));

const checkerElements = (/** @type GameTurnStart */ (game)).committedBoard.mailbox.flatMap((pointValue, point) => {
	const pointStackCount = Math.abs(pointValue);
	return Array.from(Array(pointStackCount), (_, index) => index)
		.map(pointStackIndex => {
			const checkerElement = document.createElement(`veyndan-checker`);
			checkerElement.classList.add(`flat`);
			checkerElement.dataset[`player`] = pointValue > 0 ? Player.One.value : Player.Two.value;
			checkerElement.dataset[`point`] = `${point}`;
			checkerElement.dataset[`pointStackIndex`] = `${pointStackIndex}`;
			checkerElement.dataset[`pointStackCount`] = `${pointStackCount}`;
			const textElement = document.createElement(`span`);
			textElement.slot = `text`;
			checkerElement.append(textElement);
			return checkerElement;
		});
});

checkersElement.append(...checkerElements);

const checkersObserver = new MutationObserver(mutations => {
	mutations.forEach(mutation => {
		const checkerElement = new CheckerOnBoardElement(/** @type {CheckerElement} */ (mutation.target));
		if (checkerElement.position instanceof Point) {
			if (checkerElement.position.value !== Number(mutation.oldValue)) {
				checkerElement.pointStackIndex = document.querySelectorAll(`#checkers > [data-point="${(checkerElement.position.value)}"][data-player="${checkerElement.player.value}"]`).length - 1;
				Array.from(/** @type {NodeListOf<CheckerElement>} */ (document.querySelectorAll(`#checkers > [data-point="${(checkerElement.position.value)}"]`)))
					.map(target => new CheckerOnBoardElement(target))
					.forEach((checkerElement, _, checkerElements) => {
						checkerElement.pointStackCount = checkerElements.length;
					});
				// When moving a checker that isn't on the top of the stack, reposition the checkers such that there is no longer a gap.
				Array.from(/** @type {NodeListOf<CheckerElement>} */ (document.querySelectorAll(`#checkers > [data-point="${mutation.oldValue}"]`)))
					.map(target => new CheckerOnBoardElement(target))
					.sort((a, b) => a.pointStackIndex - b.pointStackIndex)
					.forEach((checkerElement, index, checkerElements) => {
						checkerElement.pointStackIndex = index;
						checkerElement.pointStackCount = checkerElements.length;
					});
			}
		} else if (checkerElement.position instanceof Bar) {
			checkerElement.pointStackIndex = null;
			checkerElement.pointStackCount = null;
		} else {
			throw Error();
		}
		updateMovabilityOfCheckers();
	});
});

checkersObserver.observe(
	checkersElement,
	{
		attributeFilter: [`data-point`],
		attributeOldValue: true,
		subtree: true,
	},
);

/**
 * @type {?number}
 */
let timerIntervalId = null;

confirmElement.addEventListener(`click`, () => {
	clearInterval(timerIntervalId);
	// @ts-ignore
	// noinspection JSUnresolvedReference
	let delay = Temporal.Duration.from({seconds: 12});
	timerDelayElement.dateTime = delay.toString();
	timerDelayElement.textContent = delay.total(`seconds`);
	(/** @type {DiceRollElement} */ (document.querySelector(`veyndan-dice-roll`))).remove();
	doubleElement.hidden = false;
	rollDiceElement.hidden = false;
	confirmElement.hidden = true;
	undoElement.hidden = true;
	game = (/** @type {GameTurnRollDice} */ (game)).withChangedTurn();
	backgammonElement.dataset[`player`] = (/** @type {GameTurnStart} */ (game)).player.value;
});

undoElement.addEventListener(`click`, () => {
	const lastMove = (/** @type {GameTurnRollDice} */ (game)).moves.at(-1);
	if (lastMove instanceof Advancement) {
		let lastMovedCheckerElement = Array.from(/** @type {NodeListOf<CheckerElement>} */ (document.querySelectorAll(`#checkers > [data-point="${lastMove.to.value}"]`)))
			.map(target => new CheckerOnBoardElement(target))
			.find(checkerElement => checkerElement.pointStackIndex === checkerElement.pointStackCount - 1);
		lastMovedCheckerElement.position = lastMove.from;
		if (lastMove.didHitOpposingChecker) {
			let lastMovedCheckerElement = new CheckerOnBoardElement(document.querySelector(`#checkers > [data-player="${lastMove.player.other.value}"][data-hit]`));
			lastMovedCheckerElement.position = lastMove.to;
		}
	} else {
		throw new Error();
	}
	(/** @type {DiceRollElement} */ (document.querySelector(`veyndan-dice-roll`))).unplayed = (/** @type {GameTurnRollDice} */ (game)).lastPlayedDie;
	game = (/** @type {GameTurnRollDice} */ (game)).withUndoneMove();
	undoElement.disabled = !(/** @type {GameTurnRollDice} */ (game)).isMoveUndoable;
	confirmElement.disabled = true;
});

rollDiceElement.addEventListener(`click`, () => {
	doubleElement.hidden = true;
	rollDiceElement.hidden = true;
	const diceRollElement = /** @type {DiceRollElement} */ (document.createElement(`veyndan-dice-roll`));
	rollDiceElement.after(diceRollElement);
	confirmElement.hidden = false;
	confirmElement.disabled = true;
	undoElement.hidden = false;
	undoElement.disabled = true;

	diceRollElement.roll(5)
		.then(dice => {
			game = (/** @type {GameTurnStart} */ (game)).withDice(dice);
			updateMovabilityOfCheckers();
		});

	diceRollElement.addEventListener(`swap-dice`, () => {
		game = (/** @type {GameTurnRollDice} */ (game)).withSwappedDice();
	});

	const timeElement = /** @type {HTMLTimeElement} */ (timerElement.querySelector(`time[data-player="${(/** @type {GameTurnStart} */ (game)).player.value}"]`));
	// @ts-ignore
	// noinspection JSUnresolvedReference
	let delay = Temporal.Duration.from(timerDelayElement.dateTime);
	// @ts-ignore
	// noinspection JSUnresolvedReference
	let time = Temporal.Duration.from(timeElement.dateTime);
	// @ts-ignore
	// noinspection JSUnresolvedReference
	let increment = Temporal.Duration.from({seconds: 1});
	// @ts-ignore
	timerIntervalId = setInterval(
		() => {
			// noinspection JSUnresolvedReference
			if (delay.blank) {
				// noinspection JSUnresolvedReference
				time = time.subtract(increment);
				timeElement.dateTime = time.toString();
				timeElement.textContent = time.toLocaleString(navigator.language, {style: `digital`, hoursDisplay: `auto`});
				// noinspection JSUnresolvedReference
				if (time.blank) {
					clearInterval(timerIntervalId);
				}
			} else {
				// noinspection JSUnresolvedReference
				delay = delay.subtract(increment);
				timerDelayElement.dateTime = delay.toString();
				timerDelayElement.textContent = delay.total(`seconds`);
			}
		},
		increment.total(`milliseconds`),
	);
});

function updateMovabilityOfCheckers() {
	Array.from(/** @type {NodeListOf<CheckerElement>} */ (document.querySelectorAll(`#checkers > [data-player="${(/** @type {GameTurnStart} */ (game)).player.value}"]`)))
		.map(value => new CheckerOnBoardElement(value))
		.forEach(checkerElement => checkerElement.isMovable = (/** @type {GameTurnRollDice} */ (game)).isCheckerMovable(checkerElement.player, checkerElement.position));
}

checkersElement.addEventListener(`click`, event => {
	const checkerElement = new CheckerOnBoardElement((/** @type {SVGUseElement} */ (event.target)).closest(`#checkers > *`));
	const move = (/** @type {GameTurnRollDice} */ (game)).firstValidMove(checkerElement.player, checkerElement.position);
	if (move === null) return;
	(/** @type {DiceRollElement} */ (document.querySelector(`veyndan-dice-roll`))).played = move.die;
	if (move instanceof Advancement) {
		checkerElement.position = move.to;
		if (move.didHitOpposingChecker) {
			/** @type {CheckerElement} */
			const opponentCheckerOnPointElement = document.querySelector(`#checkers > [data-point="${move.to.value}"]:not([data-player="${checkerElement.player.value}"])`);
			const opponentCheckerOnPointCheckerElement = new CheckerOnBoardElement(opponentCheckerOnPointElement);
			opponentCheckerOnPointCheckerElement.position = new Bar();
		}
	} else {
		throw new Error();
	}
	game = (/** @type {GameTurnRollDice} */ (game)).withMove(move);
	undoElement.disabled = false;
	confirmElement.disabled = !(/** @type {GameTurnRollDice} */ (game)).isTurnCommittable;
});
