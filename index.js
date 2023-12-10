/**
 * https://rwaldron.github.io/proposal-math-extensions/#sec-math.clamp
 *
 * @param {number} x
 * @param {number} lower
 * @param {number} upper
 * @return {number}
 */
import Checker from "./checker.js";

Math.clamp = function (x, lower, upper) {
	return Math.min(Math.max(x, lower), upper);
};

class CheckerElement {
	/**
	 * @param {SVGUseElement} target
	 */
	constructor(target) {
		this.target = target;
	}

	/**
	 * @return {Set<number>}
	 */
	get permissibleDestinationPoints() {
		return new Set(JSON.parse(this.target.dataset[`permissibleDestinationPoints`] ?? "[]"));
	}

	/**
	 * @param {Set<number>} value
	 */
	set permissibleDestinationPoints(value) {
		this.target.dataset[`permissibleDestinationPoints`] = JSON.stringify(Array.from(value));
	}

	/**
	 * @return {string}
	 */
	get player() {
		return this.target.dataset[`player`];
	}

	/**
	 * @return {number}
	 */
	get point() {
		return Number(this.target.dataset[`point`]);
	}

	/**
	 * @param {number} value
	 */
	set point(value) {
		this.target.dataset[`point`] = `${value}`
		this.target.style.setProperty(`--point`, `${value}`);
	}

	/**
	 * @return {number}
	 */
	get pointStackIndex() {
		return Number(this.target.dataset[`pointStackIndex`]);
	}

	/**
	 * @param {number} value
	 */
	set pointStackIndex(value) {
		this.target.dataset[`pointStackIndex`] = `${value}`
		this.target.style.setProperty(`--point-stack-index`, `${value}`);

		this.target.querySelector(`text`).textContent = value > 4 ? `${value + 1}` : null;
	}

	/**
	 * @param {number} value
	 */
	set pointStackCount(value) {
		this.target.dataset[`pointStackCount`] = `${value}`
		this.target.style.setProperty(`--point-stack-count`, `${value}`);
	}

	/**
	 * @return {number[]}
	 */
	get touchedAccordingToDiceValues() {
		return JSON.parse(this.target.dataset[`touchedAccordingToDiceValues`] ?? `[]`);
	}

	/**
	 * @param {number[]} value
	 */
	set touchedAccordingToDiceValues(value) {
		this.target.dataset[`touchedAccordingToDiceValues`] = JSON.stringify(value);
	}
}

class DieElement {
	/**
	 * @param {SVGUseElement} target
	 */
	constructor(target) {
		this.target = target;
	}

	/**
	 * @param {number} value
	 * @return {DieElement}
	 */
	static create(value = this.#generateRandomValue()) {
		const useElement = document.createElementNS(`http://www.w3.org/2000/svg`, `use`);
		useElement.setAttribute(`href`, `#die-face-pip-${value}`);
		useElement.dataset[`value`] = `${value}`;
		useElement.classList.add(`die`);
		return new DieElement(useElement);
	}

	/**
	 * @return {(number|undefined)}
	 */
	get playedAt() {
		const playedAtDataAttribute = this.target.dataset[`playedAt`];
		if (playedAtDataAttribute !== undefined) {
			return Number(playedAtDataAttribute);
		} else {
			return undefined;
		}
	}

	/**
	 * @param {(number|undefined)} value
	 */
	set playedAt(value) {
		if (value !== undefined) {
			this.target.dataset[`playedAt`] = String(value);
		} else {
			delete this.target.dataset[`playedAt`];
		}
	}

	/**
	 * @return {number}
	 */
	get value() {
		return Number(this.target.dataset[`value`]);
	}

	/**
	 * @return {number}
	 */
	static #generateRandomValue() {
		return Math.floor(Math.random() * 6 + 1);
	}
}

const svgElement = document.getElementsByTagName(`svg`)[0];
const checkersElement = document.getElementById('checkers');

const checkersObserver = new MutationObserver(mutations => {
	mutations.forEach(mutation => {
		const checkerElement = new CheckerElement(mutation.target);
		if (checkerElement.point !== Number(mutation.oldValue)) {
			checkerElement.pointStackIndex = document.querySelectorAll(`#checkers > [data-point="${(checkerElement.point)}"]`).length - 1;
			Array.from(document.querySelectorAll(`#checkers > [data-point="${(checkerElement.point)}"]`))
				.map(target => new CheckerElement(target))
				.forEach((checkerElement, _, checkerElements) => {
					checkerElement.pointStackCount = checkerElements.length;
				});
			// When moving a checker that isn't on the top of the stack, reposition the checkers such that there is no longer a gap.
			Array.from(document.querySelectorAll(`#checkers > [data-point="${mutation.oldValue}"]`))
				.map(target => new CheckerElement(target))
				.sort((a, b) => a.pointStackIndex - b.pointStackIndex)
				.forEach((checkerElement, index, checkerElements) => {
					checkerElement.pointStackIndex = index;
					checkerElement.pointStackCount = checkerElements.length;
				});
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
		const dieElement = new DieElement(mutation.target)
		if (dieElement.playedAt !== undefined) {
			document.getElementById(`undo`).style.display = `unset`;
			const unplayedDieElements = Array.from(document.querySelectorAll(`#dice :not([data-played-at])`))
				.map(target => new DieElement(target));
			if (unplayedDieElements.length === 0) {
				document.getElementById(`dice`).style.display = `none`;
				document.getElementById(`confirm`).style.display = `unset`;
			}
		} else {
			const playedDieElements = Array.from(document.querySelectorAll(`#dice [data-played-at]`))
				.map(target => new DieElement(target));
			if (playedDieElements.length === 0) {
				document.getElementById(`undo`).style.display = `none`;
			} else {
				document.getElementById(`dice`).style.display = `unset`;
				document.getElementById(`confirm`).style.display = `none`;
			}
		}
	});
});

diceObserver.observe(
	document.getElementById(`dice`),
	{
		attributeFilter: [`data-played-at`],
		subtree: true,
	},
);

document.getElementById(`undo`).addEventListener(`click`, () => {
	const lastPlayedDieElement = Array.from(document.querySelectorAll(`#dice [data-played-at]`))
		.map(target => new DieElement(target))
		.reduce((mostRecentlyPlayedDieElement, dieElement) => mostRecentlyPlayedDieElement.playedAt > dieElement.playedAt ? mostRecentlyPlayedDieElement : dieElement);
	const lastMovedCheckerElement = Array.from(document.querySelectorAll(`#checkers > *`))
		.map(target => new CheckerElement(target))
		.find(checkerElement => checkerElement.touchedAccordingToDiceValues.indexOf(lastPlayedDieElement.value) !== -1);
	lastMovedCheckerElement.point = new Checker(lastMovedCheckerElement.player, lastMovedCheckerElement.point).moveBy(-lastPlayedDieElement.value).point;
	lastMovedCheckerElement.touchedAccordingToDiceValues = lastMovedCheckerElement.touchedAccordingToDiceValues.slice(0, -1);
	lastPlayedDieElement.playedAt = undefined;
});

document.getElementById(`roll-dice`).addEventListener(`click`, event => {
	event.currentTarget.style.display = `none`;

	/**
	 * @param {number} limit
	 */
	function repeatedlyRollDice(limit) {
		const diceElement = document.querySelector(`#dice`);
		diceElement.replaceChildren(DieElement.create().target, DieElement.create().target);
		let count = 1;
		const intervalID = setInterval(
			() => {
				const firstDieElement = DieElement.create();
				const secondDieElement = DieElement.create();
				diceElement.replaceChildren(firstDieElement.target, secondDieElement.target);

				if (++count === limit) {
					clearInterval(intervalID);
					if (firstDieElement.value === secondDieElement.value) {
						setTimeout(
							() => diceElement.append(DieElement.create(firstDieElement.value).target, DieElement.create(firstDieElement.value).target),
							200,
						);
					}
					updateMovabilityOfCheckers();
				}
			},
			50,
		);
	}

	repeatedlyRollDice(5);
});

function updateMovabilityOfCheckers() {
	const dieElements = Array.from(document.querySelectorAll(`#dice :not([data-played-at])`))
		.map(target => new DieElement(target));
	Array.from(document.getElementById(`checkers`).children)
		.map(value => new CheckerElement(value))
		.forEach(checkerElement => {
			checkerElement.permissibleDestinationPoints = new Set(
				dieElements
					.map(dieElement => new Checker(checkerElement.player, checkerElement.point).moveBy(dieElement.value).point)
					.filter(potentialDestinationPoint => potentialDestinationPoint >= 1 && potentialDestinationPoint <= 24)
					.filter(potentialDestinationPoint => {
						const potentialDestinationCheckers = document.querySelectorAll(`#checkers > [data-point="${potentialDestinationPoint}"]`);
						return potentialDestinationCheckers.length <= 1 || new CheckerElement(potentialDestinationCheckers[0]).player === checkerElement.player;
					})
			);
		});
}

let ignoreCheckerClicks = false;

checkersElement.addEventListener(`click`, event => {
	if (ignoreCheckerClicks) {
		ignoreCheckerClicks = false;
		return;
	}
	const checkerElement = new CheckerElement(event.target.closest(`#checkers > *`));
	if (checkerElement.permissibleDestinationPoints.size === 0) return;
	const dieElement = Array.from(document.querySelectorAll(`#dice :not([data-played-at])`))
		.map(target => new DieElement(target))
		.find(dieElement => checkerElement.permissibleDestinationPoints.has(new Checker(checkerElement.player, checkerElement.point).moveBy(dieElement.value).point));
	dieElement.playedAt = Date.now();
	checkerElement.point = new Checker(checkerElement.player, checkerElement.point).moveBy(dieElement.value).point;
	checkerElement.touchedAccordingToDiceValues = checkerElement.touchedAccordingToDiceValues.concat(dieElement.value);
});
checkersElement.addEventListener(`pointerover`, event => {
	const checkerElementTarget = event.target.closest(`#checkers > *`);
	if (checkerElementTarget.nextSibling !== null) {
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
	const checkerElement = new CheckerElement(event.target.closest(`#checkers > *`));
	if (checkerElement.permissibleDestinationPoints.size === 0) return;

	checkerElement.target.setPointerCapture(event.pointerId);

	const boundary = checkersElement.getBBox();

	const getPointerPosition = event => {
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
	const bbox = checkerElement.target.getBBox();
	const minX = boundary.x - bbox.x;
	const maxX = boundary.x + boundary.width - bbox.x - bbox.width;
	const minY = boundary.y - bbox.y;
	const maxY = boundary.y + boundary.height - bbox.y - bbox.height;
	// END Confine

	const initializeDrag = () => {
		ignoreCheckerClicks = true;
		checkerElement.target.classList.add(`dragging`);
		event.preventDefault();

		checkerElement.permissibleDestinationPoints
			.forEach(permissibleDestinationPoint => {
				const dropPointElement = document.createElementNS(`http://www.w3.org/2000/svg`, `use`);
				dropPointElement.setAttribute(`href`, `#drop-point`);
				dropPointElement.dataset[`point`] = `${permissibleDestinationPoint}`
				dropPointElement.style.setProperty(`--point`, `${permissibleDestinationPoint}`);
				document.getElementById(`drop-points`).append(dropPointElement);
			});
	};

	const drag = event => {
		event.preventDefault();

		const coord = getPointerPosition(event);
		const dx = Math.clamp(coord.x - offset.x, minX, maxX);
		const dy = Math.clamp(coord.y - offset.y, minY, maxY);

		checkerElement.target.style.translate = `${dx}px ${dy}px`;
	};

	const pointFromCoordinates = (coordinates) => {
		const dx = Math.clamp(coordinates.x - offset.x, minX, maxX);
		const dy = Math.clamp(coordinates.y - offset.y, minY, maxY);
		let point = null;
		const halfBBox = document.querySelector(`.half`).getBBox();
		const checkerDiameter = document.querySelector(`#checkers > *`).getBBox().width;
		const pointHeight = document.querySelector(`use[href="#point"]`).getBBox().height;
		const barWidth = 50;
		let additionalPoints;
		let multiplier;
		if (dy <= pointHeight) {
			additionalPoints = 12;
			multiplier = 1;
		} else if (dy >= (halfBBox.height - checkerDiameter - pointHeight)) {
			additionalPoints = 13;
			multiplier = -1;
		} else {
			additionalPoints = null;
		}
		if (additionalPoints !== null) {
			if (dx <= halfBBox.width - (checkerDiameter / 2)) {
				point = multiplier * Math.round(dx / checkerDiameter + 1) + additionalPoints;
			} else if (dx >= halfBBox.width && dx <= (halfBBox.width + barWidth - checkerDiameter)) {
				point = null
			} else if (dx < halfBBox.width) {
				// If most of the checker is on the bar, but some of it is on a point in the left half of the board,
				// just put it on the point on the left half.
				point = additionalPoints + multiplier * 6;
			} else if (dx < halfBBox.width + barWidth - (checkerDiameter / 2)) {
				// If most of the checker is on the bar, but some of it is on a point in the right half of the board,
				// just put it on the point on the right half.
				point = additionalPoints + multiplier * 7;
			} else {
				point = multiplier * Math.round((dx - barWidth) / checkerDiameter + 1) + additionalPoints;
			}
		}
		return point;
	};

	const endDrag = (event) => {
		const coord = getPointerPosition(event);
		const point = pointFromCoordinates(coord);
		const dieElement = Array.from(document.querySelectorAll(`#dice :not([data-played-at])`))
			.map(target => new DieElement(target))
			.find(unplayedDieElement => {
				const potentialDestinationPoint = new Checker(checkerElement.player, checkerElement.point).moveBy(unplayedDieElement.value).point;
				return checkerElement.permissibleDestinationPoints.has(potentialDestinationPoint) && potentialDestinationPoint === point;
			});
		if (dieElement !== undefined) {
			dieElement.playedAt = Date.now();
			checkerElement.point = point;
			checkerElement.touchedAccordingToDiceValues = checkerElement.touchedAccordingToDiceValues.concat(dieElement.value);
		} else {
			// Triggers movement back to point of origin.
			// noinspection SillyAssignmentJS
			checkerElement.point = checkerElement.point;
		}
		document.getElementById(`drop-points`).replaceChildren();
		checkerElement.target.classList.remove(`dragging`);
		checkerElement.target.style.translate = null;
		checkerElement.target.removeEventListener(`pointermove`, initializeDrag);
		checkerElement.target.removeEventListener(`pointermove`, drag);
		checkerElement.target.removeEventListener('pointerup', endDrag);
		checkerElement.target.removeEventListener('pointerleave', endDrag);
		checkerElement.target.removeEventListener('pointercancel', endDrag);
		removeEventListener(`keydown`, keydownEventListener);
	};

	const keydownEventListener = (event) => {
		if (event.key === `Escape`) {
			event.preventDefault();
			checkerElement.target.classList.remove(`dragging`);
			checkerElement.target.style.translate = null;
			document.getElementById(`drop-points`).replaceChildren();
			checkerElement.target.removeEventListener(`pointermove`, initializeDrag);
			checkerElement.target.removeEventListener(`pointermove`, drag);
			checkerElement.target.removeEventListener('pointerup', endDrag);
			checkerElement.target.removeEventListener('pointerleave', endDrag);
			checkerElement.target.removeEventListener('pointercancel', endDrag);
			removeEventListener(`keydown`, keydownEventListener);
		}
	};
	addEventListener(`keydown`, keydownEventListener);
	checkerElement.target.addEventListener('pointermove', initializeDrag, {once: true});
	checkerElement.target.addEventListener('pointermove', drag);
	checkerElement.target.addEventListener('pointerup', endDrag);
	checkerElement.target.addEventListener('pointerleave', endDrag);
	checkerElement.target.addEventListener('pointercancel', endDrag);
});
