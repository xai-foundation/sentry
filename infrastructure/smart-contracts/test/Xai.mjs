import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

/**
 * @title Xai Tests
 * @dev Implementation of the Xai Tests
 */
export function XaiTests(deployInfrastructure) {
    return function() {

        it("Check the max supply is 2,500,000,000", async function() {
            const {xai} = await loadFixture(deployInfrastructure);
            const maxSupply = await xai.MAX_SUPPLY();
            expect(maxSupply).to.eq(2500000000n * 10n**18n);
        })

        it("Check only minter can mint", async function() {
            const {xai, xaiMinter, addr1} = await loadFixture(deployInfrastructure);
            const initialSupply = await xai.totalSupply();
            await xai.connect(xaiMinter).mint(xaiMinter.address, 1000);
            const finalSupply = await xai.totalSupply();
            expect(finalSupply).to.eq(initialSupply + BigInt(1000));
            const expectedRevertMessage = `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${await xai.MINTER_ROLE()}`;
            await expect(xai.connect(addr1).mint(addr1.address, 1000)).to.be.revertedWith(expectedRevertMessage);
        })

        it("Check burning works", async function() {
            const {xai, xaiMinter, addr1} = await loadFixture(deployInfrastructure);
            const initialSupply = await xai.totalSupply();
            // Mint enough tokens to addr1 before burning
            await xai.connect(xaiMinter).mint(addr1.address, BigInt(1000));
            await xai.connect(addr1).burn(BigInt(1000));
            const finalSupply = await xai.totalSupply();
            expect(finalSupply).to.eq(initialSupply);
        })
    }
}
