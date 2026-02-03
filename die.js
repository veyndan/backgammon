"use strict";

export default class DieElement extends HTMLElement {
	constructor() {
		super();
		const template = /** @type {HTMLTemplateElement} */ (document.querySelector(`template#die`));
		this
			.attachShadow({mode: "open"})
			.appendChild(template.content.cloneNode(true));
	}

	/**
	 * @param {boolean} value
	 */
	set played(value) {
		if (value) {
			this.dataset[`played`] = ``;
		} else {
			delete this.dataset[`played`];
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
