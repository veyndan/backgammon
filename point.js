customElements.define(
	"veyndan-point",
	class extends HTMLElement {
		constructor() {
			super();
			const template = /** @type {HTMLTemplateElement} */ (document.querySelector(`template#point`));
			this
				.attachShadow({mode: "open"})
				.appendChild(template.content.cloneNode(true));
		}
	},
);
