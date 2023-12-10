const MIN_VALUE = 1;
const MAX_VALUE = 24;

export default class Point {
	/**
	 * @param {number} value
	 */
	constructor(value) {
		this.value = value;
	}

	static get MIN() {
		return new Point(MIN_VALUE);
	}

	static get MAX() {
		return new Point(MAX_VALUE);
	}
}
