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
