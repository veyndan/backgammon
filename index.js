const checkersElement = document.getElementById('checkers');

const checkersObserver = new MutationObserver(mutations => {
	mutations.forEach(mutation => {
		const checkerElement = mutation.target;
		const originPointIndex = Number(checkerElement.dataset[`point`]) - 1;
		const destinationPointCheckerCount = document.querySelectorAll(`use[href="#checker"][data-point="${originPointIndex + 1}"]`).length - 1;
		checkerElement.style.translate = `${(originPointIndex < 12 ? -1 : 1) * ((originPointIndex % 12 * 40) + (originPointIndex % 12 >= 6 ? 50 : 0)) + (originPointIndex < 12 ? 490 : 0)}px ${originPointIndex < 12 ? (380 - destinationPointCheckerCount * 40) : (destinationPointCheckerCount * 40)}px`;
		const dieElement = document.querySelector(`#dice :not(.played)`);
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
	const checkerElement = event.target;
	if (!checkerElement.classList.contains(`movable`)) return;
	const dieElement = document.querySelector(`#dice :not(.played)`);
	dieElement.classList.add(`played`);
	const dieValue = Number(dieElement.dataset[`value`]);
	const player = checkerElement.dataset[`player`];
	const originPointIndex = Number(checkerElement.dataset[`point`]) - 1;
	const destinationPointIndex = originPointIndex + (player === `1` ? -dieValue : dieValue);
	checkerElement.dataset[`point`] = `${destinationPointIndex + 1}`;
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
		 * @param {number} dieValue
		 * @return {SVGUseElement}
		 */
		function rolledDie(dieValue) {
			const dieElement = document.createElementNS(`http://www.w3.org/2000/svg`, `use`);
			dieElement.setAttribute(`href`, `#die-face-pip-${dieValue}`);
			dieElement.dataset[`value`] = `${dieValue}`;
			dieElement.classList.add(`die`);
			return dieElement
		}

		const diceElement = document.querySelector(`#dice`);
		diceElement.replaceChildren(rolledDie(getRandomDiceRoll()), rolledDie(getRandomDiceRoll()));
		let count = 1;
		const intervalID = setInterval(
			() => {
				const firstDieValue = getRandomDiceRoll();
				const secondDieValue = getRandomDiceRoll();
				diceElement.replaceChildren(rolledDie(firstDieValue), rolledDie(secondDieValue));

				if (++count === limit) {
					window.clearInterval(intervalID);
					if (firstDieValue === secondDieValue) {
						setTimeout(
							() => diceElement.append(rolledDie(firstDieValue), rolledDie(firstDieValue)),
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
	Array.from(document.getElementById(`checkers`).children).forEach(checkerElement => {
		const player = checkerElement.dataset[`player`];
		const point = Number(checkerElement.dataset[`point`]);
		const potentialDestinationPoint = point + (player === `1` ? -dieValue : dieValue);
		const potentialDestinationCheckers = document.querySelectorAll(`use[href="#checker"][data-point="${potentialDestinationPoint}"]`)
		const moveable = potentialDestinationPoint >= 1 && (potentialDestinationCheckers.length <= 1 || potentialDestinationCheckers[0].dataset[`player`] === player);
		checkerElement.classList.toggle(`movable`, moveable);
	});
}
