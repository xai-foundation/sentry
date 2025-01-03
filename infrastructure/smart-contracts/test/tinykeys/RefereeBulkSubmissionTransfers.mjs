import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import {submitTestChallenge} from "../utils/submitTestChallenge.mjs";
import {mintBatchedLicenses, mintSingleLicense} from "../utils/mintLicenses.mjs";


function BulkSubmissionTransfers(deployInfrastructure) {

    return function () {

        it("Check V1 stake and unstake changing tiers, the winning key count changes.", async function () {
            const { nodeLicense, addr4: owner, referee, challenger } = await loadFixture(deployInfrastructure);
    
            const expectedStakeBalance = ethers.parseEther("10000000");
            const keyBalance = await nodeLicense.balanceOf(owner.address);
    
            // Stake V1 esXai to reach tier 3
            const stakeAfter = await referee.stakedAmounts(owner.address);
            expect(stakeAfter).to.equal(expectedStakeBalance);
    
            // Submit a challenge
            const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);
            const submissionBefore = await referee.bulkSubmissions(0, owner.address);
            const isSubmittedBeforeAssertion = submissionBefore[0];
            const claimedBeforeAssertion = submissionBefore[1];
            const keyCountBeforeAssertion = submissionBefore[2];
            expect(isSubmittedBeforeAssertion).to.equal(false);
            expect(claimedBeforeAssertion).to.equal(false);
            expect(keyCountBeforeAssertion).to.equal(0);
    
            // Submit Bulk Assertion
            await referee.connect(owner).submitBulkAssertion(owner.address, 0, stateRoot);
    
            // Confirm Bulk Submission Data
            const submissionAfterAssertion = await referee.bulkSubmissions(0, owner.address);
            const isSubmittedAfterAssertion = submissionAfterAssertion[0];
            const claimedAfterAssertion = submissionAfterAssertion[1];
            const keyCountAfterAssertion = submissionAfterAssertion[2];
            const winningKeyCountAfterAssertion = submissionAfterAssertion[3];
            expect(isSubmittedAfterAssertion).to.equal(true);
            expect(claimedAfterAssertion).to.equal(false);
            expect(keyCountAfterAssertion).to.equal(keyBalance);
            expect(winningKeyCountAfterAssertion).to.gt(0n);
    
            // Unstake V1 esXai to reach tier 2
            await referee.connect(owner).unstake(expectedStakeBalance);
    
            const submissionAfterUnstake = await referee.bulkSubmissions(0, owner.address);
            const isSubmittedAfterUnstake = submissionAfterUnstake[0];
            const claimedAfterUnstake = submissionAfterUnstake[1];
            const keyCountAfterUnstake = submissionAfterUnstake[2];
            const winningKeyCountAfterUnstake = submissionAfterUnstake[3];
            expect(isSubmittedAfterUnstake).to.equal(true);
            expect(claimedAfterUnstake).to.equal(false);
            expect(keyCountAfterUnstake).to.equal(keyBalance);
            expect(winningKeyCountAfterUnstake).to.lt(winningKeyCountAfterAssertion);    
        });

        it("Check on NodeLicense Transfer, the winning key count changes.", async function () {
            const { nodeLicense, addr4: owner, referee, challenger, nodeLicenseDefaultAdmin, addr2 } = await loadFixture(deployInfrastructure);
            
            const keyBalance = await nodeLicense.balanceOf(owner.address);
    
            // Submit a challenge
            const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);
            const submissionBeforeAssertion = await referee.bulkSubmissions(0, owner.address);
            const isSubmittedBeforeAssertion = submissionBeforeAssertion[0];
            const claimedBeforeAssertion = submissionBeforeAssertion[1];
            const keyCountBeforeAssertion = submissionBeforeAssertion[2];
            const winningKeyCountBeforeAssertion = submissionBeforeAssertion[3];
            expect(isSubmittedBeforeAssertion).to.equal(false);
            expect(claimedBeforeAssertion).to.equal(false);
            expect(keyCountBeforeAssertion).to.equal(0);
            expect(winningKeyCountBeforeAssertion).to.equal(0);
    
            // Submit Bulk Assertion
            await referee.connect(owner).submitBulkAssertion(owner.address, 0, stateRoot);
    
            // Confirm Bulk Submission Data
            const submissionAfterAssertion = await referee.bulkSubmissions(0, owner.address);
            const isSubmittedAfterAssertion = submissionAfterAssertion[0];
            const claimedAfterAssertion = submissionAfterAssertion[1];
            const keyCountAfterAssertion = submissionAfterAssertion[2];
            const winningKeyCountAfterAssertion = submissionAfterAssertion[3];
            expect(isSubmittedAfterAssertion).to.equal(true);
            expect(claimedAfterAssertion).to.equal(false);
            expect(keyCountAfterAssertion).to.equal(keyBalance);
            expect(winningKeyCountAfterAssertion).to.gt(0n);            

            const randomBytes = ethers.randomBytes(32);
            let count = 1;
            let keysToUnstake = [];
            while(count < 200) {
                keysToUnstake.push(BigInt(count));                
                count++;
            }

            const transferRole = await nodeLicense.TRANSFER_ROLE();
            // Grant the transfer role to the owner address
            await nodeLicense.connect(nodeLicenseDefaultAdmin).grantRole(transferRole, owner.address);
            await nodeLicense.connect(owner).adminTransferBatch(owner.address, addr2.address, keysToUnstake, randomBytes);

            // Confirm Bulk Submitted Key Count decreased by keys to unstake length    
            const submissionAfterTransfer = await referee.bulkSubmissions(0, owner.address);
            const isSubmittedAfterTransfer = submissionAfterTransfer[0];
            const claimedAfterTransfer = submissionAfterTransfer[1];
            const keyCountAfterTransfer = submissionAfterTransfer[2];
            const winningKeyCountAfterTransfer = submissionAfterTransfer[3];
            expect(isSubmittedAfterTransfer).to.equal(true);
            expect(claimedAfterTransfer).to.equal(false);
            expect(keyCountAfterTransfer).to.equal(keyCountAfterAssertion - BigInt(keysToUnstake.length));
            expect(winningKeyCountAfterTransfer).to.lt(winningKeyCountAfterAssertion);

        }).timeout(60000);
    }
}

export function RefereeBulkSubmissionTransfers(deployInfrastructure) {
	return function () {
        describe("Check bulk submission rewards update on transfers", BulkSubmissionTransfers(deployInfrastructure).bind(this));
	}
}
