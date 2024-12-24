export default class DieElement extends HTMLElement {
	constructor() {
		super();
		const template = /** @type {HTMLTemplateElement} */ (document.querySelector(`template#die`));
		this
			.attachShadow({mode: "open"})
			.appendChild(template.content.cloneNode(true));
	}

	/**
	 * @return {(number|undefined)}
	 */
	get playedAt() {
		const playedAtDataAttribute = this.dataset[`playedAt`];
		if (playedAtDataAttribute !== undefined) {
			return Number(playedAtDataAttribute);
		} else {
			return undefined;
		}
	}

	/**
	 * @param {(number|undefined)} value
	 */
	set playedAt(value) {
		if (value !== undefined) {
			this.dataset[`playedAt`] = String(value);
		} else {
			delete this.dataset[`playedAt`];
		}
	}

	/**
	 * @return {number}
	 */
	get value() {
		return Number(this.dataset[`value`]);
	}

	/**
	 * @param {number} value
	 */
	set value(value) {
		this.dataset[`value`] = String(value);
	}
}

customElements.define("veyndan-die", DieElement);
