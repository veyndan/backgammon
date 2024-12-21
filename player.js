const ONE_VALUE = `1`;
const TWO_VALUE = `2`;

export default class Player {
	constructor(value) {
		if (![ONE_VALUE, TWO_VALUE].includes(value)) {
			throw new RangeError(`The argument must be "${ONE_VALUE}" or "${TWO_VALUE}".`);
		}
		this.value = value;
	}

	static get One() {
		return new Player(ONE_VALUE);
	}

	static get Two() {
		return new Player(TWO_VALUE);
	}

	toString() {
		return `Player(${this.value})`;
	}
}

customElements.define(
	"veyndan-player",
	class extends HTMLElement {
		constructor() {
			super();
			const template = /** @type {HTMLTemplateElement} */ (document.querySelector(`template#player`));
			this
				.attachShadow({mode: "open"})
				.appendChild(template.content.cloneNode(true));
		}
	},
);
