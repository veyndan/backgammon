"use strict";

import test from "tape";
import Board from "./board.js";
import Game from "./game.js";
import Player from "./player.js";
import Turn from "./turn.js";

test(`changeTurn`, function (t) {
	t.test(String(Player.One), function (t) {
		const game = new Game(Board.startingPosition(), new Turn(Player.One));
		game.changeTurn();
		t.deepEqual(game.turn, new Turn(Player.Two));
		t.end();
	});
	t.test(String(Player.Two), function (t) {
		const game = new Game(Board.startingPosition(), new Turn(Player.Two));
		game.changeTurn();
		t.deepEqual(game.turn, new Turn(Player.One));
		t.end();
	});
});
