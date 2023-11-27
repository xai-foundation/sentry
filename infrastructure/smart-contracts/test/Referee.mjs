import { expect, assert } from "chai";

export function RefereeTests(deployInfrastructure) {
    return function() {

        it("Check to make sure the setChallengerPublicKey actually saves the value and only callable as an admin", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin, challenger} = await deployInfrastructure();
            const newPublicKey = "0x1234567890abcdef";
            await referee.connect(refereeDefaultAdmin).setChallengerPublicKey(newPublicKey);
            const savedPublicKey = await referee.challengerPublicKey();
            assert.equal(savedPublicKey, newPublicKey, "The saved public key does not match the new public key");
            const expectedRevertMessageAdmin = `AccessControl: account ${kycAdmin.address.toLowerCase()} is missing role ${await referee.DEFAULT_ADMIN_ROLE()}`;
            await expect(referee.connect(kycAdmin).setChallengerPublicKey(newPublicKey)).to.be.revertedWith(expectedRevertMessageAdmin);
            const expectedRevertMessageChallenger = `AccessControl: account ${challenger.address.toLowerCase()} is missing role ${await referee.DEFAULT_ADMIN_ROLE()}`;
            await expect(referee.connect(challenger).setChallengerPublicKey(newPublicKey)).to.be.revertedWith(expectedRevertMessageChallenger);
        })

        it("Check isApprovedForOperator function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await deployInfrastructure();
            await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
            const isApproved = await referee.isApprovedForOperator(refereeDefaultAdmin.address, kycAdmin.address);
            assert.equal(isApproved, true, "The operator is not approved");
        })

        it("Check setApprovalForOperator function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await deployInfrastructure();
            await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
            const isApproved = await referee.isApprovedForOperator(refereeDefaultAdmin.address, kycAdmin.address);
            assert.equal(isApproved, true, "The operator is not approved");
        })

        it("Check getOperatorAtIndex function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await deployInfrastructure();
            await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
            const operator = await referee.getOperatorAtIndex(refereeDefaultAdmin.address, 0);
            assert.equal(operator, kycAdmin.address, "The operator at index does not match");
        })

        it("Check getOperatorCount function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await deployInfrastructure();
            await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
            const count = await referee.getOperatorCount(refereeDefaultAdmin.address);
            assert.equal(count, BigInt(1), "The operator count does not match");
        })

        it("Check getOwnerForOperatorAtIndex function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await deployInfrastructure();
            await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
            const owner = await referee.getOwnerForOperatorAtIndex(kycAdmin.address, 0);
            assert.equal(owner, refereeDefaultAdmin.address, "The owner at index does not match");
        })

        it("Check getOwnerCountForOperator function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await deployInfrastructure();
            await referee.connect(refereeDefaultAdmin).setApprovalForOperator(kycAdmin.address, true);
            const count = await referee.getOwnerCountForOperator(kycAdmin.address);
            assert.equal(count, BigInt(1), "The owner count does not match");
        })

        it("Check addKycWallet function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await deployInfrastructure();
            await referee.connect(kycAdmin).addKycWallet(kycAdmin.address);
            const isApproved = await referee.isKycApproved(kycAdmin.address);
            assert.equal(isApproved, true, "The wallet is not KYC approved");
        })

        it("Check removeKycWallet function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await deployInfrastructure();
            await referee.connect(kycAdmin).addKycWallet(kycAdmin.address);
            await referee.connect(kycAdmin).removeKycWallet(kycAdmin.address);
            const isApproved = await referee.isKycApproved(kycAdmin.address);
            assert.equal(isApproved, false, "The wallet is still KYC approved");
        })

        it("Check isKycApproved function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await deployInfrastructure();
            await referee.connect(kycAdmin).addKycWallet(kycAdmin.address);
            const isApproved = await referee.isKycApproved(kycAdmin.address);
            assert.equal(isApproved, true, "The wallet is not KYC approved");
        })

        it("Check getKycWalletAtIndex function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await deployInfrastructure();
            await referee.connect(kycAdmin).addKycWallet(kycAdmin.address);
            const count = await referee.getKycWalletCount();
            const wallet = await referee.getKycWalletAtIndex(count - BigInt(1));
            assert.equal(wallet, kycAdmin.address, "The wallet at index does not match");
        })

        it("Check getKycWalletCount function", async function() {
            const {referee, refereeDefaultAdmin, kycAdmin} = await deployInfrastructure();
            const initialCount = await referee.getKycWalletCount();
            await referee.connect(kycAdmin).addKycWallet(kycAdmin.address);
            const finalCount = await referee.getKycWalletCount();
            assert.equal(finalCount, BigInt(initialCount + BigInt(1)), "The KYC wallet count does not match");
        })


    }
}