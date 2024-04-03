import {expect} from 'chai';
import {describe, it} from 'mocha';

describe('core', () => {
	describe('unit tests', () => {
		it('should return the sum of two numbers', () => {
			const number = 2;
			const result = number + number;
			expect(result).to.equal(4);
		});
	});
});
