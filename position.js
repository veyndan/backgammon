export class Position {}

export class Bar extends Position {}

const MIN_POINT_VALUE = 1;
const MAX_POINT_VALUE = 24;

export class Point extends Position {
	/**
	 * @param {number} value
	 */
	constructor(value) {
		super();
		if (value < MIN_POINT_VALUE || value > MAX_POINT_VALUE) {
			throw new RangeError(`The point must be between ${MIN_POINT_VALUE} and ${MAX_POINT_VALUE}.`);
		}
		this.value = value;
	}

	static get MIN() {
		return new Point(MIN_POINT_VALUE);
	}

	static get MAX() {
		return new Point(MAX_POINT_VALUE);
	}
}
