import {Move, Touch, Turn} from "./movement.js";
import { Bar, Point, Position } from "./position.js";
import Player from "./player.js";

export class Board {
	/**
	 * @param {readonly number[]} mailbox An array based representation of the board with
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
		this.mailbox = Object.freeze(mailbox);
	}

	/**
	 * @return {Board}
	 */
	static startingPosition() {
		return new Board([[0, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0], [0, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0]][[0, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0], [0, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, 0, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0]]);
	}

	/**
	 * @returns {boolean}
	 */
	isComplete() {
		return false;
	}

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
	 * @param {movelist} pml
	 * @param {number[]} anRoll
	 * @param {number} nMoveDepth
	 * @param {number} iPip
	 * @param {number} cPip
	 * @param {Board} anBoard
	 * @param {number[]} anMoves
	 * @param {number} fPartial
	 * @return {boolean}
	 */
	#legalTurnsSub(pml, anRoll, nMoveDepth, iPip, cPip, anBoard, anMoves, fPartial) {
		/** @type {number} */
		let i;
		/** @type {number} */
		let fUsed = 0;
		/** @type {Board} */
		let anBoardNew;

		if (nMoveDepth > 3 || !anRoll[nMoveDepth]) {
			return true;
		}

		if (anBoard)
	}

	/**
	 * @param {movelist} pml
	 * @param {number} n0
	 * @param {number} n1
	 * @param {number} fPartial
	 */
	legalTurns(pml, n0, n1, fPartial) {
		/** @type {number[]} */
		const anRoll = [n0, n1, (n0 === n1) ? n0 : 0, (n0 === n1) ? n0 : 0];
		/** @type {number[]} */
		const anMoves = Array(8).fill(0);

		pml.cMoves = 0;
		pml.cMaxMoves = 0;
		pml.cMaxPips = 0;
		pml.iMoveBest = 0;
		pml.amMoves = [];
		this.#legalTurnsSub(pml, anRoll, 0, 23, 0, this, anMoves, fPartial);

		if (anRoll[0] !== anRoll[1]) {
			const n = anRoll[0];
			anRoll[0] = anRoll[1];
			anRoll[1] = n;

			this.#legalTurnsSub(pml, anRoll, 0, 23, 0, this, anMoves, fPartial);
		}




		// if (player.value !== Player.One.value) throw Error("TODO");
		// if (die0 !== 4 || die1 !== 5) return [];

		// const turns = [
		// 	new Turn(Player.One, [new Touch([new Move(Player.One, new Point(24), new Point(20))]), new Touch([new Move(Player.One, new Point(20), new Point(15))])]),
		// 	new Turn(Player.One, [new Touch([new Move(Player.One, new Point(24), new Point(20))]), new Touch([new Move(Player.One, new Point(13), new Point(8))])]),
		// 	new Turn(Player.One, [new Touch([new Move(Player.One, new Point(13), new Point(9))]), new Touch([new Move(Player.One, new Point(13), new Point(8))])]),
		// 	new Turn(Player.One, [new Touch([new Move(Player.One, new Point(13), new Point(9))]), new Touch([new Move(Player.One, new Point(9), new Point(4))])]),
		// 	new Turn(Player.One, [new Touch([new Move(Player.One, new Point(6), new Point(2))]), new Touch([new Move(Player.One, new Point(13), new Point(8))])]),
		// ];

		// this.mailbox
		// 	.forEach((value, index) => {
		// 		if (this.mailbox[index] <= 0) return;

		// 		const move = new Move(Player.One, new Point(index), new Point(index - die0));
		// 		const updatedBoard = this.move(move);

		// 		updatedBoard.mailbox
		// 			.forEach((value, index) => {
		// 				if (updatedBoard.mailbox[index] <= 0) return;
		// 				if (index - die1 < 1) return;
		// 				if (updatedBoard.mailbox[index - die1] <= -2) return;
	
		// 				const touches = [
		// 					new Touch([move]),
		// 					new Touch([new Move(Player.One, new Point(index), new Point(index - die1))]),
		// 				];
		// 				turns.push(new Turn(Player.One, touches));
		// 			});
		// 	});

		// this.mailbox.forEach((value, index) => {
		// 	if (index !== 0 && index !== 25 && value > 0 && index - die0 >= 1 && this.mailbox[index - die0] >= 0) {
		// 		const move0 = new Move(Player.One, new Point(index), new Point(index - die0));
		// 		const board0 = this.move(move0);
		// 		board0.mailbox.forEach((value, index) => {
		// 			if (index !== 0 && index !== 25 && value > 0 && index - die1 >= 1 && board0.mailbox[index - die1] >= 0) {
		// 				/** @type {Touch[]} */
		// 				const touches = [];
		// 				const move1 = new Move(Player.One, new Point(index), new Point(index - die1));
		// 				if (die0 === die1) {
		// 					const board1 = board0.move(move1);
		// 					board1.mailbox.forEach((value, index) => {
		// 						if (index !== 0 && index !== 25 && value > 0 && index - die1 >= 1 && board1.mailbox[index - die1] >= 0) {
		// 							const move2 = new Move(Player.One, new Point(index), new Point(index - die1));
		// 							const board2 = board1.move(move2);
		// 							board2.mailbox.forEach((value, index) => {
		// 								if (index !== 0 && index !== 25 && value > 0 && index - die1 >= 1 && board2.mailbox[index - die1] >= 0) {
		// 									const move3 = new Move(Player.One, new Point(index), new Point(index - die1));
		// 									if (move3.from.value <= move2.from.value && move2.from.value <= move1.from.value && move1.from.value <= move0.from.value) {
		// 										turns.push(new Turn(Player.One, [new Touch([move0]), new Touch([move1]), new Touch([move2]), new Touch([move3])]));
		// 									}
		// 								}
		// 							});
		// 						}
		// 					});
		// 				} else {
		// 					if (move1.from.value <= move0.from.value) {
		// 						turns.push(new Turn(Player.One, [new Touch([move0]), new Touch([move1])]));
		// 					}
		// 				}
		// 			}
		// 		});
		// 	}
		// });
		// return turns;
	}

	/**
	 * @param {Move} move
	 * @return {Board}
	 */
	move(move) {
		if (move.player.value !== Player.One.value || !(move.from instanceof Point) || !(move.to instanceof Point)) throw Error("TODO");

		const mailbox = Array.from(this.mailbox);
		mailbox[move.from.value]--;
		mailbox[move.to.value]++;
		return new Board(mailbox);
	}

	// /**
	//  * @param {Player} player 
	//  * @param {Position} position 
	//  * @param {number} offset 
	//  * @return {?Board}
	//  */
	// move(player, position, offset) {
	// 	const positionValue = position instanceof Point
	// 		? position.value
	// 		: (player.value === Player.One.value ? 25 : 0);

	// 	if (this.mailbox[positionValue] === 0) {
	// 		throw Error(`Unable to move checker as no checker resides on ${position}.`);
	// 	}

	// 	const potentialPointValue = positionValue + (player.value === Player.One.value ? -offset : offset);

	// 	if (position instanceof Point && potentialPointValue < Point.MIN.value || potentialPointValue > Point.MAX.value) {
	// 		return null;
	// 	} else if (player.value === Player.One.value && this.mailbox[potentialPointValue] >= 0) {
	// 		const potentialMailbox = [...this.mailbox];
	// 		potentialMailbox[positionValue]--;
	// 		potentialMailbox[potentialPointValue]++;
	// 		return new Board(potentialMailbox);
	// 	} else if (player.value === Player.Two.value && this.mailbox[potentialPointValue] <= 0) {
	// 		const potentialMailbox = [...this.mailbox];
	// 		potentialMailbox[positionValue]++;
	// 		potentialMailbox[potentialPointValue]--;
	// 		return new Board(potentialMailbox);
	// 	} else if (player.value === Player.One.value && this.mailbox[potentialPointValue] === -1) {
	// 		const potentialMailbox = [...this.mailbox];
	// 		potentialMailbox[positionValue]--;
	// 		potentialMailbox[potentialPointValue] = 1;
	// 		potentialMailbox[0]--;
	// 		return new Board(potentialMailbox);
	// 	} else if (player.value === Player.Two.value && this.mailbox[potentialPointValue] === 1) {
	// 		const potentialMailbox = [...this.mailbox];
	// 		potentialMailbox[positionValue]++;
	// 		potentialMailbox[potentialPointValue] = -1;
	// 		potentialMailbox[25]++;
	// 		return new Board(potentialMailbox);
	// 	} else if (player.value === Player.One.value && this.mailbox[potentialPointValue] < -1) {
	// 		return null;
	// 	} else if (player.value === Player.Two.value && this.mailbox[potentialPointValue] > 1) {
	// 		return null;
	// 	} else {
	// 		throw Error(`Prior conditionals should've been exhaustive.`);
	// 	}
	// }
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
			const legalTurns = board.legalTurns(player, die0, die1);
			legalTurns.forEach(legalTurn => {
				const boardWithPerformedLegalTurn = legalTurn.touches.flatMap(touch => touch.moves).reduce((previousBoard, currentValue) => previousBoard.move(currentValue), board);
				if (!boardWithPerformedLegalTurn.isComplete()) {
					const turnCount = perft(player.value === Player.One.value ? Player.Two : Player.One, boardWithPerformedLegalTurn, maxDepth - 1);
					movesInNotation.push(`${die0}-${die1}: ${legalTurn.touches.flatMap(touch => touch.moves).filter(move => move.player.value === player.value).map(move => `${move.from instanceof Point ? String(move.from.value).padStart(2, `0`) : `bar`}/${move.to instanceof Point ? String(move.to.value).padStart(2, `0`) : `bar`}`).join(` `)} → ${turnCount}`);
					totalTurnCount += turnCount;
				}
			});
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

	const die0 = 1;
	const die1 = 2;
	const legalTurns = board.legalTurns(player, die0, die1);
	let turnCount = 0;
	legalTurns.forEach(legalTurn => {
		const boardWithPerformedLegalTurn = board.move(legalTurn);
		if (!boardWithPerformedLegalTurn.isComplete()) {
			turnCount += perft(player.value === Player.One.value ? Player.Two : Player.One, boardWithPerformedLegalTurn, depth - 1);
		}
	});
	return turnCount;
}
