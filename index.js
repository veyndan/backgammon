document.getElementById(`checkers`).childNodes.forEach(checkerElement => {
	checkerElement.addEventListener(`click`, () => {
		const dieNumber = 4;
		const player = Number(checkerElement.dataset[`player`]);
		const originPointIndex = Number(checkerElement.dataset[`point`]) - 1;
		const destinationPointIndex = originPointIndex + (player === 1 ? -dieNumber : dieNumber);
		const destinationPointCheckerCount = document.querySelectorAll(`use[href="#checker"][data-point="${destinationPointIndex + 1}"]`).length;
		checkerElement.style.translate = `${(destinationPointIndex < 12 ? -1 : 1) * ((destinationPointIndex % 12 * 40) + (destinationPointIndex % 12 >= 6 ? 50 : 0)) + (destinationPointIndex < 12 ? 490 : 0)}px ${destinationPointIndex < 12 ? (380 - destinationPointCheckerCount * 40) : (destinationPointCheckerCount * 40)}px`;
		checkerElement.dataset[`point`] = `${destinationPointIndex + 1}`;
	});
});

document.getElementById(`roll-dice`).addEventListener(`click`, event => {
	event.currentTarget.style.display = `none`;

	/**
	 * @param {number} limit
	 */
	function repeatedlyRollDice(limit) {
		function rollDice() {
			/**
			 * @return {number}
			 */
			function getRandomDiceRoll() {
				return Math.floor(Math.random() * 5 + 1);
			}

			const firstDieElement = document.createElementNS(`http://www.w3.org/2000/svg`, `use`);
			firstDieElement.setAttribute(`href`, `#die-face-pip-${getRandomDiceRoll()}`);
			const secondDieElement = document.createElementNS(`http://www.w3.org/2000/svg`, `use`);
			secondDieElement.setAttribute(`href`, `#die-face-pip-${getRandomDiceRoll()}`);
			document.querySelector(`#dice-holder`).replaceChildren(firstDieElement, secondDieElement);
		}

		rollDice();
		let count = 1;
		const intervalID = setInterval(
			() => {
				rollDice()

				if (++count === limit) {
					window.clearInterval(intervalID);
				}
			},
			50,
		);
	}

	repeatedlyRollDice(5);
});
