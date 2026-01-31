"use strict";

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
