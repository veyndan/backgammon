"use strict";

import test from "tape";
import {Die} from "./dice.js";

test(`random`,  (t) => {
	const testArguments = [
		{exclude: null, randomNumber: 0, expected: 1},
		{exclude: null, randomNumber: .2, expected: 2},
		{exclude: null, randomNumber: .99, expected: 6},
		{exclude: 1, randomNumber: 0, expected: 2},
		{exclude: 2, randomNumber: 0, expected: 1},
		{exclude: 6, randomNumber: 0, expected: 1},
		{exclude: 1, randomNumber: 0.2, expected: 2},
		{exclude: 2, randomNumber: 0.2, expected: 3},
		{exclude: 6, randomNumber: 0.2, expected: 2},
		{exclude: 1, randomNumber: 0.99, expected: 6},
		{exclude: 2, randomNumber: 0.99, expected: 6},
		{exclude: 6, randomNumber: 0.99, expected: 1},
	];
	for (const {exclude, randomNumber, expected} of testArguments) {
		t.test(`exclude ${exclude} given ${randomNumber}`,  (t) => {
			const mathRandom = () => randomNumber
			t.deepEqual(Die.random(exclude, mathRandom), new Die(expected));
			t.end();
		});
	}
});
