"use strict";

import test from "tape";
import Board from "./board.js";
import {GameTurnRollDice, GameTurnStart} from "./game.js";
import Player from "./player.js";
import Dice, {Die} from "./dice.js";

test(`withChangedTurn`, t => {
	t.test(String(Player.One), t => {
		const game = new GameTurnRollDice(Board.startingPosition(), Player.One, [], new Dice(new Die(1), new Die(1)));
		t.deepEqual(game.withChangedTurn(), new GameTurnStart(Board.startingPosition(), Player.Two));
		t.end();
	});
	t.test(String(Player.Two), t => {
		const game = new GameTurnRollDice(Board.startingPosition(), Player.Two, [], new Dice(new Die(1), new Die(1)));
		t.deepEqual(game.withChangedTurn(), new GameTurnStart(Board.startingPosition(), Player.One));
		t.end();
	});
});
