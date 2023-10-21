document.getElementById(`checkers`).childNodes.forEach(checkerElement => {
	checkerElement.addEventListener(`click`, () => {
		const dieElement = document.querySelector(`#dice-holder :first-child`);
		dieElement.classList.add(`played`);
		const dieValue = Number(dieElement.dataset[`value`]);
		const player = Number(checkerElement.dataset[`player`]);
		const originPointIndex = Number(checkerElement.dataset[`point`]) - 1;
		const destinationPointIndex = originPointIndex + (player === 1 ? -dieValue : dieValue);
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
			 * @return {SVGUseElement}
			 */
			function rolledDie() {
				/**
				 * @return {number}
				 */
				function getRandomDiceRoll() {
					return Math.floor(Math.random() * 5 + 1);
				}

				const dieElement = document.createElementNS(`http://www.w3.org/2000/svg`, `use`);
				const dieValue = getRandomDiceRoll();
				dieElement.setAttribute(`href`, `#die-face-pip-${dieValue}`);
				dieElement.dataset[`value`] = `${dieValue}`;
				dieElement.classList.add(`die`);
				return dieElement
			}

			document.querySelector(`#dice-holder`).replaceChildren(rolledDie(), rolledDie());
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
