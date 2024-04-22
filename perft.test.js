import test from 'tape';
import {Board} from './board.js';

/**
 * @param {Board} board
 * @param {number} maxDepth
 * @return {number}
 */
function divide(board, maxDepth) {
	let totalTurnCount = 0;
	for (let die0 = 1; die0 <= 6; die0++) {
		for (let die1 = die0; die1 <= 6; die1++) {
			const legalTurns = board.legalTurns(die0, die1);

			legalTurns.amMoves.forEach(legalTurn => {
				const boardNew = new Board([[...board.mailbox[0]], [...board.mailbox[1]]]);
				const tms = board.playMove(boardNew, legalTurn.anMove);
				const moveCount = perft(tms, maxDepth - 1);
				// console.log(`${die0}-${die1}: ${Array.from(Array(legalTurn.cMoves), (_, i) => `${legalTurn.anMove[i * 2] + 1}/${legalTurn.anMove[i * 2 + 1] + 1}`).join(` `)} → ${moveCount}`);
				totalTurnCount += moveCount;
			});
		}
	}
	return totalTurnCount;
}

/**
 * @param {Board} board
 * @param {number} depth
 * @return {number}
 */
function perft(board, depth) {
	if (depth === 0) {
		return 1;
	}

	let totalTurnCount = 0;
	for (let die0 = 1; die0 <= 6; die0++) {
		for (let die1 = die0; die1 <= 6; die1++) {
			const legalTurns = board.legalTurns(die0, die1);
			legalTurns.amMoves.forEach(legalTurn => {
				const boardNew = new Board([[...board.mailbox[0]], [...board.mailbox[1]]]);
				const tms = board.playMove(boardNew, legalTurn.anMove);
				const moveCount = perft(tms, depth - 1);
				totalTurnCount += moveCount;
			});
		}
	}
	return totalTurnCount;
}

test(`perft`, function (t) {
	t.test(`starting position`, function (t) {
		t.test(`depth 1`, function (t) {
			const board = Board.startingPosition();
			t.equal(divide(board, 1), 447);
			t.end();
		});
		t.test(`depth 2`, function (t) {
			const board = Board.startingPosition();
			t.equal(divide(board, 2), 202_782);
			t.end();
		});
	});
	t.test(`scattered`, function (t) {
		t.test(`depth 1`, function (t) {
			const board = new Board([[0, 1, 1, 1, 1, 3, 0, 1, 0, 0, 0, 0, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0], [0, 1, 1, 1, 1, 3, 0, 1, 0, 0, 0, 0, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0]]);
			t.equal(divide(board, 1), 1_665);
			t.end();
		});
		t.test(`depth 2`, function (t) {
			const board = new Board([[0, 1, 1, 1, 1, 3, 0, 1, 0, 0, 0, 0, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0], [0, 1, 1, 1, 1, 3, 0, 1, 0, 0, 0, 0, 2, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0]]);
			t.equal(divide(board, 2), 1_083_063);
			t.end();
		});
	});
	t.test(`end game`, function (t) {
		t.test(`depth 1`, function (t) {
			const board = new Board([[4, 3, 0, 2, 1, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 2, 0, 4, 1, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]);
			t.equal(divide(board, 1), 203);
			t.end();
		});
		t.test(`depth 2`, function (t) {
			const board = new Board([[4, 3, 0, 2, 1, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [0, 2, 0, 4, 1, 8, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]]);
			t.equal(divide(board, 2), 46_690);
			t.end();
		});
	});
});
