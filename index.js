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

/**
 * @param {number} point
 * @param {number} containerHeight
 * @param {number} destinationPointCheckerCount
 * @return {string}
 */
const pointTranslation = (point, containerHeight, destinationPointCheckerCount = 0) => {
	const checkerDiameter = 40;
	const barWidth = 50;
	const containerWidth = 490;
	return `${(point <= 12 ? -1 : 1) * (((point - 1) % 12 * checkerDiameter) + ((point - 1) % 12 >= 6 ? barWidth : 0)) + (point <= 12 ? containerWidth : 0)}px ${point <= 12 ? (containerHeight - destinationPointCheckerCount * checkerDiameter) : (destinationPointCheckerCount * checkerDiameter)}px`;
};

const checkersObserver = new MutationObserver(mutations => {
	mutations.forEach(mutation => {
		const checkerElement = new CheckerElement(mutation.target);
		const destinationPointCheckerCount = document.querySelectorAll(`use[href="#checker"][data-point="${(checkerElement.point)}"]`).length - 1;
		checkerElement.target.style.translate = pointTranslation(checkerElement.point, 380, destinationPointCheckerCount);
		updateMovabilityOfCheckers();
	});
});

checkersObserver.observe(
	checkersElement,
	{
		attributeFilter: [`data-point`],
		childList: true,
		subtree: true,
	},
);

document.getElementById(`undo`).addEventListener(`click`, () => {
	const playedDieElements = Array.from(document.querySelectorAll(`#dice [data-played="true"]`))
		.map(target => new DieElement(target));
	if (playedDieElements.length === 1) {
		document.getElementById(`undo`).style.display = `none`;
	}
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
				const secondDieElement = DieElement.create(0);
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

(function makeDraggable() {
	let selectedCheckerElement, offset, minX, maxX, minY, maxY;

	const boundaryX1 = 0;
	const boundaryX2 = checkersElement.getBBox().width;
	const boundaryY1 = 0;
	const boundaryY2 = checkersElement.getBBox().height;

	const getMousePosition = event => {
		const CTM = svgElement.getScreenCTM();
		if (event.touches) {
			event = event.touches[0];
		}
		return {
			x: (event.clientX - CTM.e) / CTM.a,
			y: (event.clientY - CTM.f) / CTM.d,
		};
	};

	const startDrag = event => {
		const checkerElement = new CheckerElement(event.target);
		if (!checkerElement.movable) return;
		selectedCheckerElement = checkerElement;
		offset = getMousePosition(event);

		// Replace string parsing with CSS Typed Object Model API when it's available on Firefox.
		//  https://developer.mozilla.org/en-US/docs/Web/API/CSS_Typed_OM_API#browser_compatibility
		const translateCoordinates = window.getComputedStyle(selectedCheckerElement.target).translate
			.split(` `)
			.map(coordinateString => Number(coordinateString.substring(0, coordinateString.indexOf(`px`))));

		// Get initial translation
		offset.x -= translateCoordinates[0];
		offset.y -= translateCoordinates[1] ?? 0;

		// BEGIN Confine
		const bbox = selectedCheckerElement.target.getBBox();
		minX = boundaryX1 - bbox.x;
		maxX = boundaryX2 - bbox.x - bbox.width;
		minY = boundaryY1 - bbox.y;
		maxY = boundaryY2 - bbox.y - bbox.height;
		// END Confine
	};

	const drag = event => {
		if (selectedCheckerElement !== undefined && selectedCheckerElement !== null) {
			selectedCheckerElement.target.classList.add(`dragging`);
			event.preventDefault();

			const coord = getMousePosition(event);
			const dx = Math.clamp(coord.x - offset.x, minX, maxX);
			const dy = Math.clamp(coord.y - offset.y, minY, maxY);

			selectedCheckerElement.target.style.translate = `${dx}px ${dy}px`;

			const dieElement = new DieElement(document.querySelector(`#dice :not([data-played="true"])`));
			const point = new Checker(selectedCheckerElement.player, selectedCheckerElement.point).moveBy(dieElement.value).point;
			const dropPointElement = document.createElementNS(`http://www.w3.org/2000/svg`, `use`);
			dropPointElement.setAttribute(`href`, `#drop-point`);
			dropPointElement.style.translate = pointTranslation(point, 446);
			document.getElementById(`drop-points`).append(dropPointElement);
		}
	};

	const endDrag = () => {
		if (selectedCheckerElement !== undefined && selectedCheckerElement !== null) {
			const dieElement = new DieElement(document.querySelector(`#dice :not([data-played="true"])`));
			dieElement.played = true;
			document.getElementById(`undo`).style.display = `unset`;
			selectedCheckerElement.point = new Checker(selectedCheckerElement.player, selectedCheckerElement.point).moveBy(dieElement.value).point;
			selectedCheckerElement.touchedAccordingToId = dieElement.id;
			selectedCheckerElement.target.classList.remove(`dragging`);
			document.getElementById(`drop-points`).replaceChildren();
			selectedCheckerElement = null;
		}
	};

	addEventListener(`keydown`, (event) => {
		if (selectedCheckerElement !== undefined && selectedCheckerElement !== null && event.key === `Escape`) {
			event.preventDefault();
			const destinationPointCheckerCount = document.querySelectorAll(`use[href="#checker"][data-point="${(selectedCheckerElement.point)}"]`).length - 1;
			selectedCheckerElement.target.style.translate = pointTranslation(selectedCheckerElement.point, 380, destinationPointCheckerCount);
			selectedCheckerElement.target.classList.remove(`dragging`);
			document.getElementById(`drop-points`).replaceChildren();
			selectedCheckerElement = null;
		}
	});
	svgElement.addEventListener('mousedown', startDrag);
	svgElement.addEventListener('mousemove', drag);
	svgElement.addEventListener('mouseup', endDrag);
	svgElement.addEventListener('mouseleave', endDrag);
	svgElement.addEventListener('touchstart', startDrag);
	svgElement.addEventListener('touchmove', drag);
	svgElement.addEventListener('touchend', endDrag);
	svgElement.addEventListener('touchleave', endDrag);
	svgElement.addEventListener('touchcancel', endDrag);
})()
