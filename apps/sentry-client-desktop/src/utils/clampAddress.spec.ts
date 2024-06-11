import { expect } from 'chai';
import { clampAddress } from './clampAddress';

describe('clampAddress', () => {
    it('should correctly clamp an address with default lead', () => {
        const address = '0x1234567890abcdef1234567890abcdef12345678';
        const expected = '0x123456...12345678';
        const result = clampAddress(address);
        expect(result).to.equal(expected);
    });

    it('should correctly clamp an address with custom lead', () => {
        const address = '0x1234567890abcdef1234567890abcdef12345678';
        const lead = 4;
        const expected = '0x12...5678';
        const result = clampAddress(address, lead);
        expect(result).to.equal(expected);
    });

    it('should return the same address if its length is less than double the lead', () => {
        const address = '0x12345678';
        const lead = 4;
        const expected = '0x12...5678';
        const result = clampAddress(address, lead);
        expect(result).to.equal(expected);
    });

    it('should throw an error if the address is not a string', () => {
        const address: any = null;
        expect(() => clampAddress(address)).to.throw(TypeError);
    });
});