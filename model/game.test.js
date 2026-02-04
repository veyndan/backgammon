"use strict";

import test from "tape";
import Board from "./board.js";
import {GameTurnRollDice, GameTurnStart} from "./game.js";
import Player from "./player.js";
import {TurnRollDice, TurnStart} from "./turn.js";
import Dice, {Die} from "./dice.js";

test(`withChangedTurn`, function (t) {
	t.test(String(Player.One), function (t) {
		const game = new GameTurnRollDice(Board.startingPosition(), new TurnRollDice(Player.One, [], new Dice(new Die(1), new Die(1))));
		t.deepEqual(game.withChangedTurn(), new GameTurnStart(Board.startingPosition(), new TurnStart(Player.Two)));
		t.end();
	});
	t.test(String(Player.Two), function (t) {
		const game = new GameTurnRollDice(Board.startingPosition(), new TurnRollDice(Player.Two, [], new Dice(new Die(1), new Die(1))));
		t.deepEqual(game.withChangedTurn(), new GameTurnStart(Board.startingPosition(), new TurnStart(Player.One)));
		t.end();
	});
});
