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

const checkersObserver = new MutationObserver(mutations => {
	mutations.forEach(mutation => {
		const checkerElement = new CheckerElement(mutation.target);
		const destinationPointCheckerCount = document.querySelectorAll(`use[href="#checker"][data-point="${(checkerElement.point)}"]`).length - 1;
		checkerElement.target.style.translate = `${(checkerElement.point <= 12 ? -1 : 1) * (((checkerElement.point - 1) % 12 * 40) + ((checkerElement.point - 1) % 12 >= 6 ? 50 : 0)) + (checkerElement.point <= 12 ? 490 : 0)}px ${checkerElement.point <= 12 ? (380 - destinationPointCheckerCount * 40) : (destinationPointCheckerCount * 40)}px`;
		updateMovabilityOfCheckers(new DieElement(document.querySelector(`#dice :not([data-played="true"])`)));
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

document.getElementById(`checkers`).addEventListener(`click`, event => {
	const checkerElement = new CheckerElement(event.target);
	if (!checkerElement.movable) return;
	const dieElement = new DieElement(document.querySelector(`#dice :not([data-played="true"])`));
	dieElement.played = true;
	checkerElement.point = new Checker(checkerElement.player, checkerElement.point).moveBy(dieElement.value).point;
	checkerElement.touchedAccordingToId = dieElement.id;
});

document.getElementById(`undo`).addEventListener(`click`, () => {
	const lastPlayedDieElement = new DieElement(Array.from(document.querySelectorAll(`#dice [data-played="true"]`)).pop());
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
					updateMovabilityOfCheckers(firstDieElement);
				}
			},
			50,
		);
	}

	repeatedlyRollDice(5);
});

/**
 * @param {DieElement} dieElement
 */
function updateMovabilityOfCheckers(dieElement) {
	Array.from(document.getElementById(`checkers`).children)
		.map(value => new CheckerElement(value))
		.forEach(checkerElement => {
			const potentialDestinationPoint = new Checker(checkerElement.player, checkerElement.point).moveBy(dieElement.value).point;
			const potentialDestinationCheckers = document.querySelectorAll(`use[href="#checker"][data-point="${potentialDestinationPoint}"]`)
			checkerElement.movable = potentialDestinationPoint >= 1 && (potentialDestinationCheckers.length <= 1 || new CheckerElement(potentialDestinationCheckers[0]).player === checkerElement.player);
		});
}

(function makeDraggable() {
	let selectedElement, offset, minX, maxX, minY, maxY;

	const boundaryX1 = 0;
	const boundaryX2 = checkersElement.getBBox().width;
	const boundaryY1 = 0;
	const boundaryY2 = checkersElement.getBBox().height;

	const getMousePosition = evt => {
		const CTM = svgElement.getScreenCTM();
		if (evt.touches) {
			evt = evt.touches[0];
		}
		return {
			x: (evt.clientX - CTM.e) / CTM.a,
			y: (evt.clientY - CTM.f) / CTM.d,
		};
	};

	const startDrag = evt => {
		const checkerElement = new CheckerElement(evt.target);
		if (!checkerElement.movable) return;
		selectedElement = evt.target;
		offset = getMousePosition(evt);

		// Replace string parsing with CSS Typed Object Model API when it's available on Firefox.
		//  https://developer.mozilla.org/en-US/docs/Web/API/CSS_Typed_OM_API#browser_compatibility
		const translateCoordinates = window.getComputedStyle(selectedElement).translate
			.split(` `)
			.map(coordinateString => Number(coordinateString.substring(0, coordinateString.indexOf(`px`))));

		// Get initial translation
		offset.x -= translateCoordinates[0];
		offset.y -= translateCoordinates[1] ?? 0;

		// BEGIN Confine
		const bbox = selectedElement.getBBox();
		minX = boundaryX1 - bbox.x;
		maxX = boundaryX2 - bbox.x - bbox.width;
		minY = boundaryY1 - bbox.y;
		maxY = boundaryY2 - bbox.y - bbox.height;
		// END Confine
	};

	const drag = evt => {
		if (selectedElement !== undefined && selectedElement !== null) {
			selectedElement.classList.add(`dragging`);
			evt.preventDefault();

			const coord = getMousePosition(evt);
			const dx = Math.clamp(coord.x - offset.x, minX, maxX);
			const dy = Math.clamp(coord.y - offset.y, minY, maxY);

			selectedElement.style.translate = `${dx}px ${dy}px`
		}
	};

	const endDrag = () => {
		if (selectedElement !== undefined && selectedElement !== null) {
			selectedElement.classList.remove(`dragging`);
			selectedElement = null;
		}
	};

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
