"use strict";

import test from 'tape';
import {CheckerLegacy} from './checker.js';
import {Bar, Point} from "./position.js";
import Player from "./player.js";

test(`moveBy`, function (t) {
	t.test(`happy path`, function (t) {
		t.test(String(Player.One), function (t) {
			const checker = new CheckerLegacy(Player.One, new Point(12));
			t.deepEqual(checker.moveBy(5), new CheckerLegacy(Player.One, new Point(7)));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const checker = new CheckerLegacy(Player.Two, new Point(12));
			t.deepEqual(checker.moveBy(5), new CheckerLegacy(Player.Two, new Point(17)));
			t.end();
		});
	});
	t.test(`enter`, function (t) {
		t.test(String(Player.One), function (t) {
			const checker = new CheckerLegacy(Player.One, new Bar());
			t.deepEqual(checker.moveBy(5), new CheckerLegacy(Player.One, new Point(20)));
			t.end();
		});
		t.test(String(Player.Two), function (t) {
			const checker = new CheckerLegacy(Player.Two, new Bar());
			t.deepEqual(checker.moveBy(5), new CheckerLegacy(Player.Two, new Point(5)));
			t.end();
		});
	});
});
