"use strict";

import test from 'tape';
import {Die} from "./dice.js";
import {Bar, Point} from "./position.js";
import Player from "./player.js";
import Board from './board.js';
import {Advancement} from "./move.js";

test(`validation`, function(t) {
	t.test(`throw if board has an invalid number of checkers`, function (t) {
		t.test(`too many`, function (t) {
			t.test(String(Player.One), function (t) {
				t.throws(
					() => new Board([0, -2, 0, 0, 0, 0, 6, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]),
					Error(`Player 1 should have exactly 15 checkers on the board, but found 16.`),
				);
				t.end();
			});
			t.test(String(Player.Two), function (t) {
				t.throws(
					() => new Board([0, -3, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]),
					Error(`Player 2 should have exactly 15 checkers on the board, but found 16.`),
				);
				t.end();
			});
		});
		t.test(`not enough`, function (t) {
			t.test(String(Player.One), function (t) {
				t.throws(
					() => new Board([0, -2, 0, 0, 0, 0, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]),
					Error(`Player 1 should have exactly 15 checkers on the board, but found 14.`),
				);
				t.end();
			});
			t.test(String(Player.Two), function (t) {
				t.throws(
					() => new Board([0, -1, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]),
					Error(`Player 2 should have exactly 15 checkers on the board, but found 14.`),
				);
				t.end();
			});
		});
	});
});

test(`getMove`, function (t) {
	t.test(`throw if attempting to move absent checker from point`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.throws(
				() => board.getMove(Player.One, new Die(1), new Point(2)),
				Error(`Unable to get move for checker as no checker resides on Point(2).`),
			);
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.throws(
				() => board.getMove(Player.Two, new Die(1), new Point(2)),
				Error(`Unable to get move for checker as no checker resides on Point(2).`),
			);
			t.end();
		});
	});
	t.test(`throw if attempting to move absent checker from bar`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.throws(
				() => board.getMove(Player.One, new Die(1), new Bar()),
				Error(`Unable to get move for checker as no checker resides on Bar.`),
			);
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.throws(
				() => board.getMove(Player.Two, new Die(1), new Bar()),
				Error(`Unable to get move for checker as no checker resides on Bar.`),
			);
			t.end();
		});
	});
	t.test(`prevent move from point to position beyond the bounds of the board`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.getMove(Player.One, new Die(6), new Point(6)), null)
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.getMove(Player.One, new Die(6), new Point(6)), null)
			t.end();
		});
	});
	t.test(`allow move from point to empty point`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.getMove(Player.One, new Die(3), new Point(6)), new Advancement(Player.One, new Die(3), new Point(6), new Point(3), false));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.getMove(Player.Two, new Die(3), new Point(19)), new Advancement(Player.Two, new Die(3), new Point(19), new Point(22), false));
			t.end();
		});
	});
	t.test(`allow move from point to point with single checker of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 1, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.getMove(Player.One, new Die(3), new Point(8)), new Advancement(Player.One, new Die(3), new Point(8), new Point(5), false));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, -1, 0, 0, 0, 2, 0]);
			t.deepEqual(board.getMove(Player.Two, new Die(3), new Point(17)), new Advancement(Player.Two, new Die(3), new Point(17), new Point(20), false));
			t.end();
		});
	});
	t.test(`allow move from point to point with multiple checkers of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.getMove(Player.One, new Die(2), new Point(8)), new Advancement(Player.One, new Die(2), new Point(8), new Point(6), false));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.getMove(Player.Two, new Die(2), new Point(17)), new Advancement(Player.Two, new Die(2), new Point(17), new Point(19), false));
			t.end();
		});
	});
	t.test(`allow move from point to point with single checker of opposing player's color and move opposing player's checker to bar`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -1, 0, 0, -1, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.getMove(Player.One, new Die(2), new Point(6)), new Advancement(Player.One, new Die(2), new Point(6), new Point(4), true));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 1, 0, 0, 1, 0]);
			t.deepEqual(board.getMove(Player.Two, new Die(2), new Point(19)), new Advancement(Player.Two, new Die(2), new Point(19), new Point(21), true));
			t.end();
		});
	});
	t.test(`prevent move from point to point with multiple checkers of opposing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.getMove(Player.One, new Die(5), new Point(6)), null);
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.getMove(Player.Two, new Die(5), new Point(19)), null);
			t.end();
		});
	});
	t.test(`prevent move from point if bar has checker of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 1, 1]);
			t.deepEqual(board.getMove(Player.One, new Die(3), new Point(6)), null);
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -1, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.getMove(Player.Two, new Die(3), new Point(19)), null);
			t.end();
		});
	});
	t.test(`allow move from bar to empty point`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 1, 1]);
			t.deepEqual(board.getMove(Player.One, new Die(3), new Bar()), new Advancement(Player.One, new Die(3), new Bar(), new Point(22), false));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -1, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.getMove(Player.Two, new Die(3), new Bar()), new Advancement(Player.Two, new Die(3), new Bar(), new Point(3), false));
			t.end();
		});
	});
	t.test(`allow move from bar to point with single checker of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 1, 1]);
			t.deepEqual(board.getMove(Player.One, new Die(1), new Bar()), new Advancement(Player.One, new Die(1), new Bar(), new Point(24), false));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -1, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.getMove(Player.Two, new Die(1), new Bar()), new Advancement(Player.Two, new Die(1), new Bar(), new Point(1), false));
			t.end();
		});
	});
	t.test(`allow move from bar to point with multiple checkers of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 4, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 1]);
			t.deepEqual(board.getMove(Player.One, new Die(1), new Bar()), new Advancement(Player.One, new Die(1), new Bar(), new Point(24), false));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -4, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.getMove(Player.Two, new Die(1), new Bar()), new Advancement(Player.Two, new Die(1), new Bar(), new Point(1), false));
			t.end();
		});
	});
	t.test(`allow move from bar to point with single checker of opposing player's color and move opposing player's checker to bar`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, 0, 0, -1, 0, 1, 1]);
			t.deepEqual(board.getMove(Player.One, new Die(3), new Bar()), new Advancement(Player.One, new Die(3), new Bar(), new Point(22), true));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -1, 0, 1, 0, 0, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.getMove(Player.Two, new Die(3), new Bar()), new Advancement(Player.Two, new Die(3), new Bar(), new Point(3), true));
			t.end();
		});
	});
	t.test(`prevent move from bar to point with multiple checkers of opposing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 1, 1]);
			t.deepEqual(board.getMove(Player.One, new Die(6), new Bar()), null);
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -1, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.getMove(Player.Two, new Die(6), new Bar()), null);
			t.end();
		});
	});
});

test(`withMove`, function (t) {
	t.test(`move from point to empty point`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.withMove(board.getMove(Player.One, new Die(3), new Point(6))), new Board([0, -2, 0, 1, 0, 0, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.withMove(board.getMove(Player.Two, new Die(3), new Point(19))), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, 0, 0, -1, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`move from point to point with single checker of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 1, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.withMove(board.getMove(Player.One, new Die(3), new Point(8))), new Board([0, -2, 0, 0, 0, 2, 4, 0, 2, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, -1, 0, 0, 0, 2, 0]);
			t.deepEqual(board.withMove(board.getMove(Player.Two, new Die(3), new Point(17))), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -2, 0, -4, -2, 0, 0, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`move from point to point with multiple checkers of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.withMove(board.getMove(Player.One, new Die(2), new Point(8))), new Board([0, -2, 0, 0, 0, 0, 6, 0, 2, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.withMove(board.getMove(Player.Two, new Die(2), new Point(17))), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -2, 0, -6, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`move from point to point with single checker of opposing player's color and move opposing player's checker to bar`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -1, 0, 0, -1, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.withMove(board.getMove(Player.One, new Die(2), new Point(6))), new Board([-1, -1, 0, 0, 1, 0, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 1, 0, 0, 1, 0]);
			t.deepEqual(board.withMove(board.getMove(Player.Two, new Die(2), new Point(19))), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, 0, -1, 0, 0, 1, 1]));
			t.end();
		});
	});
	t.test(`move from bar to empty point`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 1, 1]);
			t.deepEqual(board.withMove(board.getMove(Player.One, new Die(3), new Bar())), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 1, 0, 1, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -1, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.withMove(board.getMove(Player.Two, new Die(3), new Bar())), new Board([0, -1, 0, -1, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`move from bar to point with single checker of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 1, 1]);
			t.deepEqual(board.withMove(board.getMove(Player.One, new Die(1), new Bar())), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -1, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.withMove(board.getMove(Player.Two, new Die(1), new Bar())), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`move from bar to point with multiple checkers of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 4, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 1]);
			t.deepEqual(board.withMove(board.getMove(Player.One, new Die(1), new Bar())), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 4, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 3, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -4, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.withMove(board.getMove(Player.Two, new Die(1), new Bar())), new Board([0, -3, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -4, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`move from bar to point with single checker of opposing player's color and move opposing player's checker to bar`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, 0, 0, -1, 0, 1, 1]);
			t.deepEqual(board.withMove(board.getMove(Player.One, new Die(3), new Bar())), new Board([-1, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, 0, 0, 1, 0, 1, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -1, 0, 1, 0, 0, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.withMove(board.getMove(Player.Two, new Die(3), new Bar())), new Board([0, -1, 0, -1, 0, 0, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 1]));
			t.end();
		});
	});
});
