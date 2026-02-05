"use strict";

import test from "tape";
import {Die} from "./dice.js";

test(`random`,  (t) => {
	const testArguments = [
		{randomNumber: 0, expected: 1},
		{randomNumber: .5, expected: 4},
		{randomNumber: .99, expected: 6},
	];
	for (const {randomNumber, expected} of testArguments) {
		const mathRandom = () => randomNumber;
		t.test(String(randomNumber),  (t) => {
			t.deepEqual(Die.random(mathRandom), new Die(expected));
			t.end();
		});
	}
});
