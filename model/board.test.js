"use strict";

import test from 'tape';
import {Die} from "./dice.js";
import {Advancement} from "./move.js";
import {Bar, Point} from "./position.js";
import Player from "./player.js";
import Board from './board.js';

test(`withMove`, function (t) {
	t.test(`throw if attempting to move absent checker from point`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.throws(
				() => board.withMove(new Advancement(Player.One, new Die(1), new Point(2))),
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
				() => board.withMove(new Advancement(Player.Two, new Die(1), new Point(2))),
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
				() => board.withMove(new Advancement(Player.One, new Die(1), new Bar())),
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
				() => board.withMove(new Advancement(Player.Two, new Die(1), new Bar())),
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
			t.throws(
				() => board.withMove(new Advancement(Player.One, new Die(6), new Point(6))),
				RangeError(`The point must be between 1 and 24.`),
			)
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.throws(
				() => board.withMove(new Advancement(Player.One, new Die(6), new Point(6))),
				RangeError(`The point must be between 1 and 24.`),
			)
			t.end();
		});
	});
	t.test(`allow move from point to empty point`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.withMove(new Advancement(Player.One, new Die(3), new Point(6))), new Board([0, -2, 0, 1, 0, 0, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.withMove(new Advancement(Player.Two, new Die(3), new Point(19))), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, 0, 0, -1, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`allow move from point to point with single checker of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 1, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.withMove(new Advancement(Player.One, new Die(3), new Point(8))), new Board([0, -2, 0, 0, 0, 2, 4, 0, 2, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, -1, 0, 0, 0, 2, 0]);
			t.deepEqual(board.withMove(new Advancement(Player.Two, new Die(3), new Point(17))), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -2, 0, -4, -2, 0, 0, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`allow move from point to point with multiple checkers of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.withMove(new Advancement(Player.One, new Die(2), new Point(8))), new Board([0, -2, 0, 0, 0, 0, 6, 0, 2, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.withMove(new Advancement(Player.Two, new Die(2), new Point(17))), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -2, 0, -6, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`allow move from point to point with single checker of opposing player's color and move opposing player's checker to bar`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -1, 0, 0, -1, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.withMove(new Advancement(Player.One, new Die(2), new Point(6))), new Board([-1, -1, 0, 0, 1, 0, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 1, 0, 0, 1, 0]);
			t.deepEqual(board.withMove(new Advancement(Player.Two, new Die(2), new Point(19))), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, 0, -1, 0, 0, 1, 1]));
			t.end();
		});
	});
	t.test(`prevent move from point to point with multiple checkers of opposing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.withMove(new Advancement(Player.One, new Die(5), new Point(6))), null);
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = Board.startingPosition();
			t.deepEqual(board.withMove(new Advancement(Player.Two, new Die(5), new Point(19))), null);
			t.end();
		});
	});
	t.test(`allow move from bar to empty point`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 1, 1]);
			t.deepEqual(board.withMove(new Advancement(Player.One, new Die(3), new Bar())), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 1, 0, 1, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -1, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.withMove(new Advancement(Player.Two, new Die(3), new Bar())), new Board([0, -1, 0, -1, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`allow move from bar to point with single checker of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 1, 1]);
			t.deepEqual(board.withMove(new Advancement(Player.One, new Die(1), new Bar())), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -1, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.withMove(new Advancement(Player.Two, new Die(1), new Bar())), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`allow move from bar to point with multiple checkers of playing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 4, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 1]);
			t.deepEqual(board.withMove(new Advancement(Player.One, new Die(1), new Bar())), new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 4, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 3, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -4, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.withMove(new Advancement(Player.Two, new Die(1), new Bar())), new Board([0, -3, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -4, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]));
			t.end();
		});
	});
	t.test(`allow move from bar to point with single checker of opposing player's color and move opposing player's checker to bar`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, 0, 0, -1, 0, 2, 1]);
			t.deepEqual(board.withMove(new Advancement(Player.One, new Die(3), new Bar())), new Board([-1, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -4, 0, 0, 1, 0, 2, 0]));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -2, 0, 1, 0, 0, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.withMove(new Advancement(Player.Two, new Die(3), new Bar())), new Board([0, -2, 0, -1, 0, 0, 4, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 1]));
			t.end();
		});
	});
	t.test(`prevent move from bar to point with multiple checkers of opposing player's color`, function (t) {
		t.test(String(Player.One), function (t) {
			const board = new Board([0, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 1]);
			t.deepEqual(board.withMove(new Advancement(Player.One, new Die(6), new Bar())), null);
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const board = new Board([-1, -2, 0, 0, 0, 0, 5, 0, 3, 0, 0, 0, -5, 5, 0, 0, 0, -3, 0, -5, 0, 0, 0, 0, 2, 0]);
			t.deepEqual(board.withMove(new Advancement(Player.Two, new Die(6), new Bar())), null);
			t.end();
		});
	});
});
