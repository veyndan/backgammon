"use strict";

import test from "tape";
import Board from "./board.js";
import Game from "./game.js";
import Player from "./player.js";
import Turn from "./turn.js";

test(`withChangedTurn`, function (t) {
	t.test(String(Player.One), function (t) {
		const game = new Game(Board.startingPosition(), new Turn(Player.One, []));
		t.deepEqual(game.withChangedTurn(), new Game(Board.startingPosition(), new Turn(Player.Two, [])));
		t.end();
	});
	t.test(String(Player.Two), function (t) {
		const game = new Game(Board.startingPosition(), new Turn(Player.Two, []));
		t.deepEqual(game.withChangedTurn(), new Game(Board.startingPosition(), new Turn(Player.One, [])));
		t.end();
	});
});
