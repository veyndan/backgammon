const checkersElement = document.getElementById('checkers');

const checkersObserver = new MutationObserver(mutations => {
	mutations.forEach(mutation => {
		const checkerElement = mutation.target;
		const originPoint = Number(checkerElement.dataset[`point`])
		const destinationPointCheckerCount = document.querySelectorAll(`use[href="#checker"][data-point="${originPoint}"]`).length - 1;
		checkerElement.style.translate = `${(originPoint <= 12 ? -1 : 1) * (((originPoint - 1) % 12 * 40) + ((originPoint - 1) % 12 >= 6 ? 50 : 0)) + (originPoint <= 12 ? 490 : 0)}px ${originPoint <= 12 ? (380 - destinationPointCheckerCount * 40) : (destinationPointCheckerCount * 40)}px`;
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
	const checkerElement = event.target;
	if (checkerElement.dataset[`movable`] === String(false)) return;
	const dieElement = document.querySelector(`#dice :not([data-played="true"])`);
	dieElement.dataset[`played`] = String(true);
	const dieValue = Number(dieElement.dataset[`value`]);
	const player = checkerElement.dataset[`player`];
	const originPoint = Number(checkerElement.dataset[`point`]);
	const destinationPoint = originPoint + (player === `1` ? -dieValue : dieValue);
	checkerElement.dataset[`point`] = `${destinationPoint}`;
	checkerElement.dataset[`touchedAccordingToDie${dieElement.dataset[`id`]}`] = String(true);
});

document.getElementById(`undo`).addEventListener(`click`, () => {
	const lastPlayedDieElement = Array.from(document.querySelectorAll(`#dice [data-played="true"]`)).pop();
	const lastPlayedDieId = lastPlayedDieElement.dataset[`id`];
	const lastPlayedDieValue = Number(lastPlayedDieElement.dataset[`value`]);
	const lastMovedCheckerElement = document.querySelector(`#checkers > [data-touched-according-to-die${lastPlayedDieId}="true"]`);
	const player = lastMovedCheckerElement.dataset[`player`];
	const originPoint = Number(lastMovedCheckerElement.dataset[`point`]);
	const destinationPoint = originPoint + (player === `1` ? lastPlayedDieValue : -lastPlayedDieValue);
	lastMovedCheckerElement.dataset[`point`] = `${destinationPoint}`;
	delete lastMovedCheckerElement.dataset[`touchedAccordingToDie${lastPlayedDieId}`];
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
	Array.from(document.getElementById(`checkers`).children).forEach(checkerElement => {
		const player = checkerElement.dataset[`player`];
		const point = Number(checkerElement.dataset[`point`]);
		const potentialDestinationPoint = point + (player === `1` ? -dieValue : dieValue);
		const potentialDestinationCheckers = document.querySelectorAll(`use[href="#checker"][data-point="${potentialDestinationPoint}"]`)
		const movable = potentialDestinationPoint >= 1 && (potentialDestinationCheckers.length <= 1 || potentialDestinationCheckers[0].dataset[`player`] === player);
		checkerElement.dataset[`movable`] = String(movable);
	});
}
