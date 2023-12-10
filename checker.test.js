import test from 'tape';
import Checker from "./checker.js";

test(`moveBy`, function (t) {
	t.test(`happy path`, function (t) {
		t.test(`player 0`, function (t) {
			const checker = new Checker(`0`, 12);
			t.deepEqual(checker.moveBy(5), new Checker(`0`, 17));
			t.end();
		});
		t.test(`player 1`, function (t) {
			const checker = new Checker(`1`, 12);
			t.deepEqual(checker.moveBy(5), new Checker(`1`, 7));
			t.end();
		});
	});
});
