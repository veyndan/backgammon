const points = [
	{player: 2, checkerCount: 2},
	{player: null, checkerCount: 0},
	{player: null, checkerCount: 0},
	{player: null, checkerCount: 0},
	{player: null, checkerCount: 0},
	{player: 1, checkerCount: 5},
	{player: null, checkerCount: 0},
	{player: 1, checkerCount: 3},
	{player: null, checkerCount: 0},
	{player: null, checkerCount: 0},
	{player: null, checkerCount: 0},
	{player: 2, checkerCount: 5},
	{player: 1, checkerCount: 5},
	{player: null, checkerCount: 0},
	{player: null, checkerCount: 0},
	{player: null, checkerCount: 0},
	{player: 2, checkerCount: 3},
	{player: null, checkerCount: 0},
	{player: 2, checkerCount: 5},
	{player: null, checkerCount: 0},
	{player: null, checkerCount: 0},
	{player: null, checkerCount: 0},
	{player: null, checkerCount: 0},
	{player: 1, checkerCount: 2},
];

points.forEach((point, pointIndex) => {
	if (point.player !== null) {
		for (let checkerIndex = 0; checkerIndex < point.checkerCount; checkerIndex++) {
			const checkerElement = document.createElementNS(`http://www.w3.org/2000/svg`, `use`);
			checkerElement.classList.add(`player${point.player}`);
			checkerElement.setAttribute(`href`, `#checker`);
			checkerElement.setAttribute(
				`transform`,
				`translate(${(pointIndex < 12 ? -1 : 1) * ((pointIndex % 12 * 40) + (pointIndex % 12 >= 6 ? 50 : 0)) + (pointIndex < 12 ? 490 : 0)} ${pointIndex < 12 ? (380 - checkerIndex * 40) : (checkerIndex * 40)})`
			);
			document.getElementById(`checkers`).append(checkerElement);
		}
	}
});
