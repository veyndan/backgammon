/**
 * @readonly
 * @enum {number}
 */
var CMark = {
    CMARK_NONE: 1,
    CMARK_ROLLOUT: -1,
};

/* A trivial upper bound on the number of (complete or incomplete)
 * legal moves of a single roll: if all 15 chequers are spread out,
 * then there are 18 C 4 + 17 C 3 + 16 C 2 + 15 C 1 = 3875
 * combinations in which a roll of 11 could be played (up to 4 choices from
 * 15 chequers, and a chequer may be chosen more than once).  The true
 * bound will be lower than this (because there are only 26 points,
 * some plays of 15 chequers must "overlap" and map to the same
 * resulting position), but that would be more difficult to
 * compute. */
const MAX_INCOMPLETE_MOVES = 3875;

const NUM_OUTPUTS = 5;

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
	 * @param {Board} anBoard
	 * @return {positionkey}
	 */
	#PositionKey(anBoard) {
		/** @type {positionkey} */
		const pkey = {data: Array(7).fill(0)};
		for (let i = 0, j = 0; i < 3; i++, j += 8) {
			pkey.data[i] = anBoard.mailbox[1][j] + (anBoard.mailbox[1][j + 1] << 4)
				+ (anBoard.mailbox[1][j + 2] << 8) + (anBoard.mailbox[1][j + 3] << 12)
				+ (anBoard.mailbox[1][j + 4] << 16) + (anBoard.mailbox[1][j + 5] << 20)
				+ (anBoard.mailbox[1][j + 6] << 24) + (anBoard.mailbox[1][j + 7] << 28);
			pkey.data[i + 3] = anBoard.mailbox[0][j] + (anBoard.mailbox[0][j + 1] << 4)
				+ (anBoard.mailbox[0][j + 2] << 8) + (anBoard.mailbox[0][j + 3] << 12)
				+ (anBoard.mailbox[0][j + 4] << 16) + (anBoard.mailbox[0][j + 5] << 20)
				+ (anBoard.mailbox[0][j + 6] << 24) + (anBoard.mailbox[0][j + 7] << 28);
		}
		pkey.data[6] = anBoard.mailbox[0][24] + (anBoard.mailbox[1][24] << 4);
		return pkey;
	}

	/**
	 * @typedef positionkey
	 * @type {object}
	 * @property {number[]} data
	 */

	/**
	 * @typedef move
	 * @type {object}
	 * @property {number[]} anMove
	 * @property {positionkey} key
	 * @property {number} cMoves
	 * @property {number} cPips
	 * @property {number[]} arEvalMove
	 * @property {CMark} cmark
	 */

	/**
	 * @typedef movelist
	 * @type {object}
	 * @property {number} cMoves
	 * @property {number} cMaxMoves
	 * @property {number} cMaxPips
	 * @property {number} iMoveBest
	 * @property {move[]} amMoves
	 */

	/**
	 * @param {Board} anBoard
	 * @param {number} iSrc
	 * @param {number} nRoll
	 * @param {boolean} fCheckLegal
	 * @return {number}
	 */
	#ApplySubMove(anBoard, iSrc, nRoll, fCheckLegal) {
		/** @type {number} */
		const iDest = iSrc - nRoll;

		if (fCheckLegal && (nRoll < 1 || nRoll > 6)) {
			/* Invalid dice roll */
			return -1;
		}

		if (iSrc < 0 || iSrc > 24 || iDest >= iSrc || anBoard.mailbox[1][iSrc] < 1) {
			/* Invalid point number, or source point is empty */
			return -1;
		}

		anBoard.mailbox[1][iSrc]--;

		if (iDest < 0) {
			return 0;
		}

		if (anBoard.mailbox[0][23 - iDest]) {
			if (anBoard.mailbox[0][23 - iDest] > 1) {
				/* Trying to move to a point already made by the opponent */
				return -1;
			}
			anBoard.mailbox[1][iDest] = 1;
			anBoard.mailbox[0][23 - iDest] = 0;
			anBoard.mailbox[0][24]++;
		} else {
			anBoard.mailbox[1][iDest]++;
		}

		return 0;
	}

	/**
	 * @param {positionkey} k1
	 * @param {positionkey} k2
	 * @returns {boolean}
	 */
	#EqualKeys(k1, k2) {
		return ((k1).data[0]==(k2).data[0]&&(k1).data[1]==(k2).data[1]&&(k1).data[2]==(k2).data[2]&&(k1).data[3]==(k2).data[3]&&(k1).data[4]==(k2).data[4]&&(k1).data[5]==(k2).data[5]&&(k1).data[6]==(k2).data[6])
	}

	/**
	 * @param {positionkey} ks
	 * @param {positionkey} kd
	 */
	#CopyKey(ks, kd) {
		(kd).data[0]=(ks).data[0],(kd).data[1]=(ks).data[1],(kd).data[2]=(ks).data[2],(kd).data[3]=(ks).data[3],(kd).data[4]=(ks).data[4],(kd).data[5]=(ks).data[5],(kd).data[6]=(ks).data[6]
	}
	/**
	 * @param {movelist} pml
	 * @param {number} cMoves
	 * @param {number} cPip
	 * @param {number[]} anMoves
	 * @param {Board} anBoard
	 */
	#SaveMoves(pml, cMoves, cPip, anMoves, anBoard) {
		/* Save only legal moves: if the current move moves plays less
		 * chequers or pips than those already found, it is illegal; if
		 * it plays more, the old moves are illegal. */
		if (cMoves < pml.cMaxMoves || cPip < pml.cMaxPips) {
			return;
		}

		if (cMoves > pml.cMaxMoves || cPip > pml.cMaxPips)
			pml.cMoves = 0;

		pml.cMaxMoves = cMoves;
		pml.cMaxPips = cPip;

		const key = this.#PositionKey(anBoard);

		for (let i = 0; i < pml.cMoves; i++) {

			const pm = pml.amMoves[i];

			if (this.#EqualKeys(key, pm.key)) {
				if (cMoves > pm.cMoves || cPip > pm.cPips) {
					for (let j = 0; j < cMoves * 2; j++)
						pm.anMove[j] = anMoves[j] > -1 ? anMoves[j] : -1;

					if (cMoves < 4)
						pm.anMove[cMoves * 2] = -1;

					pm.cMoves = cMoves;
					pm.cPips = cPip;
				}

				return;
			}
		}

		/** @type {move} */
		const pm = {
			anMove: Array(8).fill(0),
			key: {data: Array(7).fill(0)},
			arEvalMove: Array(7).fill(0.0),
			cMoves: 0,
			cmark: 0,
			cPips: 0,
		}

		for (let i = 0; i < cMoves * 2; i++)
			pm.anMove[i] = anMoves[i] > -1 ? anMoves[i] : -1;

		if (cMoves < 4)
			pm.anMove[cMoves * 2] = -1;

		this.#CopyKey(key, pm.key);
		pm.cMoves = cMoves;
		pm.cPips = cPip;
		pm.cmark = CMark.CMARK_NONE;

		for (let i = 0; i < NUM_OUTPUTS; i++)
			pm.arEvalMove[i] = 0.0;

		if (pml.amMoves.length > pml.cMoves) {
			pml.amMoves[pml.cMoves] = pm;
		} else {
			pml.amMoves.push(pm);
		}
		pml.cMoves++;

		if (pml.cMoves >= MAX_INCOMPLETE_MOVES) throw Error();
	}

	/**
	 * @param {Board} anBoard
	 * @param {number} iSrc
	 * @param {number} nPips
	 * @returns {boolean}
	 */
	#LegalMove(anBoard, iSrc, nPips) {
		/** @type {number} */
		let nBack;
		/** @type {number} */
		const iDest = iSrc - nPips;

		if (iDest >= 0) {           /* Here we can do the Chris rule check */
			return (anBoard.mailbox[0][23 - iDest] < 2);
		}
		/* otherwise, attempting to bear off */
	
		for (nBack = 24; nBack > 0; nBack--)
			if (anBoard.mailbox[1][nBack] > 0)
				break;
	
		return (nBack <= 5 && (iSrc == nBack || iDest == -1));
	}

	/**
	 * @param {movelist} pml
	 * @param {number[]} anRoll
	 * @param {number} nMoveDepth
	 * @param {number} iPip
	 * @param {number} cPip
	 * @param {Board} anBoard
	 * @param {number[]} anMoves
	 * @return {boolean}
	 */
	#legalTurnsSub(pml, anRoll, nMoveDepth, iPip, cPip, anBoard, anMoves) {
		/** @type {boolean} */
		let fUsed = false;
		/** @type {Board} */
		let anBoardNew = new Board([Array(25).fill(0), Array(25).fill(0)]);

		if (nMoveDepth > 3 || !anRoll[nMoveDepth]) {
			return true;
		}

		if (anBoard.mailbox[1][24]) {
			if (anBoard.mailbox[0][anRoll[nMoveDepth] - 1] >= 2) {
				return true;
			}

			anMoves[nMoveDepth * 2] = 24;
			anMoves[nMoveDepth * 2 + 1] = 24 - anRoll[nMoveDepth];

			for (let i = 0; i < 25; i++) {
				anBoardNew.mailbox[0][i] = anBoard.mailbox[0][i];
				anBoardNew.mailbox[1][i] = anBoard.mailbox[1][i];
			}

			this.#ApplySubMove(anBoardNew, 24, anRoll[nMoveDepth], true);

			if (this.#legalTurnsSub(pml, anRoll, nMoveDepth + 1, 23, cPip + anRoll[nMoveDepth], anBoardNew, anMoves)) {
				this.#SaveMoves(pml, nMoveDepth + 1, cPip + anRoll[nMoveDepth], anMoves, anBoardNew);
			}

			return false;
		} else {
			for (let i = iPip; i >= 0; i--) {
				if (anBoard.mailbox[1][i] && this.#LegalMove(anBoard, i, anRoll[nMoveDepth])) {
					anMoves[nMoveDepth * 2] = i;
					anMoves[nMoveDepth * 2 + 1] = i - anRoll[nMoveDepth];

					anBoardNew.mailbox = [[...anBoard.mailbox[0]], [...anBoard.mailbox[1]]];

					this.#ApplySubMove(anBoardNew, i, anRoll[nMoveDepth], true);

					if (this.#legalTurnsSub(pml, anRoll, nMoveDepth + 1, anRoll[0] === anRoll[1] ? i : 23, cPip + anRoll[nMoveDepth], anBoardNew, anMoves)) {
						this.#SaveMoves(pml, nMoveDepth + 1, cPip + anRoll[nMoveDepth], anMoves, anBoardNew);
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
			iMoveBest: 0,
			amMoves: [],
		};
		this.#legalTurnsSub(pml, anRoll, 0, 23, 0, this, anMoves);

		if (anRoll[0] !== anRoll[1]) {
			const n = anRoll[0];
			anRoll[0] = anRoll[1];
			anRoll[1] = n;

			this.#legalTurnsSub(pml, anRoll, 0, 23, 0, this, anMoves);
		}
		return pml;
	}

	/**
	 * @param {Board} anBoard
	 */
	#swapSides(anBoard) {
		for (let i = 0; i < 25; i++) {
			let n = anBoard.mailbox[0][i];
			anBoard.mailbox[0][i] = anBoard.mailbox[1][i];
			anBoard.mailbox[1][i] = n;
		}
	}

	/**
	 * @param {Board} anBoard
	 * @param {number[]} anMove
	 * @returns {Board}
	 */ 
	playMove(anBoard, anMove) {
		for (let i = 0; i < 8; i += 2) {
			/** @type {number} */
			let nSrc;
			/** @type {number} */
			let nDest;

			nSrc = anMove[i];
			nDest = anMove[i | 1];

			if (nSrc < 0)
				/* move is finished */
				break;

			if (!anBoard.mailbox[1][nSrc])
				/* source point is empty; ignore */
				continue;

			anBoard.mailbox[1][nSrc]--;
			if (nDest >= 0)
				anBoard.mailbox[1][nDest]++;

			if (nDest >= 0 && nDest <= 23) {
				anBoard.mailbox[0][24] += anBoard.mailbox[0][23 - nDest];
				anBoard.mailbox[0][23 - nDest] = 0;
			}
		}

		this.#swapSides(anBoard);
		return anBoard;
	}
}
