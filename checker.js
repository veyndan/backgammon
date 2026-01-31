"use strict";

export default class CheckerElement extends HTMLElement {
	constructor() {
		super();
		const template = /** @type {HTMLTemplateElement} */ (document.querySelector(`template#checker`));
		this
			.attachShadow({mode: "open"})
			.appendChild(template.content.cloneNode(true));
	}
}

customElements.define("veyndan-checker", CheckerElement);
