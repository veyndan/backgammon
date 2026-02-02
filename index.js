"use strict";

import Board from "./model/board.js";
import Dice, {Die} from "./model/dice.js";
import Game from "./model/game.js";
import Turn from "./model/turn.js";
import Player from "./model/player.js";
import {Bar, Point, Position} from "./model/position.js";
// noinspection ES6UnusedImports
import CheckerElement from "./checker.js";
// noinspection ES6UnusedImports
import DieElement from "./die.js";
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

let game = new Game(Board.startingPosition(), new Turn(Player.One, [], null));

class CheckerOnBoardElement {
	/**
	 * @param {CheckerElement} target
	 */
	constructor(target) {
		this.target = target;
	}

	/**
	 * @return {boolean}
	 */
	get isMovable() {
		return `movable` in this.target.dataset;
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
			this.target.style.setProperty(`--point`, `${value.value}`);
		} else {
			delete this.target.dataset[`point`];
			this.target.style.removeProperty(`--point`);
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
			this.target.style.setProperty(`--point-stack-index`, `${value}`);
		} else {
			delete this.target.dataset[`pointStackIndex`];
			this.target.style.removeProperty(`--point-stack-index`);
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
			this.target.style.setProperty(`--point-stack-count`, `${value}`);

			this.target.querySelector(`[slot="text"]`).textContent = value > 5 && this.pointStackIndex === value - 1 ? `${this.pointStackIndex + 1}` : null;
		} else {
			delete this.target.dataset[`pointStackCount`];
			this.target.style.removeProperty(`--point-stack-count`);

			this.target.querySelector(`[slot="text"]`).textContent = null;
		}
	}
}

const mainElement = document.querySelector(`main`);
const svgElement = /** @type {SVGSVGElement} */ (document.querySelector(`main > svg`));
const checkersElement = document.getElementById('checkers');
const confirmElement = /** @type {HTMLButtonElement} */ (document.getElementById(`confirm`));
const diceContainerElement = /** @type {HTMLDivElement} */ (document.querySelector(`#dice-container`));
const diceSwapElement = /** @type {SVGSVGElement} */ (document.querySelector(`#dice-swap`));
const diceElement = /** @type {HTMLDivElement} */ (document.querySelector(`#dice`));
const doubleElement = /** @type {HTMLButtonElement} */ (document.getElementById(`double`));
const rollDiceElement = /** @type {HTMLButtonElement} */ (document.getElementById(`roll-dice`));
const undoElement = /** @type {HTMLButtonElement} */ (document.getElementById(`undo`));

const checkerElements = game.uncommittedBoard.mailbox.flatMap((pointValue, point) => {
	const pointStackCount = Math.abs(pointValue);
	return Array.from(Array(pointStackCount), (_, index) => index)
		.map(pointStackIndex => {
			const checkerElement = document.createElement(`veyndan-checker`);
			checkerElement.classList.add(`flat`);
			checkerElement.dataset[`player`] = pointValue > 0 ? Player.One.value : Player.Two.value;
			checkerElement.dataset[`point`] = `${point}`;
			checkerElement.dataset[`pointStackIndex`] = `${pointStackIndex}`;
			checkerElement.dataset[`pointStackCount`] = `${pointStackCount}`;
			checkerElement.style.setProperty(`--point`, `${point}`);
			checkerElement.style.setProperty(`--point-stack-index`, `${pointStackIndex}`);
			checkerElement.style.setProperty(`--point-stack-count`, `${pointStackCount}`);
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

const diceObserver = new MutationObserver(mutations => {
	mutations.forEach(mutation => {
		confirmElement.hidden = false;
		undoElement.hidden = false;
		const dieElement = /** @type {DieElement} */ (mutation.target);
		if (dieElement.playedAt !== undefined) {
			undoElement.disabled = false;
			const unplayedDieElements = Array.from(/** @type {NodeListOf<DieElement>} */ (document.querySelectorAll(`#dice veyndan-die:not([data-played-at])`)));
			if (unplayedDieElements.length === 0) {
				confirmElement.disabled = false;
			}
		} else {
			const playedDieElements = Array.from(/** @type {NodeListOf<DieElement>} */ (document.querySelectorAll(`#dice veyndan-die[data-played-at]`)));
			if (playedDieElements.length === 0) {
				undoElement.disabled = true;
			} else {
				confirmElement.disabled = true;
			}
		}
	});
});

diceObserver.observe(
	diceElement,
	{
		attributeFilter: [`data-played-at`],
		subtree: true,
	},
);

confirmElement.addEventListener(`click`, () => {
	diceContainerElement.style.display = `none`;
	doubleElement.hidden = false;
	rollDiceElement.hidden = false;
	confirmElement.hidden = true;
	undoElement.hidden = true;
	game = game.withChangedTurn();
	mainElement.dataset[`player`] = game.turn.player.value;
});

undoElement.addEventListener(`click`, () => {
	const lastTouch = game.turn.touches.at(-1);
	game = game.withUndoneTouch();
	let lastMovedCheckerElement = Array.from(/** @type {NodeListOf<CheckerElement>} */ (document.querySelectorAll(`#checkers > [data-point="${lastTouch.advancement.to.value}"]`)))
		.map(target => new CheckerOnBoardElement(target))
		.find(checkerElement => checkerElement.pointStackIndex === checkerElement.pointStackCount - 1);
	lastMovedCheckerElement.position = lastTouch.advancement.from;
	if (lastTouch.hit !== null) {
		let lastMovedCheckerElement = new CheckerOnBoardElement(document.querySelector(`#checkers > [data-player="${lastTouch.hit.player.value}"][data-hit]`));
		lastMovedCheckerElement.position = lastTouch.hit.from;
	}
	const lastPlayedDieElement = Array.from(/** @type {NodeListOf<DieElement>} */ (document.querySelectorAll(`#dice veyndan-die[data-played-at]`)))
		.reduce((mostRecentlyPlayedDieElement, dieElement) => mostRecentlyPlayedDieElement.playedAt > dieElement.playedAt ? mostRecentlyPlayedDieElement : dieElement);
	lastPlayedDieElement.playedAt = undefined;
});

rollDiceElement.addEventListener(`click`, () => {
	doubleElement.hidden = true;
	rollDiceElement.hidden = true;
	diceContainerElement.style.display = `flex`;
	confirmElement.hidden = false;
	confirmElement.disabled = true;
	undoElement.hidden = false;
	undoElement.disabled = true;

	/**
	 * @param {number} limit
	 */
	function repeatedlyRollDice(limit) {
		/**
		 * @return {number}
		 */
		function generateRandomValue() {
			return Math.floor(Math.random() * 6 + 1);
		}

		const dieElement0 = /** @type {DieElement} */ (document.createElement(`veyndan-die`));
		dieElement0.value = generateRandomValue();
		dieElement0.classList.add(`rolling`);
		const dieElement1 = /** @type {DieElement} */ (document.createElement(`veyndan-die`));
		dieElement1.value = generateRandomValue();
		dieElement1.classList.add(`rolling`);
		diceElement.replaceChildren(dieElement0, dieElement1);
		let count = 1;
		const intervalID = setInterval(
			() => {
				const firstDieElement = /** @type {DieElement} */ (document.createElement(`veyndan-die`));
				firstDieElement.value = generateRandomValue();
				firstDieElement.classList.add(`rolling`);
				const secondDieElement = /** @type {DieElement} */ (document.createElement(`veyndan-die`));
				secondDieElement.value = generateRandomValue();
				secondDieElement.classList.add(`rolling`);
				diceElement.replaceChildren(firstDieElement, secondDieElement);

				if (++count === limit) {
					clearInterval(intervalID);
					firstDieElement.classList.remove(`rolling`);
					secondDieElement.classList.remove(`rolling`);
					if (firstDieElement.value === secondDieElement.value) {
						diceElement.append(firstDieElement.cloneNode(true), secondDieElement.cloneNode(true));
					}
					game = game.withDice(new Dice(new Die(firstDieElement.value), new Die(secondDieElement.value)));
					updateMovabilityOfCheckers();
				}
			},
			50,
		);
	}

	repeatedlyRollDice(5);
});

diceContainerElement.addEventListener(`click`, () => {
	if (diceSwapElement.style.visibility === `hidden`) return;
	diceElement.children[1].after(diceElement.children[0]);
});

function updateMovabilityOfCheckers() {
	Array.from(/** @type {NodeListOf<CheckerElement>} */ (document.querySelectorAll(`#checkers > [data-player="${game.turn.player.value}"]`)))
		.map(value => new CheckerOnBoardElement(value))
		.forEach(checkerElement => checkerElement.isMovable = game.isCheckerMovable(checkerElement.player, checkerElement.position));
}

let ignoreCheckerClicks = false;

checkersElement.addEventListener(`click`, event => {
	if (ignoreCheckerClicks) {
		ignoreCheckerClicks = false;
		return;
	}
	const checkerElement = new CheckerOnBoardElement((/** @type {SVGUseElement} */ (event.target)).closest(`#checkers > *`));
	if (!checkerElement.isMovable) return;
	const dieElement = Array.from(/** @type {NodeListOf<DieElement>} */ (document.querySelectorAll(`#dice veyndan-die:not([data-played-at])`)))
		.find(dieElement => game.uncommittedBoard.getTouch(checkerElement.player, new Die(dieElement.value), checkerElement.position) !== null);
	dieElement.playedAt = Date.now();
	const oldPosition = checkerElement.position;
	const touch = game.uncommittedBoard.getTouch(checkerElement.player, new Die(dieElement.value), oldPosition);
	if (touch === null) {
		throw Error(`We should only have valid touches here.`);
	}
	checkerElement.position = touch.advancement.to;
	if (touch.hit !== null) {
		/** @type {CheckerElement} */
		const opponentCheckerOnPointElement = document.querySelector(`#checkers > [data-point="${touch.advancement.to.value}"]:not([data-player="${checkerElement.player.value}"])`);
		const opponentCheckerOnPointCheckerElement = new CheckerOnBoardElement(opponentCheckerOnPointElement);
		opponentCheckerOnPointCheckerElement.position = new Bar();
	}
	game = game.withTouch(touch);
});
