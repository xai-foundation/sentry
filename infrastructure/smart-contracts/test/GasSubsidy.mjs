import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

export function GasSubsidyTests(deployInfrastructure) {
    return function() {
        it("Check calling the initializer is not allowed afterwards", async function() {
            const {gasSubsidy, gasSubsidyDefaultAdmin, gasSubsidyTransferAdmin} = await loadFixture(deployInfrastructure);
            const expectedRevertMessage = "Initializable: contract is already initialized";
            await expect(gasSubsidy.connect(gasSubsidyDefaultAdmin).initialize()).to.be.revertedWith(expectedRevertMessage);
        })

        it("Check transfer of tokens from gasSubsidy contract", async function() {
            const {gasSubsidy, gasSubsidyTransferAdmin, xai, xaiMinter, addr1} = await loadFixture(deployInfrastructure);
            const initialBalance = await xai.balanceOf(await gasSubsidy.getAddress());
            const transferAmount = BigInt(1000);

            // Mint some Xai to the gasSubsidy
            await xai.connect(xaiMinter).mint(await gasSubsidy.getAddress(), transferAmount);
            expect(await xai.balanceOf(await gasSubsidy.getAddress())).to.equal(initialBalance + transferAmount);

            // Use the gasSubsidyTransferAdmin to move tokens out of the contract
            await gasSubsidy.connect(gasSubsidyTransferAdmin).transferTokens(await xai.getAddress(), await addr1.getAddress(), transferAmount);
            expect(await xai.balanceOf(await addr1.getAddress())).to.equal(transferAmount);
        });

        it("Check only transfer role can transfer tokens", async function() {
            const {gasSubsidy, xai, xaiMinter, addr1} = await loadFixture(deployInfrastructure);
            const transferAmount = BigInt(1000);

            // Mint some Xai to the gasSubsidy
            await xai.connect(xaiMinter).mint(await gasSubsidy.getAddress(), transferAmount);
            expect(await xai.balanceOf(await gasSubsidy.getAddress())).to.equal(transferAmount);

            // Try to use addr1 (who doesn't have the transfer role) to move tokens out of the contract
            const expectedRevertMessage = `AccessControl: account ${(await addr1.getAddress()).toLowerCase()} is missing role ${await gasSubsidy.TRANSFER_ROLE()}`;
            await expect(gasSubsidy.connect(addr1).transferTokens(await xai.getAddress(), await addr1.getAddress(), transferAmount)).to.be.revertedWith(expectedRevertMessage);
        });

        it("Check transfer of tokens fails if not enough balance", async function() {
            const {gasSubsidy, gasSubsidyTransferAdmin, xai, xaiMinter, addr1} = await loadFixture(deployInfrastructure);
            const transferAmount = BigInt(1000);
            const excessiveAmount = BigInt(2000);

            // Mint some Xai to the gasSubsidy
            await xai.connect(xaiMinter).mint(await gasSubsidy.getAddress(), transferAmount);
            expect(await xai.balanceOf(await gasSubsidy.getAddress())).to.equal(transferAmount);

            // Try to use the gasSubsidyTransferAdmin to move more tokens than the contract has
            const expectedRevertMessage = "Not enough tokens in contract";
            await expect(gasSubsidy.connect(gasSubsidyTransferAdmin).transferTokens(await xai.getAddress(), await addr1.getAddress(), excessiveAmount)).to.be.revertedWith(expectedRevertMessage);
        });
    }
}