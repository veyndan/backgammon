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
}

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
	checkerElement.point = checkerElement.point + (checkerElement.player === `1` ? -dieElement.value : dieElement.value);
	checkerElement.touchedAccordingToId = dieElement.id;
});

document.getElementById(`undo`).addEventListener(`click`, () => {
	const lastPlayedDieElement = new DieElement(Array.from(document.querySelectorAll(`#dice [data-played="true"]`)).pop());
	const lastMovedCheckerElement = new CheckerElement(document.querySelector(`#checkers > [data-touched-according-to-die${(lastPlayedDieElement.id)}="true"]`));
	lastMovedCheckerElement.point = lastMovedCheckerElement.point + (lastMovedCheckerElement.player === `1` ? lastPlayedDieElement.value : -lastPlayedDieElement.value);
	lastMovedCheckerElement.deleteTouchedAccordingToId(lastPlayedDieElement.id);
	lastPlayedDieElement.played = false;
});

document.getElementById(`roll-dice`).addEventListener(`click`, event => {
	event.currentTarget.style.display = `none`;

	/**
	 * @param {number} limit
	 */
	function repeatedlyRollDice(limit) {
		/**
		 * @return {number}
		 */
		function getRandomDiceRoll() {
			return Math.floor(Math.random() * 6 + 1);
		}

		/**
		 * @param {number} id
		 * @param {number} dieValue
		 * @return {DieElement}
		 */
		function rolledDie(id, dieValue) {
			const useElement = document.createElementNS(`http://www.w3.org/2000/svg`, `use`);
			useElement.setAttribute(`href`, `#die-face-pip-${dieValue}`);
			useElement.dataset[`id`] = `${id}`;
			useElement.dataset[`value`] = `${dieValue}`;
			useElement.classList.add(`die`);
			return new DieElement(useElement)
		}

		const diceElement = document.querySelector(`#dice`);
		diceElement.replaceChildren(rolledDie(0, getRandomDiceRoll()).target, rolledDie(1, getRandomDiceRoll()).target);
		let count = 1;
		const intervalID = setInterval(
			() => {
				const firstDieElement = rolledDie(0, getRandomDiceRoll());
				const secondDieElement = rolledDie(0, getRandomDiceRoll());
				diceElement.replaceChildren(firstDieElement.target, secondDieElement.target);

				if (++count === limit) {
					window.clearInterval(intervalID);
					if (firstDieElement.value === secondDieElement.value) {
						setTimeout(
							() => diceElement.append(rolledDie(2, firstDieElement.value).target, rolledDie(3, firstDieElement.value).target),
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
			const potentialDestinationPoint = checkerElement.point + (checkerElement.player === `1` ? -dieElement.value : dieElement.value);
			const potentialDestinationCheckers = document.querySelectorAll(`use[href="#checker"][data-point="${potentialDestinationPoint}"]`)
			checkerElement.movable = potentialDestinationPoint >= 1 && (potentialDestinationCheckers.length <= 1 || new CheckerElement(potentialDestinationCheckers[0]).player === checkerElement.player);
		});
}
