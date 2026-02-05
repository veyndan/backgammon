"use strict";

// @ts-ignore
import stylesheet from "./dice-roll.css" with {type: "css"};
// noinspection ES6UnusedImports
import DieElement from "./die.js";
// noinspection ES6UnusedImports
import Dice, {Die} from "./model/dice.js";

export default class DiceRollElement extends HTMLElement {
	/** @type {HTMLOListElement} */
	#diceElement

	constructor() {
		super();
		const template = /** @type {HTMLTemplateElement} */ (document.querySelector(`template#dice-roll`));
		this
			.attachShadow({mode: "open"})
			.appendChild(template.content.cloneNode(true));
		this.shadowRoot.adoptedStyleSheets = [stylesheet];
		this.shadowRoot.addEventListener(`click`, this);
		this.#diceElement = this.shadowRoot.querySelector(`#dice`);
	}

	/**
	 * @param {Die} die
	 */
	set played(die) {
		const dieElement = /** @type {DieElement} */ (this.shadowRoot.querySelector(`veyndan-die[data-value="${die.value}"]:not([data-played])`));
		dieElement.played = true;
	}

	/**
	 * @param {Die} die
	 */
	set unplayed(die) {
		const dieElement = Array.from(/** @type {NodeListOf<DieElement>} */ (this.shadowRoot.querySelectorAll(`#dice veyndan-die[data-value="${die.value}"][data-played]`))).at(-1);
		dieElement.played = false;
	}

	/**
	 * @param {number} limit
	 * @return {Promise<Dice>}
	 */
	async roll(limit) {
		/**
		 * @return {number}
		 */
		function generateRandomValue() {
			return Math.floor(Math.random() * 6 + 1);
		}

		const dieElement0 = /** @type {DieElement} */ (document.createElement(`veyndan-die`));
		dieElement0.value = generateRandomValue();
		dieElement0.classList.add(`rolling`);
		const dieElement1 = /** @type {DieElement} */ (document.createElement(`veyndan-die`));
		dieElement1.value = generateRandomValue();
		dieElement1.classList.add(`rolling`);
		this.#diceElement.replaceChildren(dieElement0, dieElement1);
		let count = 1;
		return new Promise(resolve => {
			const intervalID = setInterval(
				() => {
					dieElement0.value = generateRandomValue();
					dieElement1.value = generateRandomValue();

					if (++count === limit) {
						clearInterval(intervalID);
						dieElement0.classList.remove(`rolling`);
						dieElement1.classList.remove(`rolling`);
						const dice = new Dice(new Die(dieElement0.value), new Die(dieElement1.value));
						if (dice.isDoubles) {
							this.#diceElement.append(dieElement0.cloneNode(true), dieElement1.cloneNode(true));
						}
						resolve(dice);
					}
				},
				50,
			);
		});
	}

	/**
	 * @param {Event} event
	 */
	handleEvent(event) {
		switch (event.type) {
			case `click`: {
				this.#diceElement.classList.toggle(`swapped`);
				this.dispatchEvent(new CustomEvent(`swap-dice`));
			}
		}
	}
}

customElements.define("veyndan-dice-roll", DiceRollElement);
