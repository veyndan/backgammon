"use strict";

// @ts-ignore
import stylesheet from "./player.css" with {type: "css"};

customElements.define(
	"veyndan-player",
	class extends HTMLElement {
		constructor() {
			super();
			const template = /** @type {HTMLTemplateElement} */ (document.querySelector(`template#player`));
			this
				.attachShadow({mode: "open"})
				.appendChild(template.content.cloneNode(true));
			this.shadowRoot.adoptedStyleSheets = [stylesheet];
		}
	},
);
