import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

/**
 * @title esXai Tests
 * @dev Implementation of the esXai Tests
 */
export function esXaiTests(deployInfrastructure) {
    return function() {
        it("Check calling the initializer is not allowed afterwards", async function() {
            const {esXai, esXaiMinter, xai} = await loadFixture(deployInfrastructure);
            const expectedRevertMessage = "Initializable: contract is already initialized";
            await expect(esXai.connect(esXaiMinter).initialize(await xai.getAddress(), BigInt(500))).to.be.revertedWith(expectedRevertMessage);
        })

        it("Check esXai can be minted by an address with the minter role", async function() {
            const {esXai, esXaiMinter} = await loadFixture(deployInfrastructure);
            const initialBalance = await esXai.balanceOf(esXaiMinter.address);
            const mintAmount = BigInt(1000);
            await esXai.connect(esXaiMinter).mint(esXaiMinter.address, mintAmount);
            const finalBalance = await esXai.balanceOf(esXaiMinter.address);
            expect(finalBalance).to.equal(initialBalance + mintAmount);
        })

        it("Check esXai can't be minted by someone without the minter role", async function() {
            const {esXai, esXaiDefaultAdmin} = await loadFixture(deployInfrastructure);
            const esXaiMinterRole = await esXai.MINTER_ROLE();
            const mintAmount = BigInt(1000);
            const expectedRevertMessage = `AccessControl: account ${esXaiDefaultAdmin.address.toLowerCase()} is missing role ${esXaiMinterRole}`;
            await expect(esXai.connect(esXaiDefaultAdmin).mint(esXaiDefaultAdmin.address, mintAmount)).to.be.revertedWith(expectedRevertMessage);
        })

        it("Check xai address can be changed", async function() {
            const {esXai, esXaiDefaultAdmin} = await loadFixture(deployInfrastructure);
            const newXaiAddress = "0x0000000000000000000000000000000000000001";
            await esXai.connect(esXaiDefaultAdmin).changeXaiAddress(newXaiAddress);
            const currentXaiAddress = await esXai.xai();
            expect(currentXaiAddress).to.equal(newXaiAddress);
        })

        it("Check esXai can't be transferred unless either the recipient or the from address is in the whitelist", async function() {
            const {esXai, esXaiMinter, esXaiDefaultAdmin, addr1, addr2, addr3} = await loadFixture(deployInfrastructure);
            await esXai.connect(esXaiDefaultAdmin).addToWhitelist(addr2.address);
            expect(await esXai.isWhitelisted(addr2.address)).to.equal(true);
            const transferAmount = BigInt(1000);
            await esXai.connect(esXaiMinter).mint(addr1.address, transferAmount);
            await expect(esXai.connect(addr1).transfer(addr3.address, transferAmount)).to.be.revertedWith("Transfer not allowed: address not in whitelist");
            await esXai.connect(addr1).transfer(addr2.address, transferAmount);
            const finalBalance = await esXai.balanceOf(addr2.address);
            expect(finalBalance).to.equal(transferAmount);
            await esXai.connect(esXaiDefaultAdmin).addToWhitelist(addr1.address);
            expect(await esXai.isWhitelisted(addr1.address)).to.equal(true);
            await esXai.connect(addr2).transfer(addr3.address, transferAmount);
            const finalBalanceAddr3 = await esXai.balanceOf(addr3.address);
            expect(finalBalanceAddr3).to.equal(transferAmount);
            await esXai.connect(esXaiDefaultAdmin).removeFromWhitelist(addr1.address);
            expect(await esXai.isWhitelisted(addr1.address)).to.equal(false);
            await expect(esXai.connect(addr1).transfer(addr3.address, transferAmount)).to.be.revertedWith("Transfer not allowed: address not in whitelist");
        })

        it("Check esXai can't be transferredFrom unless either the recipient or the from address is in the whitelist", async function() {
            const {esXai, esXaiMinter, esXaiDefaultAdmin, addr1, addr2, addr3} = await loadFixture(deployInfrastructure);
            await esXai.connect(esXaiDefaultAdmin).addToWhitelist(addr2.address);
            expect(await esXai.isWhitelisted(addr2.address)).to.equal(true);
            const transferAmount = BigInt(1000);
            await esXai.connect(esXaiMinter).mint(addr1.address, transferAmount);
            await esXai.connect(addr1).approve(esXaiMinter.address, transferAmount);
            await expect(esXai.connect(esXaiMinter).transferFrom(addr1.address, addr3.address, transferAmount)).to.be.revertedWith("Transfer not allowed: address not in whitelist");
            await esXai.connect(esXaiMinter).transferFrom(addr1.address, addr2.address, transferAmount);
            const finalBalance = await esXai.balanceOf(addr2.address);
            expect(finalBalance).to.equal(transferAmount);
            await esXai.connect(esXaiDefaultAdmin).addToWhitelist(addr1.address);
            expect(await esXai.isWhitelisted(addr1.address)).to.equal(true);
            await esXai.connect(addr2).approve(esXaiMinter.address, transferAmount);
            await esXai.connect(esXaiMinter).transferFrom(addr2.address, addr3.address, transferAmount);
            const finalBalanceAddr3 = await esXai.balanceOf(addr3.address);
            expect(finalBalanceAddr3).to.equal(transferAmount);
            await esXai.connect(esXaiDefaultAdmin).removeFromWhitelist(addr1.address);
            expect(await esXai.isWhitelisted(addr1.address)).to.equal(false);
            await esXai.connect(addr1).approve(esXaiMinter.address, transferAmount);
            await expect(esXai.connect(esXaiMinter).transferFrom(addr1.address, addr3.address, transferAmount)).to.be.revertedWith("Transfer not allowed: address not in whitelist");
        })

        it("Check redemption periods can't be claimed before time is complete", async function() {
            const {esXai, esXaiMinter, esXaiDefaultAdmin} = await loadFixture(deployInfrastructure);
            await esXai.connect(esXaiDefaultAdmin).changeRedemptionStatus(true);
            const redemptionAmount = BigInt(1000);
            await esXai.connect(esXaiMinter).mint(esXaiMinter.address, redemptionAmount * BigInt(3));
            const durations = [15 * 24 * 60 * 60, 90 * 24 * 60 * 60, 180 * 24 * 60 * 60]; // 15 days, 90 days, 180 days in seconds
            for (const duration of durations) {
                await esXai.connect(esXaiMinter).startRedemption(redemptionAmount, duration);
                const redemptionRequest = await esXai.getRedemptionRequest(esXaiMinter.address, 0);
                expect(redemptionRequest.completed).to.equal(false);
                await expect(esXai.connect(esXaiMinter).completeRedemption(0)).to.be.revertedWith("Redemption period not yet over");
            }
        })

        it("Check redemption request can be retrieved after creation", async function() {
            const {esXai, esXaiMinter, addr1, esXaiDefaultAdmin} = await loadFixture(deployInfrastructure);
            await esXai.connect(esXaiDefaultAdmin).changeRedemptionStatus(true);
            const redemptionAmount = BigInt(1000);
            await esXai.connect(esXaiMinter).mint(addr1.address, redemptionAmount);
            const duration = 15 * 24 * 60 * 60; // 15 days in seconds
            await esXai.connect(addr1).startRedemption(redemptionAmount, duration);
            const redemptionRequest = await esXai.getRedemptionRequest(addr1.address, 0);
            expect(redemptionRequest.amount).to.equal(redemptionAmount);
            expect(redemptionRequest.duration).to.equal(duration);
            expect(redemptionRequest.completed).to.equal(false);
        })

        it("Check redemption can be cancelled and esXai returned, and cannot be cancelled or completed a second time", async function() {
            const {esXai, esXaiMinter, addr1, esXaiDefaultAdmin} = await loadFixture(deployInfrastructure);
            await esXai.connect(esXaiDefaultAdmin).changeRedemptionStatus(true);
            const redemptionAmount = BigInt(1000);
            await esXai.connect(esXaiMinter).mint(addr1.address, redemptionAmount);
            const duration = 15 * 24 * 60 * 60; // 15 days in seconds
            await esXai.connect(addr1).startRedemption(redemptionAmount, duration);
            const initialBalance = await esXai.balanceOf(addr1.address);
            await esXai.connect(addr1).cancelRedemption(0);
            const finalBalance = await esXai.balanceOf(addr1.address);
            expect(finalBalance).to.equal(initialBalance + redemptionAmount);
            await expect(esXai.connect(addr1).cancelRedemption(0)).to.be.revertedWith("Redemption already completed");
            await expect(esXai.connect(addr1).completeRedemption(0)).to.be.revertedWith("Redemption already completed");
        })

        it("Check redemption can be completed and correct amount of xai is received, and total supply of esXai decreases", async function() {
            const {esXai, xai, esXaiMinter, addr1, esXaiDefaultAdmin} = await loadFixture(deployInfrastructure);
            await esXai.connect(esXaiDefaultAdmin).changeRedemptionStatus(true);
            const redemptionAmount = BigInt(1000);
            await esXai.connect(esXaiMinter).mint(addr1.address, redemptionAmount * BigInt(3));

            const foundationAddr = await esXai.esXaiBurnFoundationRecipient();
            const foundationBasePoints = await esXai.esXaiBurnFoundationBasePoints();
            const durations = [
                15 * 24 * 60 * 60,  // 15 days
                90 * 24 * 60 * 60,  // 90 days
                180 * 24 * 60 * 60  // 180 days
            ];
            const ratios = [250, 625, 1000]; // corresponding ratios for 15 days, 90 days, 180 days
            for (let i = 0; i < durations.length; i++) {
                const initialXaiBalance = await xai.balanceOf(addr1.address);
                const initialFoundationBalance = await xai.balanceOf(foundationAddr);
                const duration = durations[i];
                const ratio = ratios[i];
                await esXai.connect(addr1).startRedemption(redemptionAmount, duration);
                const initialEsXaiSupply = await esXai.totalSupply();
                await network.provider.send("evm_increaseTime", [duration]);
                await network.provider.send("evm_mine");
                await esXai.connect(addr1).completeRedemption(i);
                const finalEsXaiSupply = await esXai.totalSupply();
                expect(finalEsXaiSupply).to.equal(initialEsXaiSupply - redemptionAmount);
                const xaiBalance = await xai.balanceOf(addr1.address);
                expect(xaiBalance).to.equal(initialXaiBalance + (redemptionAmount * BigInt(ratio) / BigInt(1000)));

                // check that foundation receives correct split
                const foundationAmount = (redemptionAmount - (redemptionAmount * BigInt(ratio) / BigInt(1000))) * foundationBasePoints / BigInt(1000);
                const finalFoundationBalance = await xai.balanceOf(foundationAddr);
                expect(finalFoundationBalance).to.equal(initialFoundationBalance + foundationAmount);
            }
            // await xai.connect(addr1).burn((await xai.balanceOf(addr1.address))); // burn the xai for the next iteration

            const redemptionRequestCount = await esXai.getRedemptionRequestCount(addr1.address);
            expect(redemptionRequestCount).to.equal(3);

        })

        it("Check whitelist addresses are added and retrieved correctly", async function() {
            const {esXai, addr1, addr2, addr3, esXaiDefaultAdmin} = await loadFixture(deployInfrastructure);
            await esXai.connect(esXaiDefaultAdmin).addToWhitelist(addr1.address);
            await esXai.connect(esXaiDefaultAdmin).addToWhitelist(addr2.address);
            await esXai.connect(esXaiDefaultAdmin).addToWhitelist(addr3.address);
            const whitelistCount = await esXai.getWhitelistCount();
            expect(whitelistCount).to.equal(4);
            const whitelistedAddress1 = await esXai.getWhitelistedAddressAtIndex(1);
            const whitelistedAddress2 = await esXai.getWhitelistedAddressAtIndex(2);
            const whitelistedAddress3 = await esXai.getWhitelistedAddressAtIndex(3);
            expect(whitelistedAddress1).to.equal(addr1.address);
            expect(whitelistedAddress2).to.equal(addr2.address);
            expect(whitelistedAddress3).to.equal(addr3.address);
        })

    }
}
