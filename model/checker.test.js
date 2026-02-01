"use strict";

import test from 'tape';
import Checker from './checker.js';
import {Bar, Point} from "./position.js";
import Player from "./player.js";

test(`withMoveBy`, function (t) {
	t.test(`happy path`, function (t) {
		t.test(String(Player.One), function (t) {
			const checker = new Checker(Player.One, new Point(12));
			t.deepEqual(checker.withMoveBy(5), new Checker(Player.One, new Point(7)));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const checker = new Checker(Player.Two, new Point(12));
			t.deepEqual(checker.withMoveBy(5), new Checker(Player.Two, new Point(17)));
			t.end();
		});
	});
	t.test(`enter`, function (t) {
		t.test(String(Player.One), function (t) {
			const checker = new Checker(Player.One, new Bar());
			t.deepEqual(checker.withMoveBy(5), new Checker(Player.One, new Point(20)));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const checker = new Checker(Player.Two, new Bar());
			t.deepEqual(checker.withMoveBy(5), new Checker(Player.Two, new Point(5)));
			t.end();
		});
	});
});
