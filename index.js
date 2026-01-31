"use strict";

import Board from "./model/board.js";
import Checker from "./model/checker.js";
import Turn, {Move, Touch} from "./model/turn.js";
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

const board = Board.startingPosition();

let turn = new Turn(Player.One);

class CheckerOnBoardElement {
	/**
	 * @param {CheckerElement} target
	 */
	constructor(target) {
		this.target = target;
	}

	/**
	 * @return {Set<Point>}
	 */
	get permissibleDestinationPoints() {
		return new Set(
			(/** @type {number[]} */ (JSON.parse(this.target.dataset[`permissibleDestinationPoints`])))
				.map(value => new Point(value)),
		);
	}

	/**
	 * @param {Set<Point>} value
	 */
	set permissibleDestinationPoints(value) {
		this.target.dataset[`permissibleDestinationPoints`] = JSON.stringify(Array.from(value).map(point => point.value));
	}

	/**
	 * @return {Player}
	 */
	get player() {
		return new Player(this.target.dataset[`player`]);
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

const checkerElements = board.mailbox.flatMap((pointValue, point) => {
	const pointStackCount = Math.abs(pointValue);
	return Array.from(Array(pointStackCount), (_, index) => index)
		.map(pointStackIndex => {
			const checkerElement = document.createElement(`veyndan-checker`);
			checkerElement.classList.add(`flat`);
			checkerElement.dataset[`player`] = pointValue > 0 ? Player.One.value : Player.Two.value;
			checkerElement.dataset[`point`] = `${point}`;
			checkerElement.dataset[`pointStackIndex`] = `${pointStackIndex}`;
			checkerElement.dataset[`pointStackCount`] = `${pointStackCount}`;
			checkerElement.dataset[`permissibleDestinationPoints`] = `[]`;
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
	turn = new Turn(turn.player.value === Player.One.value ? Player.Two : Player.One);
	mainElement.dataset[`player`] = turn.player.value;
});

undoElement.addEventListener(`click`, () => {
	const lastTouch = turn.touches.pop();
	lastTouch.moves.forEach(move => {
		/** @type {CheckerOnBoardElement} */
		let lastMovedCheckerElement;
		if (move.to instanceof Point) {
			lastMovedCheckerElement = Array.from(/** @type {NodeListOf<CheckerElement>} */ (document.querySelectorAll(`#checkers > [data-point="${move.to.value}"]`)))
				.map(target => new CheckerOnBoardElement(target))
				.find(checkerElement => checkerElement.pointStackIndex === checkerElement.pointStackCount - 1);
		} else if (move.to instanceof Bar) {
			lastMovedCheckerElement = new CheckerOnBoardElement(document.querySelector(`#checkers > [data-player="${move.player.value}"][data-hit]`));
		} else {
			throw Error();
		}
		lastMovedCheckerElement.position = move.from;
	});
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
	const dieElements = Array.from(/** @type {NodeListOf<DieElement>} */ (document.querySelectorAll(`#dice veyndan-die:not([data-played-at])`)));
	const checkerElements = Array.from(/** @type {NodeListOf<CheckerElement>} */ (document.querySelectorAll(`#checkers > [data-player="${turn.player.value}"]`)))
		.map(value => new CheckerOnBoardElement(value));
	const positionNameToCheckerElements = Map.groupBy(checkerElements, checkerElement => checkerElement.position.constructor.name);
	if (positionNameToCheckerElements.has(Bar.name)) {
		positionNameToCheckerElements.get(Bar.name)
			.forEach(checkerElement => {
				checkerElement.permissibleDestinationPoints = /** @type {Set<Point>} */ (new Set(
					dieElements
						.map(dieElement => new Checker(checkerElement.player, checkerElement.position).moveBy(dieElement.value))
						.filter(potentialCheckerMovement => potentialCheckerMovement !== null)
						.map(potentialCheckerMovement => potentialCheckerMovement.position)
						.filter(potentialDestinationPosition => {
							if (potentialDestinationPosition instanceof Point) {
								/** @type {NodeListOf<CheckerElement>} */
								const potentialDestinationCheckers = document.querySelectorAll(`#checkers > [data-point="${potentialDestinationPosition.value}"]`);
								return potentialDestinationCheckers.length <= 1 || new CheckerOnBoardElement(potentialDestinationCheckers[0]).player.value === checkerElement.player.value;
							} else {
								throw Error();
							}
						}),
				));
			});
		(positionNameToCheckerElements.get(Point.name) ?? [])
			.forEach(checkerElement => {
				checkerElement.permissibleDestinationPoints = new Set();
			});
	} else {
		(positionNameToCheckerElements.get(Point.name) ?? [])
			.forEach(checkerElement => {
				checkerElement.permissibleDestinationPoints = /** @type {Set<Point>} */ (new Set(
					dieElements
						.map(dieElement => new Checker(checkerElement.player, checkerElement.position).moveBy(dieElement.value))
						.filter(potentialCheckerMovement => potentialCheckerMovement !== null)
						.map(potentialCheckerMovement => potentialCheckerMovement.position)
						.filter(potentialDestinationPosition => {
							if (potentialDestinationPosition instanceof Point) {
								/** @type {NodeListOf<CheckerElement>} */
								const potentialDestinationCheckers = document.querySelectorAll(`#checkers > [data-point="${potentialDestinationPosition.value}"]`);
								return potentialDestinationCheckers.length <= 1 || new CheckerOnBoardElement(potentialDestinationCheckers[0]).player.value === checkerElement.player.value;
							} else {
								throw Error();
							}
						}),
				));
			});
	}
}

let ignoreCheckerClicks = false;

checkersElement.addEventListener(`click`, event => {
	if (ignoreCheckerClicks) {
		ignoreCheckerClicks = false;
		return;
	}
	const checkerElement = new CheckerOnBoardElement((/** @type {SVGUseElement} */ (event.target)).closest(`#checkers > *`));
	if (checkerElement.permissibleDestinationPoints.size === 0) return;
	const dieElement = Array.from(/** @type {NodeListOf<DieElement>} */ (document.querySelectorAll(`#dice veyndan-die:not([data-played-at])`)))
		.find(dieElement =>
			Array.from(checkerElement.permissibleDestinationPoints)
				.some(permissibleDestinationPoint => {
					const potentialDestinationChecker = new Checker(checkerElement.player, checkerElement.position).moveBy(dieElement.value);
					if (potentialDestinationChecker === null) return false;
					if (potentialDestinationChecker.position instanceof Point) {
						return potentialDestinationChecker.position.value === permissibleDestinationPoint.value;
					} else {
						throw Error();
					}
				}),
		);
	dieElement.playedAt = Date.now();
	const oldPosition = checkerElement.position;
	checkerElement.position = new Checker(checkerElement.player, checkerElement.position).moveBy(dieElement.value).position;
	const moves = [
		new Move(checkerElement.player, oldPosition, checkerElement.position),
	];
	// noinspection JSUnresolvedReference
	/** @type {CheckerElement} */
		// @ts-ignore
	const opponentCheckerOnPointElement = document.querySelector(`#checkers > [data-point="${(checkerElement.position.value)}"]:not([data-player="${checkerElement.player.value}"])`);
	if (opponentCheckerOnPointElement !== null) {
		const opponentCheckerOnPointCheckerElement = new CheckerOnBoardElement(opponentCheckerOnPointElement);
		const oldOpponentPosition = opponentCheckerOnPointCheckerElement.position;
		opponentCheckerOnPointCheckerElement.position = new Bar();
		moves.push(new Move(opponentCheckerOnPointCheckerElement.player, oldOpponentPosition, opponentCheckerOnPointCheckerElement.position));
	}
	turn.touches.push(new Touch(moves));
});
checkersElement.addEventListener(`pointerover`, event => {
	const checkerElementTarget = (/** @type {Element} */ (event.target)).closest(`#checkers > :not([data-permissible-destination-points="[]"])`);
	if (checkerElementTarget !== null && checkerElementTarget.nextSibling !== null) {
		/**
		 * Making the checker the last sibling checker means that the selected checker can draw over all other
		 * checkers.
		 *
		 * Invoked before drag logic for proper event propagation after this point.
		 */
		checkersElement.appendChild(checkerElementTarget);
	}
});
checkersElement.addEventListener('pointerdown', event => {
	const checkerElement = new CheckerOnBoardElement((/** @type {Element} */ (event.target)).closest(`#checkers > *`));
	if (checkerElement.permissibleDestinationPoints.size === 0) return;

	checkerElement.target.setPointerCapture(event.pointerId);

	const halfElement = /** @type {CheckerElement} */ (document.querySelector(`.half`));

	const boundary = new DOMRect(0, 0, halfElement.clientWidth * 2 + 38 + 8 * 2, halfElement.clientHeight);

	const getPointerPosition = (/** @type {PointerEvent} */ event) => {
		const CTM = svgElement.getScreenCTM();
		const clientPoint = new DOMPointReadOnly(event.clientX, event.clientY);
		return clientPoint.matrixTransform(CTM.inverse());
	};

	const offset = DOMPoint.fromPoint(getPointerPosition(event));

	// Replace string parsing with CSS Typed Object Model API when it's available on Firefox.
	//  https://developer.mozilla.org/en-US/docs/Web/API/CSS_Typed_OM_API#browser_compatibility
	const translateCoordinates = window.getComputedStyle(checkerElement.target).translate
		.split(` `)
		.map(coordinateString => Number(coordinateString.substring(0, coordinateString.indexOf(`px`))));

	// Get initial translation
	offset.x -= translateCoordinates[0];
	offset.y -= translateCoordinates[1] ?? 0;

	// BEGIN Confine
	const minX = boundary.x;
	const maxX = boundary.x + boundary.width - checkerElement.target.clientWidth;
	const minY = boundary.y;
	const maxY = boundary.y + boundary.height - checkerElement.target.clientHeight;
	// END Confine

	const initializeDrag = () => {
		ignoreCheckerClicks = true;
		checkerElement.target.classList.add(`dragging`);
		event.preventDefault();

		checkerElement.permissibleDestinationPoints
			.forEach(permissibleDestinationPoint => {
				const dropPointElement = document.createElement(`div`);
				dropPointElement.classList.add(`drop-point`);
				dropPointElement.dataset[`point`] = `${permissibleDestinationPoint.value}`
				dropPointElement.style.setProperty(`--point`, `${permissibleDestinationPoint.value}`);
				document.getElementById(`drop-points`).append(dropPointElement);
			});
	};

	const drag = (/** @type {PointerEvent} */ event) => {
		event.preventDefault();

		const coord = getPointerPosition(event);
		// @ts-ignore
		const dx = Math.clamp(coord.x - offset.x, minX, maxX);
		// @ts-ignore
		const dy = Math.clamp(coord.y - offset.y, minY, maxY);

		checkerElement.target.style.translate = `${dx}px ${dy}px`;
	};

	const pointFromCoordinates = (/** @type {DOMPoint} */ coordinates) => {
		// @ts-ignore
		const dx = Math.clamp(coordinates.x - offset.x, minX, maxX);
		// @ts-ignore
		const dy = Math.clamp(coordinates.y - offset.y, minY, maxY);
		let point = null;
		const checkerDiameter = /** @type {CheckerElement} */ (document.querySelector(`#checkers > *`)).clientWidth;
		const pointHeight = document.querySelector(`veyndan-point`).getBoundingClientRect().y
		const barWidth = 38 + 8 * 2;
		let additionalPoints;
		let multiplier;
		if (dy <= pointHeight) {
			additionalPoints = 12;
			multiplier = 1;
		} else if (dy >= (halfElement.clientHeight - checkerDiameter - pointHeight)) {
			additionalPoints = 13;
			multiplier = -1;
		} else {
			additionalPoints = null;
		}
		if (additionalPoints !== null) {
			if (dx <= halfElement.clientWidth - (checkerDiameter / 2)) {
				point = new Point(multiplier * Math.round(dx / checkerDiameter + 1) + additionalPoints);
			} else if (dx >= halfElement.clientWidth && dx <= (halfElement.clientWidth + barWidth - checkerDiameter)) {
				point = null
			} else if (dx < halfElement.clientWidth) {
				// If most of the checker is on the bar, but some of it is on a point in the left half of the board,
				// just put it on the point on the left half.
				point = new Point(additionalPoints + multiplier * 6);
			} else if (dx < halfElement.clientWidth + barWidth - (checkerDiameter / 2)) {
				// If most of the checker is on the bar, but some of it is on a point in the right half of the board,
				// just put it on the point on the right half.
				point = new Point(additionalPoints + multiplier * 7);
			} else {
				point = new Point(multiplier * Math.round((dx - barWidth) / checkerDiameter + 1) + additionalPoints);
			}
		}
		return point;
	};

	const abortController = new AbortController();

	const endDrag = (/** @type {PointerEvent} */ event) => {
		const coord = getPointerPosition(event);
		const point = pointFromCoordinates(coord);
		const dieElement = Array.from(/** @type {NodeListOf<DieElement>} */ (document.querySelectorAll(`#dice veyndan-die:not([data-played-at])`)))
			.find(unplayedDieElement => {
				const potentialDestinationChecker = new Checker(checkerElement.player, checkerElement.position).moveBy(unplayedDieElement.value);
				if (potentialDestinationChecker === null) return false;
				if (potentialDestinationChecker.position instanceof Point) {
					return Array.from(checkerElement.permissibleDestinationPoints).map(permissibleDestinationPoint => permissibleDestinationPoint.value).includes(potentialDestinationChecker.position.value) && point !== null && potentialDestinationChecker.position.value === point.value;
				} else {
					throw Error();
				}
			});
		if (dieElement !== undefined) {
			dieElement.playedAt = Date.now();
			const oldPosition = checkerElement.position;
			checkerElement.position = point;
			const moves = [
				new Move(checkerElement.player, oldPosition, checkerElement.position),
			];
			/** @type {CheckerElement} */
			const opponentCheckerOnPointElement = document.querySelector(`#checkers > [data-point="${(point.value)}"]:not([data-player="${checkerElement.player.value}"])`);
			if (opponentCheckerOnPointElement !== null) {
				const opponentCheckerOnPointCheckerElement = new CheckerOnBoardElement(opponentCheckerOnPointElement);
				const oldOpponentPosition = opponentCheckerOnPointCheckerElement.position;
				opponentCheckerOnPointCheckerElement.position = new Bar();
				moves.push(new Move(opponentCheckerOnPointCheckerElement.player, oldOpponentPosition, opponentCheckerOnPointCheckerElement.position));
			}
			turn.touches.push(new Touch(moves));
		}
		document.getElementById(`drop-points`).replaceChildren();
		checkerElement.target.classList.remove(`dragging`);
		checkerElement.target.style.translate = null;
		abortController.abort();
	};

	const keydownEventListener = (/** @type {KeyboardEvent} */ event) => {
		if (event.key === `Escape`) {
			event.preventDefault();
			checkerElement.target.classList.remove(`dragging`);
			checkerElement.target.style.translate = null;
			document.getElementById(`drop-points`).replaceChildren();
			abortController.abort();
		}
	};
	addEventListener(`keydown`, keydownEventListener, {signal: abortController.signal});
	checkerElement.target.addEventListener('pointermove', initializeDrag, {once: true, signal: abortController.signal});
	checkerElement.target.addEventListener('pointermove', drag, {signal: abortController.signal});
	checkerElement.target.addEventListener('pointerup', endDrag, {signal: abortController.signal});
	checkerElement.target.addEventListener('pointerleave', endDrag, {signal: abortController.signal});
	checkerElement.target.addEventListener('pointercancel', endDrag, {signal: abortController.signal});
});
