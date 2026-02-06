"use strict";

// @ts-ignore
import stylesheet from "./die.css" with {type: "css"};
import {Die} from "./model/dice.js";

export default class DieElement extends HTMLElement {
	constructor() {
		super();
		const template = /** @type {HTMLTemplateElement} */ (document.querySelector(`template#die`));
		this
			.attachShadow({mode: "open"})
			.appendChild(template.content.cloneNode(true));
		this.shadowRoot.adoptedStyleSheets = [stylesheet];
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
	 * @return {Die}
	 */
	get value() {
		return new Die(Number(this.dataset[`value`]));
	}

	/**
	 * @param {Die} value
	 */
	set value(value) {
		this.dataset[`value`] = String(value.value);
	}
}

customElements.define("veyndan-die", DieElement);
