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

        it("Check setEsXaiAddress works", async function() {
            const {xai, esXai, xaiDefaultAdmin} = await loadFixture(deployInfrastructure);
            await xai.connect(xaiDefaultAdmin).setEsXaiAddress(await esXai.getAddress());
            const esXaiAddress = await xai.esXaiAddress();
            expect(esXaiAddress).to.eq(await esXai.getAddress());
        })

        it("Check only admin can set esXai address", async function() {
            const {xai, esXai, addr1} = await loadFixture(deployInfrastructure);
            const expectedRevertMessage = `AccessControl: account ${addr1.address.toLowerCase()} is missing role ${await xai.DEFAULT_ADMIN_ROLE()}`;
            await expect(xai.connect(addr1).setEsXaiAddress(await esXai.getAddress())).to.be.revertedWith(expectedRevertMessage);
        })

        it("Check calling the initializer is not allowed afterwards", async function() {
            const {xai, xaiDefaultAdmin} = await loadFixture(deployInfrastructure);
            const expectedRevertMessage = "Initializable: contract is already initialized";
            await expect(xai.connect(xaiDefaultAdmin).initialize()).to.be.revertedWith(expectedRevertMessage);
        })

        it("Check conversion from Xai to esXai", async function() {
            const {xai, esXai, xaiMinter} = await loadFixture(deployInfrastructure);
            const amountToConvert = BigInt(1000);

            // Mint Xai before conversion
            await xai.connect(xaiMinter).mint(xaiMinter.address, amountToConvert);
            
            const initialXaiSupply = await xai.totalSupply();
            const initialEsXaiSupply = await esXai.totalSupply();

            // Convert Xai to esXai
            await xai.connect(xaiMinter).convertToEsXai(amountToConvert);
            const finalXaiSupply = await xai.totalSupply();
            const finalEsXaiSupply = await esXai.totalSupply();

            // Check if Xai supply decreased and esXai supply increased
            expect(finalXaiSupply).to.eq(initialXaiSupply - amountToConvert);
            expect(finalEsXaiSupply).to.eq(initialEsXaiSupply + amountToConvert);
        })

        it("Check minting up to max supply but not past it", async function() {
            const {xai, xaiMinter} = await loadFixture(deployInfrastructure);
            const maxSupply = await xai.MAX_SUPPLY();

            // Get current total supply
            const currentSupply = await xai.totalSupply();

            // Calculate the difference between max supply and current supply
            const amountToMint = maxSupply - currentSupply;

            // Mint the difference to reach max supply
            await xai.connect(xaiMinter).mint(xaiMinter.address, amountToMint);
            const totalSupplyAfterMint = await xai.totalSupply();

            // Check if total supply equals max supply
            expect(totalSupplyAfterMint).to.eq(maxSupply);

            // Try to mint past max supply and expect revert
            await expect(xai.connect(xaiMinter).mint(xaiMinter.address, BigInt(1))).to.be.revertedWith("Cannot mint beyond max supply");
        })



    }
}
