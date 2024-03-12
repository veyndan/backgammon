import test from 'tape';
import {Bar, Point} from "./position.js";
import Player from "./player.js";
import Board from './board.js';

test(`move`, function (t) {
	t.test(`throw if attempting to move absent checker from point`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.throws(
				() => board.move(Player.One, new Point(2), 1),
				{
					name: `Error`,
					message: `Unable to move checker as no checker resides on Point(2).`,
				},
			);
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.throws(
				() => board.move(Player.Two, new Point(2), 1),
				{
					name: `Error`,
					message: `Unable to move checker as no checker resides on Point(2).`,
				},
			);
			t.end();
		});
	});
	t.test(`throw if attempting to move absent checker from bar`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.throws(
				() => board.move(Player.One, new Bar(), 1),
				{
					name: `Error`,
					message: `Unable to move checker as no checker resides on Bar.`
				},
			);
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.throws(
				() => board.move(Player.Two, new Bar(), 1),
				{
					name: `Error`,
					message: `Unable to move checker as no checker resides on Bar.`
				},
			);
			t.end();
		});
	});
	t.test(`prevent move from point to position beyond the bounds of the board`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.move(Player.One, new Point(6), 6), null);
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.move(Player.Two, new Point(19), 6), null);
			t.end();
		});
	});
	t.test(`allow move from point to empty point`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.move(Player.One, new Point(6), 3), new Board([0, -2, 0, 1, 0, 0, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.move(Player.Two, new Point(19), 3), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, 0, 0, -1, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`allow move from point to point with single checker of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 1, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.move(Player.One, new Point(8), 3), new Board([0, -2, 0, 0, 0, 2, 4, 0, 2, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, -1, 0, 0, 0, 2, 0]);
			t.deepEqual(board.move(Player.Two, new Point(17), 3), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -2, 0, -4, -2, 0, 0, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`allow move from point to point with multiple checkers of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.move(Player.One, new Point(8), 2), new Board([0, -2, 0, 0, 0, 0, 6, 0, 2, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.move(Player.Two, new Point(17), 2), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -2, 0, -6, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`allow move from point to point with single checker of opposing player's color and move opposing player's checker to bar`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -1, 0, 0, -1, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.move(Player.One, new Point(6), 2), new Board([-1, -1, 0, 0, 1, 0, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 1, 0, 0, 1, 0]);
			t.deepEqual(board.move(Player.Two, new Point(19), 2), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, 0, -1, 0, 0, 1, 1]));
			t.end();
		});
	});
	t.test(`prevent move from point to point with multiple checkers of opposing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.move(Player.One, new Point(6), 5), null);
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.move(Player.Two, new Point(19), 5), null);
			t.end();
		});
	});
	t.test(`allow move from bar to empty point`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 1, 1]);
			t.deepEqual(board.move(Player.One, new Bar(), 3), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 1, 0, 1, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -1, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.move(Player.Two, new Bar(), 3), new Board([0, -1, 0, -1, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`allow move from bar to point with single checker of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 1, 1]);
			t.deepEqual(board.move(Player.One, new Bar(), 1), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -1, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.move(Player.Two, new Bar(), 1), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`allow move from bar to point with multiple checkers of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 4, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 1]);
			t.deepEqual(board.move(Player.One, new Bar(), 1), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 4, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 3, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -4, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.move(Player.Two, new Bar(), 1), new Board([0, -3, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -4, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`allow move from bar to point with single checker of opposing player's color and move opposing player's checker to bar`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, 0, 0, -1, 0, 2, 1]);
			t.deepEqual(board.move(Player.One, new Bar(), 3), new Board([-1, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, 0, 0, 1, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -2, 0, 1, 0, 0, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.move(Player.Two, new Bar(), 3), new Board([0, -2, 0, -1, 0, 0, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 1]));
			t.end();
		});
	});
	t.test(`prevent move from bar to point with multiple checkers of opposing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 1]);
			t.deepEqual(board.move(Player.One, new Bar(), 6), null);
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.move(Player.Two, new Bar(), 6), null);
			t.end();
		});
	});
});
