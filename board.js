import {Move, Touch, Turn} from "./movement.js";
import { Bar, Point, Position } from "./position.js";
import Player from "./player.js";

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
const MAX_MOVES = 3060;

const NUM_OUTPUTS = 5;

export class Board {
	/**
	 * @param {readonly number[][]} mailbox An array based representation of the board with
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
	 * @returns {boolean}
	 */
	isComplete() {
		return false;
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
	 * @param {boolean} fPartial
	 */
	#SaveMoves(pml, cMoves, cPip, anMoves, anBoard, fPartial) {
		/** @type {number} */
		let i;
		/** @type {number} */
		let j;
		/** @type {move} */
		let pm;

		if (fPartial) {
			/* Save all moves, even incomplete ones */
			if (cMoves > pml.cMaxMoves)
				pml.cMaxMoves = cMoves;

			if (cPip > pml.cMaxPips)
				pml.cMaxPips = cPip;
		} else {
			/* Save only legal moves: if the current move moves plays less
			 * chequers or pips than those already found, it is illegal; if
			 * it plays more, the old moves are illegal. */
			if (cMoves < pml.cMaxMoves || cPip < pml.cMaxPips)
				return;

			if (cMoves > pml.cMaxMoves || cPip > pml.cMaxPips)
				pml.cMoves = 0;

			pml.cMaxMoves = cMoves;
			pml.cMaxPips = cPip;
		}

		const key = this.#PositionKey(anBoard);

		for (i = 0; i < pml.cMoves; i++) {

			pm = pml.amMoves[i];

			if (this.#EqualKeys(key, pm.key)) {
				if (cMoves > pm.cMoves || cPip > pm.cPips) {
					for (j = 0; j < cMoves * 2; j++)
						pm.anMove[j] = anMoves[j] > -1 ? anMoves[j] : -1;

					if (cMoves < 4)
						pm.anMove[cMoves * 2] = -1;

					pm.cMoves = cMoves;
					pm.cPips = cPip;
				}

				return;
			}
		}

		pm = {
			anMove: [],
			key: {data: Array(7).fill(0)},
			arEvalMove: Array(7).fill(0.0),
			cMoves: 0,
			cmark: 0,
			cPips: 0,
		}

		for (i = 0; i < cMoves * 2; i++)
			pm.anMove.push(anMoves[i] > -1 ? anMoves[i] : -1);

		if (cMoves < 4)
			pm.anMove[cMoves * 2] = -1;

		this.#CopyKey(key, pm.key);

		pm.cMoves = cMoves;
		pm.cPips = cPip;
		pm.cmark = CMark.CMARK_NONE;

		for (i = 0; i < NUM_OUTPUTS; i++)
			pm.arEvalMove[i] = 0.0;

		pml.amMoves.push(pm);
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
	 * @param {boolean} fPartial
	 * @return {boolean}
	 */
	#legalTurnsSub(pml, anRoll, nMoveDepth, iPip, cPip, anBoard, anMoves, fPartial) {
		/** @type {number} */
		let i;
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

			for (i = 0; i < 24; i++) {
				anBoardNew.mailbox[0][i] = anBoard.mailbox[0][i];
				anBoardNew.mailbox[1][i] = anBoard.mailbox[1][i];
			}

			this.#ApplySubMove(anBoardNew, 24, anRoll[nMoveDepth], true);

			if (this.#legalTurnsSub(pml, anRoll, nMoveDepth + 1, 23, cPip + anRoll[nMoveDepth], anBoardNew, anMoves, fPartial)) {
				this.#SaveMoves(pml, nMoveDepth + 1, cPip + anRoll[nMoveDepth], anMoves, anBoardNew, fPartial);
			}

			return fPartial;
		} else {
			for (i = iPip; i >= 0; i--) {
				if (anBoard.mailbox[1][i] && this.#LegalMove(anBoard, i, anRoll[nMoveDepth])) {
					anMoves[nMoveDepth * 2] = i;
					anMoves[nMoveDepth * 2 + 1] = i - anRoll[nMoveDepth];

					this.#ApplySubMove(anBoardNew, i, anRoll[nMoveDepth], true);

					if (this.#legalTurnsSub(pml, anRoll, nMoveDepth + 1, anRoll[0] === anRoll[1] ? i : 23, cPip + anRoll[nMoveDepth], anBoardNew, anMoves, fPartial)) {
						this.#SaveMoves(pml, nMoveDepth + 1, cPip + anRoll[nMoveDepth], anMoves, anBoardNew, fPartial);
					}

					fUsed = true;
				}
			}
		}

		return !fUsed || fPartial;
	}

	/**
	 * @param {number} n0
	 * @param {number} n1
	 * @param {boolean} fPartial
	 * @return {movelist}
	 */
	legalTurns(n0, n1, fPartial) {
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
		this.#legalTurnsSub(pml, anRoll, 0, 23, 0, this, anMoves, fPartial);

		if (anRoll[0] !== anRoll[1]) {
			const n = anRoll[0];
			anRoll[0] = anRoll[1];
			anRoll[1] = n;

			this.#legalTurnsSub(pml, anRoll, 0, 23, 0, this, anMoves, fPartial);
		}
		return pml;
	}
}

/**
 * @typedef Divide
 * @type {object}
 * @property {number} totalTurnCount
 * @property {string[]} movesInNotation
 */

/**
 * @param {Player} player
 * @param {Board} board
 * @param {number} maxDepth
 * @return {Divide}
 */
export function divide(player, board, maxDepth) {
	let totalTurnCount = 0;
	const movesInNotation = [];
	for (let die0 = 1; die0 <= 6; die0++) {
		for (let die1 = die0; die1 <= 6; die1++) {
			const legalTurns = board.legalTurns(die0, die1, false);
			// TODO I translated the GenerateMoves function in gnubg over to here, and this is the result of that.
			// It doesn't look like it's returning the correct results, though I may be mistaken as I haven't properly looked into it.
			// Check that the translation stuff makes sense. I can do that by printing out the below values in gnubg and see if it's the same.
			// Once I've verified this is correct, I'll need to convert PlayMove from gnubg to here (the next step in the Divide function).
			console.log(die0, die1, legalTurns.amMoves.flatMap(amMove => amMove.anMove));
			// legalTurns.forEach(legalTurn => {
			// 	const boardWithPerformedLegalTurn = legalTurn.touches.flatMap(touch => touch.moves).reduce((previousBoard, currentValue) => previousBoard.move(currentValue), board);
			// 	if (!boardWithPerformedLegalTurn.isComplete()) {
			// 		const turnCount = perft(player.value === Player.One.value ? Player.Two : Player.One, boardWithPerformedLegalTurn, maxDepth - 1);
			// 		movesInNotation.push(`${die0}-${die1}: ${legalTurn.touches.flatMap(touch => touch.moves).filter(move => move.player.value === player.value).map(move => `${move.from instanceof Point ? String(move.from.value).padStart(2, `0`) : `bar`}/${move.to instanceof Point ? String(move.to.value).padStart(2, `0`) : `bar`}`).join(` `)} → ${turnCount}`);
			// 		totalTurnCount += turnCount;
			// 	}
			// });
		}
	}
	return {
		totalTurnCount: totalTurnCount,
		movesInNotation: movesInNotation,
	};
}

/**
 * @param {Player} player
 * @param {Board} board
 * @param {number} depth
 * @return {number}
 */
function perft(player, board, depth) {
	if (depth === 0) {
		return 1;
	}

	// const die0 = 1;
	// const die1 = 2;
	// const legalTurns = board.legalTurns(player, die0, die1);
	// let turnCount = 0;
	// legalTurns.forEach(legalTurn => {
	// 	const boardWithPerformedLegalTurn = board.move(legalTurn);
	// 	if (!boardWithPerformedLegalTurn.isComplete()) {
	// 		turnCount += perft(player.value === Player.One.value ? Player.Two : Player.One, boardWithPerformedLegalTurn, depth - 1);
	// 	}
	// });
	// return turnCount;
}
