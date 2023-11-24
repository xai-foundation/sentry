import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

/**
 * @title Upgradeability Tests
 * @dev Test the upgradeability of the contracts
 */
export function UpgradeabilityTests(deployInfrastructure) {
    return function() {

        describe("Check the contracts can be upgraded properly", async function() {

            it("Check the esXai contract can be upgraded", async function() {
                const { esXai } = await loadFixture(deployInfrastructure);
                const esXaiAddress = await esXai.getAddress();

                // Upgrade the contract
                const esXaiUpgradeTest = await ethers.getContractFactory("esXaiUpgradeTest");
                const esXaiUpgradeTestInstance = await upgrades.upgradeProxy(esXaiAddress, esXaiUpgradeTest);

                // Expect the address after to be the same
                expect(await esXaiUpgradeTestInstance.getAddress()).to.equal(esXaiAddress);

                // Check the contract has been upgraded
                expect(await esXaiUpgradeTestInstance.getCount()).to.equal(0);

                // Increment the count
                await esXaiUpgradeTestInstance.increment();

                // Check the count has been incremented
                expect(await esXaiUpgradeTestInstance.getCount()).to.equal(1);
            });

            it("Check the Xai contract can be upgraded", async function() {
                const { xai } = await loadFixture(deployInfrastructure);
                const xaiAddress = await xai.getAddress();

                // Upgrade the contract
                const xaiUpgradeTest = await ethers.getContractFactory("XaiUpgradeTest");
                const xaiUpgradeTestInstance = await upgrades.upgradeProxy(xaiAddress, xaiUpgradeTest);

                // Expect the address after to be the same
                expect(await xaiUpgradeTestInstance.getAddress()).to.equal(xaiAddress);

                // Check the contract has been upgraded
                expect(await xaiUpgradeTestInstance.getCount()).to.equal(0);

                // Increment the count
                await xaiUpgradeTestInstance.increment();

                // Check the count has been incremented
                expect(await xaiUpgradeTestInstance.getCount()).to.equal(1);
            });

            it("Check the NodeLicense contract can be upgraded", async function() {
                const { nodeLicense } = await loadFixture(deployInfrastructure);
                const nodeLicenseAddress = await nodeLicense.getAddress();

                // Upgrade the contract
                const nodeLicenseUpgradeTest = await ethers.getContractFactory("NodeLicenseUpgradeTest");
                const nodeLicenseUpgradeTestInstance = await upgrades.upgradeProxy(nodeLicenseAddress, nodeLicenseUpgradeTest);

                // Expect the address after to be the same
                expect(await nodeLicenseUpgradeTestInstance.getAddress()).to.equal(nodeLicenseAddress);

                // Check the contract has been upgraded
                expect(await nodeLicenseUpgradeTestInstance.getCount()).to.equal(0);

                // Increment the count
                await nodeLicenseUpgradeTestInstance.increment();

                // Check the count has been incremented
                expect(await nodeLicenseUpgradeTestInstance.getCount()).to.equal(1);
            });

            it("Check the GasSubsidy contract can be upgraded", async function() {
                const { gasSubsidy } = await loadFixture(deployInfrastructure);
                const gasSubsidyAddress = await gasSubsidy.getAddress();

                // Upgrade the contract
                const gasSubsidyUpgradeTest = await ethers.getContractFactory("GasSubsidyUpgradeTest");
                const gasSubsidyUpgradeTestInstance = await upgrades.upgradeProxy(gasSubsidyAddress, gasSubsidyUpgradeTest);

                // Expect the address after to be the same
                expect(await gasSubsidyUpgradeTestInstance.getAddress()).to.equal(gasSubsidyAddress);

                // Check the contract has been upgraded
                expect(await gasSubsidyUpgradeTestInstance.getCount()).to.equal(0);

                // Increment the count
                await gasSubsidyUpgradeTestInstance.increment();

                // Check the count has been incremented
                expect(await gasSubsidyUpgradeTestInstance.getCount()).to.equal(1);
            });

            it("Check the Referee contract can be upgraded", async function() {
                const { referee } = await loadFixture(deployInfrastructure);
                const refereeAddress = await referee.getAddress();

                // Upgrade the contract
                const refereeUpgradeTest = await ethers.getContractFactory("RefereeUpgradeTest");
                const refereeUpgradeTestInstance = await upgrades.upgradeProxy(refereeAddress, refereeUpgradeTest);

                // Expect the address after to be the same
                expect(await refereeUpgradeTestInstance.getAddress()).to.equal(refereeAddress);

                // Check the contract has been upgraded
                expect(await refereeUpgradeTestInstance.getCount()).to.equal(0);

                // Increment the count
                await refereeUpgradeTestInstance.increment();

                // Check the count has been incremented
                expect(await refereeUpgradeTestInstance.getCount()).to.equal(1);
            });
        });
    }
}