/**
 * https://rwaldron.github.io/proposal-math-extensions/#sec-math.clamp
 *
 * @param {number} x
 * @param {number} lower
 * @param {number} upper
 * @return {number}
 */
Math.clamp = function (x, lower, upper) {
	return Math.min(Math.max(x, lower), upper);
};

class Checker {
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
		return new Checker(this.player, this.point + (this.player === `1` ? -offset : offset))
	}
}

class CheckerElement {
	/**
	 * @param {SVGUseElement} target
	 */
	constructor(target) {
		this.target = target;
	}

	/**
	 * @return {boolean}
	 */
	get movable() {
		return this.target.dataset[`movable`] === String(true);
	}

	/**
	 * @param {boolean} value
	 */
	set movable(value) {
		this.target.dataset[`movable`] = String(value);
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
	}

	/**
	 * @param {string} value
	 */
	set touchedAccordingToId(value) {
		this.target.dataset[`touchedAccordingToDie${value}`] = String(true);
	}

	/**
	 * @param {string} value
	 */
	deleteTouchedAccordingToId(value) {
		delete this.target.dataset[`touchedAccordingToDie${value}`];
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
	 * @param {number} id
	 * @param {number} value
	 * @return {DieElement}
	 */
	static create(id, value = this.#generateRandomValue()) {
		const useElement = document.createElementNS(`http://www.w3.org/2000/svg`, `use`);
		useElement.setAttribute(`href`, `#die-face-pip-${value}`);
		useElement.dataset[`id`] = `${id}`;
		useElement.dataset[`value`] = `${value}`;
		useElement.classList.add(`die`);
		return new DieElement(useElement);
	}

	/**
	 * @return {string}
	 */
	get id() {
		return this.target.dataset[`id`];
	}

	/**
	 * @return {boolean}
	 */
	get played() {
		return this.target.dataset[`played`] === String(true);
	}

	/**
	 * @param {boolean} value
	 */
	set played(value) {
		this.target.dataset[`played`] = String(value);
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
			checkerElement.pointStackIndex = document.querySelectorAll(`use[href="#checker"][data-point="${(checkerElement.point)}"]`).length - 1;
			// When moving a checker that isn't on the top of the stack, reposition the checkers such that there is no longer a gap.
			Array.from(document.querySelectorAll(`use[href="#checker"][data-point="${mutation.oldValue}"]`))
				.map(target => new CheckerElement(target))
				.sort((a, b) => a.pointStackIndex - b.pointStackIndex)
				.forEach((checkerElement, index) => {
					checkerElement.pointStackIndex = index;
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
		if (dieElement.played) {
			document.getElementById(`undo`).style.display = `unset`;
			const unplayedDieElements = Array.from(document.querySelectorAll(`#dice :not([data-played="true"])`))
				.map(target => new DieElement(target));
			if (unplayedDieElements.length === 0) {
				document.getElementById(`dice`).style.display = `none`;
				document.getElementById(`confirm`).style.display = `unset`;
			}
		} else {
			const playedDieElements = Array.from(document.querySelectorAll(`#dice [data-played="true"]`))
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
		attributeFilter: [`data-played`],
		subtree: true,
	},
);

document.getElementById(`undo`).addEventListener(`click`, () => {
	const playedDieElements = Array.from(document.querySelectorAll(`#dice [data-played="true"]`))
		.map(target => new DieElement(target));
	const lastPlayedDieElement = playedDieElements.pop();
	const lastMovedCheckerElement = new CheckerElement(document.querySelector(`#checkers > [data-touched-according-to-die${(lastPlayedDieElement.id)}="true"]`));
	lastMovedCheckerElement.point = new Checker(lastMovedCheckerElement.player, lastMovedCheckerElement.point).moveBy(-lastPlayedDieElement.value).point;
	lastMovedCheckerElement.deleteTouchedAccordingToId(lastPlayedDieElement.id);
	lastPlayedDieElement.played = false;
});

document.getElementById(`roll-dice`).addEventListener(`click`, event => {
	event.currentTarget.style.display = `none`;

	/**
	 * @param {number} limit
	 */
	function repeatedlyRollDice(limit) {
		const diceElement = document.querySelector(`#dice`);
		diceElement.replaceChildren(DieElement.create(0).target, DieElement.create(1).target);
		let count = 1;
		const intervalID = setInterval(
			() => {
				const firstDieElement = DieElement.create(0);
				const secondDieElement = DieElement.create(1);
				diceElement.replaceChildren(firstDieElement.target, secondDieElement.target);

				if (++count === limit) {
					clearInterval(intervalID);
					if (firstDieElement.value === secondDieElement.value) {
						setTimeout(
							() => diceElement.append(DieElement.create(2, firstDieElement.value).target, DieElement.create(3, firstDieElement.value).target),
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
	const dieElementTarget = document.querySelector(`#dice :not([data-played="true"])`);
	const checkerElements = Array.from(document.getElementById(`checkers`).children)
		.map(value => new CheckerElement(value));
	if (dieElementTarget !== null) {
		const dieElement = new DieElement(dieElementTarget);
		checkerElements.forEach(checkerElement => {
			const potentialDestinationPoint = new Checker(checkerElement.player, checkerElement.point).moveBy(dieElement.value).point;
			const potentialDestinationCheckers = document.querySelectorAll(`use[href="#checker"][data-point="${potentialDestinationPoint}"]`)
			checkerElement.movable = potentialDestinationPoint >= 1 && potentialDestinationPoint <= 24 && (potentialDestinationCheckers.length <= 1 || new CheckerElement(potentialDestinationCheckers[0]).player === checkerElement.player);
		});
	} else {
		checkerElements.forEach(checkerElement => {
			checkerElement.movable = false;
		});
	}
}

let ignoreCheckerClicks = false;

checkersElement.addEventListener(`click`, event => {
	if (ignoreCheckerClicks) {
		ignoreCheckerClicks = false;
		return;
	}
	const checkerElement = new CheckerElement(event.target);
	if (!checkerElement.movable) return;
	const dieElement = new DieElement(document.querySelector(`#dice :not([data-played="true"])`));
	dieElement.played = true;
	checkerElement.point = new Checker(checkerElement.player, checkerElement.point).moveBy(dieElement.value).point;
	checkerElement.touchedAccordingToId = dieElement.id;
});
checkersElement.addEventListener(`pointerover`, event => {
	if (event.target.nextSibling !== null) {
		/**
		 * Making the checker the last sibling checker means that the selected checker can draw over all other
		 * checkers.
		 *
		 * Invoked before drag logic for proper event propagation after this point.
		 */
		checkersElement.appendChild(event.target);
	}
});
checkersElement.addEventListener('pointerdown', event => {
	const checkerElement = new CheckerElement(event.target);
	if (!checkerElement.movable) return;

	checkerElement.target.setPointerCapture(event.pointerId);

	const boundaryX1 = 0;
	const boundaryX2 = checkersElement.getBBox().width;
	const boundaryY1 = 0;
	const boundaryY2 = checkersElement.getBBox().height;

	const getPointerPosition = event => {
		const CTM = svgElement.getScreenCTM();
		return {
			x: (event.clientX - CTM.e) / CTM.a,
			y: (event.clientY - CTM.f) / CTM.d,
		};
	};

	const offset = getPointerPosition(event);

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
	const minX = boundaryX1 - bbox.x;
	const maxX = boundaryX2 - bbox.x - bbox.width;
	const minY = boundaryY1 - bbox.y;
	const maxY = boundaryY2 - bbox.y - bbox.height;
	// END Confine

	const drag = event => {
		ignoreCheckerClicks = true;
		checkerElement.target.classList.add(`dragging`);
		event.preventDefault();

		const coord = getPointerPosition(event);
		const dx = Math.clamp(coord.x - offset.x, minX, maxX);
		const dy = Math.clamp(coord.y - offset.y, minY, maxY);

		checkerElement.target.style.translate = `${dx}px ${dy}px`;

		const dieElement = new DieElement(document.querySelector(`#dice :not([data-played="true"])`));
		const point = new Checker(checkerElement.player, checkerElement.point).moveBy(dieElement.value).point;
		const dropPointElement = document.createElementNS(`http://www.w3.org/2000/svg`, `use`);
		dropPointElement.setAttribute(`href`, `#drop-point`);
		dropPointElement.dataset[`point`] = `${point}`
		dropPointElement.style.setProperty(`--point`, `${point}`);
		document.getElementById(`drop-points`).append(dropPointElement);
	};

	const pointFromCoordinates = (coordinates) => {
		const dx = Math.clamp(coordinates.x - offset.x, minX, maxX);
		const dy = Math.clamp(coordinates.y - offset.y, minY, maxY);
		let point = null;
		const halfBoardWidth = 240;
		const halfBoardHeight = 420;
		const checkerDiameter = 40;
		const pointHeight = 158;
		const barWidth = 50;
		let additionalPoints;
		let multiplier;
		if (dy <= pointHeight) {
			additionalPoints = 12;
			multiplier = 1;
		} else if (dy >= (halfBoardHeight - checkerDiameter - pointHeight)) {
			additionalPoints = 13;
			multiplier = -1;
		} else {
			additionalPoints = null;
		}
		if (additionalPoints !== null) {
			if (dx <= halfBoardWidth - (checkerDiameter / 2)) {
				point = multiplier * Math.round(dx / checkerDiameter + 1) + additionalPoints;
			} else if (dx >= halfBoardWidth && dx <= (halfBoardWidth + barWidth - checkerDiameter)) {
				point = null
			} else if (dx < halfBoardWidth) {
				// If most of the checker is on the bar, but some of it is on a point in the left half of the board,
				// just put it on the point on the left half.
				point = additionalPoints + multiplier * 6;
			} else if (dx < halfBoardWidth + barWidth - (checkerDiameter / 2)) {
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
		const dieElement = new DieElement(document.querySelector(`#dice :not([data-played="true"])`));
		const permissibleDestinationPoint = new Checker(checkerElement.player, checkerElement.point).moveBy(dieElement.value).point;
		const coord = getPointerPosition(event);
		const point = pointFromCoordinates(coord);
		if (permissibleDestinationPoint === point) {
			dieElement.played = true;
			checkerElement.point = point;
			checkerElement.touchedAccordingToId = dieElement.id;
		} else {
			// Triggers movement back to point of origin.
			// noinspection SillyAssignmentJS
			checkerElement.point = checkerElement.point;
		}
		document.getElementById(`drop-points`).replaceChildren();
		checkerElement.target.classList.remove(`dragging`);
		checkerElement.target.style.translate = null;
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
			checkerElement.target.removeEventListener(`pointermove`, drag);
			checkerElement.target.removeEventListener('pointerup', endDrag);
			checkerElement.target.removeEventListener('pointerleave', endDrag);
			checkerElement.target.removeEventListener('pointercancel', endDrag);
			removeEventListener(`keydown`, keydownEventListener);
		}
	};
	addEventListener(`keydown`, keydownEventListener);
	checkerElement.target.addEventListener('pointermove', drag);
	checkerElement.target.addEventListener('pointerup', endDrag);
	checkerElement.target.addEventListener('pointerleave', endDrag);
	checkerElement.target.addEventListener('pointercancel', endDrag);
});
