const MIN_VALUE = 1;
const MAX_VALUE = 24;

export default class Point {
	/**
	 * @param {number} value
	 */
	constructor(value) {
		if (value < MIN_VALUE || value > MAX_VALUE) {
			throw new RangeError(`The point must be between ${MIN_VALUE} and ${MAX_VALUE}.`);
		}
		this.value = value;
	}

	static get MIN() {
		return new Point(MIN_VALUE);
	}

	static get MAX() {
		return new Point(MAX_VALUE);
	}
}
