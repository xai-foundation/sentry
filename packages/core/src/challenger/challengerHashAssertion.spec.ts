import { expect } from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
import * as ethers from 'ethers';
import { bls12_381 as bls } from '@noble/curves/bls12-381';

describe('challengerHashAssertion', () => {
    let challengerHashAssertion: any;
    let signStub: sinon.SinonStub;
    let keccak256Stub: sinon.SinonStub;
    let encodeStub: sinon.SinonStub;

    beforeEach(() => {
        signStub = sinon.stub(bls, 'sign').resolves(new Uint8Array([1, 2, 3]));
        keccak256Stub = sinon.stub(ethers, 'keccak256').returns('0x123');
        encodeStub = sinon.stub(ethers.AbiCoder.prototype, 'encode').returns('encodedMessage');

        challengerHashAssertion = proxyquire.noCallThru().load('./challengerHashAssertion', {
            '@noble/curves/bls12-381': { bls12_381: { sign: signStub } },
            'ethers': { ...ethers, keccak256: keccak256Stub }
        }).challengerHashAssertion;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should correctly sign a message', async () => {
        const challengerBlsSecretKey = 'a1b2c3';
        const assertionId = BigInt(1);
        const predecessorAssertionId = BigInt(0);
        const confirmData = '0xconfirm';
        const assertionTimestamp = BigInt(123456789);

        const signature = await challengerHashAssertion(
            challengerBlsSecretKey,
            assertionId,
            predecessorAssertionId,
            confirmData,
            assertionTimestamp
        );

        expect(encodeStub.calledWith(
            ['uint64', 'uint64', 'bytes32', 'uint64'],
            [assertionId, predecessorAssertionId, confirmData, assertionTimestamp]
        )).to.be.true;

        expect(keccak256Stub.calledWith('encodedMessage')).to.be.true;
        expect(signStub.calledOnce).to.be.true;
        expect(signature).to.equal('0x010203');
    });

    // Add more tests here to cover edge cases and error handling
});
