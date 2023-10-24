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

const checkersElement = document.getElementById('checkers');

const checkersObserver = new MutationObserver(mutations => {
	mutations.forEach(mutation => {
		const checkerElement = new CheckerElement(mutation.target);
		const destinationPointCheckerCount = document.querySelectorAll(`use[href="#checker"][data-point="${(checkerElement.point)}"]`).length - 1;
		checkerElement.target.style.translate = `${(checkerElement.point <= 12 ? -1 : 1) * (((checkerElement.point - 1) % 12 * 40) + ((checkerElement.point - 1) % 12 >= 6 ? 50 : 0)) + (checkerElement.point <= 12 ? 490 : 0)}px ${checkerElement.point <= 12 ? (380 - destinationPointCheckerCount * 40) : (destinationPointCheckerCount * 40)}px`;
		const dieElement = document.querySelector(`#dice :not([data-played="true"])`);
		const dieValue = Number(dieElement.dataset[`value`]);
		updateMovabilityOfCheckers(dieValue);
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
	const dieElement = document.querySelector(`#dice :not([data-played="true"])`);
	dieElement.dataset[`played`] = String(true);
	const dieValue = Number(dieElement.dataset[`value`]);
	checkerElement.point = checkerElement.point + (checkerElement.player === `1` ? -dieValue : dieValue);
	checkerElement.touchedAccordingToId = dieElement.dataset[`id`];
});

document.getElementById(`undo`).addEventListener(`click`, () => {
	const lastPlayedDieElement = Array.from(document.querySelectorAll(`#dice [data-played="true"]`)).pop();
	const lastPlayedDieId = lastPlayedDieElement.dataset[`id`];
	const lastPlayedDieValue = Number(lastPlayedDieElement.dataset[`value`]);
	const lastMovedCheckerElement = new CheckerElement(document.querySelector(`#checkers > [data-touched-according-to-die${lastPlayedDieId}="true"]`));
	lastMovedCheckerElement.point = lastMovedCheckerElement.point + (lastMovedCheckerElement.player === `1` ? lastPlayedDieValue : -lastPlayedDieValue);
	lastMovedCheckerElement.deleteTouchedAccordingToId(lastPlayedDieId);
	lastPlayedDieElement.dataset[`played`] = String(false);
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
		 * @return {SVGUseElement}
		 */
		function rolledDie(id, dieValue) {
			const dieElement = document.createElementNS(`http://www.w3.org/2000/svg`, `use`);
			dieElement.setAttribute(`href`, `#die-face-pip-${dieValue}`);
			dieElement.dataset[`id`] = `${id}`;
			dieElement.dataset[`value`] = `${dieValue}`;
			dieElement.classList.add(`die`);
			return dieElement
		}

		const diceElement = document.querySelector(`#dice`);
		diceElement.replaceChildren(rolledDie(0, getRandomDiceRoll()), rolledDie(1, getRandomDiceRoll()));
		let count = 1;
		const intervalID = setInterval(
			() => {
				const firstDieValue = getRandomDiceRoll();
				const secondDieValue = getRandomDiceRoll();
				diceElement.replaceChildren(rolledDie(0, firstDieValue), rolledDie(1, secondDieValue));

				if (++count === limit) {
					window.clearInterval(intervalID);
					if (firstDieValue === secondDieValue) {
						setTimeout(
							() => diceElement.append(rolledDie(2, firstDieValue), rolledDie(3, firstDieValue)),
							200,
						);
					}
					updateMovabilityOfCheckers(firstDieValue);
				}
			},
			50,
		);
	}

	repeatedlyRollDice(5);
});

function updateMovabilityOfCheckers(dieValue) {
	Array.from(document.getElementById(`checkers`).children)
		.map(value => new CheckerElement(value))
		.forEach(checkerElement => {
			const potentialDestinationPoint = checkerElement.point + (checkerElement.player === `1` ? -dieValue : dieValue);
			const potentialDestinationCheckers = document.querySelectorAll(`use[href="#checker"][data-point="${potentialDestinationPoint}"]`)
			checkerElement.movable = potentialDestinationPoint >= 1 && (potentialDestinationCheckers.length <= 1 || new CheckerElement(potentialDestinationCheckers[0]).player === checkerElement.player);
		});
}
