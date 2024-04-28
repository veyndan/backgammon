export class Board {
	/**
	 * @param {number[][]} mailbox An array based representation of the board with
	 * 	exactly 26 entries. The first entry represents the bar for player 2. The
	 * 	last entry represents the bar for player 1. The remaining middle 24
	 * 	entries represent the points on the board, where the index of the point
	 * 	represents the point's number. Positive numbers within the array
	 * 	indicates a position where checkers of player 1 reside. Negative numbers
	 * 	within the array indicates a position where checker of player 2 reside.
	 * 	Zero's within the array indicates a position where no checkers of either
	 * 	player reside. The absolute value of a position indicates the number of
	 * 	checkers that reside on that position.
	 *
	 */
	constructor(mailbox) {
		this.mailbox = mailbox;
	}

	/**
	 * @return {Board}
	 */
	static startingPosition() {
		return new Board([[0, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0], [0, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0]]);
	}

	/**
	 * @typedef move
	 * @type {object}
	 * @property {number[]} anMove
	 * @property {Board} anBoard
	 */

	/**
	 * @typedef movelist
	 * @type {object}
	 * @property {number} cMoves
	 * @property {number} cMaxMoves
	 * @property {number} cMaxPips
	 * @property {move[]} amMoves
	 */

	/**
	 * @param {number} iSrc
	 * @param {number} nRoll
	 */
	#ApplySubMove(iSrc, nRoll) {
		this.mailbox[1][iSrc]--;

		/** @type {number} */
		const iDest = iSrc - nRoll;

		if (this.mailbox[0][23 - iDest]) {
			this.mailbox[1][iDest] = 1;
			this.mailbox[0][23 - iDest] = 0;
			this.mailbox[0][24]++;
		} else {
			this.mailbox[1][iDest]++;
		}
	}

	/**
	 * @param {movelist} pml
	 * @param {number} cMoves
	 * @param {number} cPip
	 * @param {number[]} anMoves
	 */
	#SaveMoves(pml, cMoves, cPip, anMoves) {
		/* Save only legal moves: if the current move moves plays less
		 * chequers or pips than those already found, it is illegal; if
		 * it plays more, the old moves are illegal. */
		if (cMoves < pml.cMaxMoves || cPip < pml.cMaxPips) {
			return;
		}

		if (cMoves > pml.cMaxMoves || cPip > pml.cMaxPips) {
			pml.cMoves = 0;
		}

		pml.cMaxMoves = cMoves;
		pml.cMaxPips = cPip;

		for (let i = 0; i < pml.cMoves; i++) {
			const pm = pml.amMoves[i];

			let ok = true
			for (let j = 0; j < 2; j++) {
				for (let k = 0; k < 25; k++) {
					if (this.mailbox[j][k] !== pm.anBoard.mailbox[j][k]) {
						ok = false;
					}
				}
			}
			if (ok) {
				return;
			}
		}

		/** @type {move} */
		const pm = {
			anMove: [...anMoves],
			anBoard: new Board([[...this.mailbox[0]], [...this.mailbox[1]]]),
		}

		pml.amMoves[pml.cMoves] = pm;
		pml.cMoves++;
	}

	/**
	 * @param {number} iSrc
	 * @param {number} nPips
	 * @return {boolean}
	 */
	#LegalMove(iSrc, nPips) {
		/** @type {number} */
		const iDest = iSrc - nPips;

		if (iDest >= 0) { /* Here we can do the Chris rule check */
			return this.mailbox[0][23 - iDest] < 2;
		}
		/* otherwise, attempting to bear off */
	
		/** @type {number} */
		let nBack;
		for (nBack = 24; nBack > 0; nBack--) {
			if (this.mailbox[1][nBack] > 0) {
				break;
			}
		}
	
		return nBack <= 5 && (iSrc === nBack || iDest === -1);
	}

	/**
	 * @param {movelist} pml
	 * @param {number[]} anRoll
	 * @param {number} nMoveDepth
	 * @param {number} iPip
	 * @param {number} cPip
	 * @param {number[]} anMoves
	 * @return {boolean}
	 */
	#legalTurnsSub(pml, anRoll, nMoveDepth, iPip, cPip, anMoves) {
		if (nMoveDepth === 4 || anRoll[nMoveDepth] === 0) {
			return true;
		}

		let fUsed = false;

		if (this.mailbox[1][24] > 0) {
			if (this.#LegalMove(24, anRoll[nMoveDepth])) {
				anMoves[nMoveDepth * 2] = 24;
				anMoves[nMoveDepth * 2 + 1] = 24 - anRoll[nMoveDepth];

				let anBoardNew = new Board([[...this.mailbox[0]], [...this.mailbox[1]]]);

				anBoardNew.#ApplySubMove(24, anRoll[nMoveDepth]);

				if (anBoardNew.#legalTurnsSub(pml, anRoll, nMoveDepth + 1, 23, cPip + anRoll[nMoveDepth], anMoves)) {
					anBoardNew.#SaveMoves(pml, nMoveDepth + 1, cPip + anRoll[nMoveDepth], anMoves);
				}

				fUsed = true;
			}
		} else {
			for (let i = iPip; i >= 0; i--) {
				if (this.mailbox[1][i] > 0 && this.#LegalMove(i, anRoll[nMoveDepth])) {
					anMoves[nMoveDepth * 2] = i;
					anMoves[nMoveDepth * 2 + 1] = i - anRoll[nMoveDepth];

					let anBoardNew = new Board([[...this.mailbox[0]], [...this.mailbox[1]]]);

					anBoardNew.#ApplySubMove(i, anRoll[nMoveDepth]);

					if (anBoardNew.#legalTurnsSub(pml, anRoll, nMoveDepth + 1, anRoll[0] === anRoll[1] ? i : 23, cPip + anRoll[nMoveDepth], anMoves)) {
						anBoardNew.#SaveMoves(pml, nMoveDepth + 1, cPip + anRoll[nMoveDepth], anMoves);
					}

					fUsed = true;
				}
			}
		}

		return !fUsed;
	}

	/**
	 * @param {number} n0
	 * @param {number} n1
	 * @return {movelist}
	 */
	legalTurns(n0, n1) {
		/** @type {number[]} */
		const anRoll = [n0, n1, (n0 === n1) ? n0 : 0, (n0 === n1) ? n0 : 0];
		/** @type {number[]} */
		const anMoves = Array(8).fill(0);

		const pml = {
			cMoves: 0,
			cMaxMoves: 0,
			cMaxPips: 0,
			amMoves: [],
		};
		this.#legalTurnsSub(pml, anRoll, 0, 23, 0, anMoves);

		if (anRoll[0] !== anRoll[1]) {
			const n = anRoll[0];
			anRoll[0] = anRoll[1];
			anRoll[1] = n;

			this.#legalTurnsSub(pml, anRoll, 0, 23, 0, anMoves);
		}
		return pml;
	}

	#swapSides() {
		this.mailbox = [[...this.mailbox[1]], [...this.mailbox[0]]];
	}

	/**
	 * @param {number[]} anMove
	 */ 
	playMove(anMove) {
		for (let i = 0; i < anMove.length; i += 2) {
			/** @type {number} */
			let nSrc = anMove[i];
			/** @type {number} */
			let nDest = anMove[i + 1];

			if (this.mailbox[1][nSrc] === 0) {
				/* source point is empty; ignore */
				continue;
			}

			this.mailbox[1][nSrc]--;
			if (nDest >= 0) {
				this.mailbox[1][nDest]++;

				this.mailbox[0][24] += this.mailbox[0][23 - nDest];
				this.mailbox[0][23 - nDest] = 0;
			}
		}

		this.#swapSides();
	}
}
