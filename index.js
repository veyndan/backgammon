class Point {

	/**
	 * @param {?number} player
	 * @param {number} checkerCount
	 */
	constructor(player, checkerCount) {
		this.player = player;
		this.checkerCount = checkerCount;
	}
}

const points = [
	new Point(2, 2),
	new Point(null, 0),
	new Point(null, 0),
	new Point(null, 0),
	new Point(null, 0),
	new Point(1, 5),
	new Point(null, 0),
	new Point(1, 3),
	new Point(null, 0),
	new Point(null, 0),
	new Point(null, 0),
	new Point(2, 5),
	new Point(1, 5),
	new Point(null, 0),
	new Point(null, 0),
	new Point(null, 0),
	new Point(2, 3),
	new Point(null, 0),
	new Point(2, 5),
	new Point(null, 0),
	new Point(null, 0),
	new Point(null, 0),
	new Point(null, 0),
	new Point(1, 2),
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
