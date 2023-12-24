import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { signERC2612Permit } from "../utils/signERC2612Permit.mjs";

/**
 * @title XaiGaslessClaim Tests
 * @dev Implementation of the XaiGaslessClaim Tests
 */
export function XaiGaslessClaimTests(deployInfrastructure) {
    return function() {
        let xaiGaslessClaim;
        let xai;
        let nodeLicense;
        let referee;
        let owner;
        let addr1;
        let addr2;
        let addr3;
        let kycAdmin;
        let minter;
        let chainId;
        const claimContractName = "XaiGaslessClaim";
        const claimAmount = BigInt(1000);

        beforeEach(async function() {
            const fixture = await loadFixture(deployInfrastructure);
            const XaiGaslessClaim = await ethers.getContractFactory("XaiGaslessClaim");
            [owner, addr1, addr2, addr3] = await ethers.getSigners();
            minter = fixture.xaiMinter;
            xai = fixture.xai;
            nodeLicense = fixture.nodeLicense;
            referee = fixture.referee;
            kycAdmin = fixture.kycAdmin;
            

            chainId = (await owner.provider.getNetwork()).chainId;

            const startTime = await ethers.provider.getBlock('latest').then(block => block.timestamp);
            const endTime = startTime + 3600; // 1 hour later

            xaiGaslessClaim = await upgrades.deployProxy(XaiGaslessClaim, [await owner.getAddress(), await fixture.xai.getAddress(), await addr1.getAddress(), startTime, endTime, await fixture.nodeLicense.getAddress(), await fixture.referee.getAddress()], { initializer: 'initialize' });
            await xaiGaslessClaim.waitForDeployment();

            // Mint Xai to addr1
            await fixture.xai.connect(minter).mint(addr1.address, BigInt("100000000000000000000"));

            await xai.connect(addr1).approve(await xaiGaslessClaim.getAddress(), BigInt("100000000000"));
        });

        it("Should initialize the contract correctly", async function() {
            expect(await xaiGaslessClaim.permitAdmin()).to.equal(await owner.getAddress());
        });

        it("Should allow a user to claim their rewards", async function() {
        

            // Check initial balance of addr2
            let initialBalance = await xai.balanceOf(addr2.address);

            const signature = await signERC2612Permit(
                await xaiGaslessClaim.getAddress(),
                Number(chainId),
                await addr2.getAddress(),
                claimAmount,
                process.env.MNEMONIC,
                0,
                owner,
                0,
                claimContractName
            );

            await xaiGaslessClaim.connect(addr2).claimRewards(
                claimAmount,
                signature.v,
                signature.r,
                signature.s,
            );

            // Check final balance of addr1
            let finalBalance = await xai.balanceOf(addr2.address);
            expect(finalBalance).to.equal(initialBalance + claimAmount);
        });

        it("Should not allow a user to claim a signature that was meant for someone else", async function() {
            const signature = await signERC2612Permit(
                await xaiGaslessClaim.getAddress(),
                Number(chainId),
                await addr3.getAddress(),
                claimAmount,
                process.env.MNEMONIC,
                0,
                owner,
                0,
                claimContractName
            );

            // Check initial balance of addr2
            let initialBalance = await xai.balanceOf(addr2.address);

            await expect(
                xaiGaslessClaim.connect(addr2).claimRewards(
                    claimAmount,
                    signature.v,
                    signature.r,
                    signature.s,
                )
            ).to.be.revertedWith("Invalid auth");

            // Check final balance of addr2
            let finalBalance = await xai.balanceOf(addr2.address);
            expect(finalBalance).to.equal(initialBalance);
        });
        
        it("Should not allow a user to claim a different amount than the permit", async function() {
            const signature = await signERC2612Permit(
                await xaiGaslessClaim.getAddress(),
                Number(chainId),
                await addr2.getAddress(),
                claimAmount,
                process.env.MNEMONIC,
                0,
                owner,
                0,
                claimContractName
            );

            // Check initial balance of addr2
            let initialBalance = await xai.balanceOf(addr2.address);

            await expect(
                xaiGaslessClaim.connect(addr2).claimRewards(
                    claimAmount + BigInt(1),
                    signature.v,
                    signature.r,
                    signature.s,
                )
            ).to.be.revertedWith("Invalid auth");

            // Check final balance of addr2
            let finalBalance = await xai.balanceOf(addr2.address);
            expect(finalBalance).to.equal(initialBalance);
        });

        it("Should not allow a user to submit the same signature twice", async function() {
            const signature = await signERC2612Permit(
                await xaiGaslessClaim.getAddress(),
                Number(chainId),
                await addr2.getAddress(),
                claimAmount,
                process.env.MNEMONIC,
                0,
                owner,
                0,
                claimContractName
            );

            // Check initial balance of addr2
            let initialBalance = await xai.balanceOf(addr2.address);

            // Submit the claim once
            await xaiGaslessClaim.connect(addr2).claimRewards(
                claimAmount,
                signature.v,
                signature.r,
                signature.s,
            );

            // Check final balance of addr2
            let finalBalance = await xai.balanceOf(addr2.address);
            expect(finalBalance).to.not.equal(initialBalance);

            // Attempt to submit the same claim again
            await expect(
                xaiGaslessClaim.connect(addr2).claimRewards(
                    claimAmount,
                    signature.v,
                    signature.r,
                    signature.s,
                )
            ).to.be.revertedWith("Invalid auth");
        });

        it("Should not allow a user to submit two signatures, even if both signatures are for them", async function() {
            const signature1 = await signERC2612Permit(
                await xaiGaslessClaim.getAddress(),
                Number(chainId),
                await addr2.getAddress(),
                claimAmount,
                process.env.MNEMONIC,
                0,
                owner,
                0,
                claimContractName
            );

            const signature2 = await signERC2612Permit(
                await xaiGaslessClaim.getAddress(),
                Number(chainId),
                await addr2.getAddress(),
                claimAmount,
                process.env.MNEMONIC,
                0,
                owner,
                0,
                claimContractName
            );

            // Check initial balance of addr2
            let initialBalance = await xai.balanceOf(addr2.address);

            // Submit the first claim
            await xaiGaslessClaim.connect(addr2).claimRewards(
                claimAmount,
                signature1.v,
                signature1.r,
                signature1.s,
            );

            // Check final balance of addr2
            let finalBalance = await xai.balanceOf(addr2.address);
            expect(finalBalance).to.not.equal(initialBalance);

            // Attempt to submit the second claim
            await expect(
                xaiGaslessClaim.connect(addr2).claimRewards(
                    claimAmount,
                    signature2.v,
                    signature2.r,
                    signature2.s,
                )
            ).to.be.revertedWith("Invalid auth");
        });


        it("Should not allow a user to claim a signature that was not made by the owner", async function() {
            const signature = await signERC2612Permit(
                await xaiGaslessClaim.getAddress(),
                Number(chainId),
                await addr2.getAddress(),
                claimAmount,
                process.env.MNEMONIC,
                3,
                addr3, // Not the owner
                0,
                claimContractName
            );

            // Check initial balance of addr2
            let initialBalance = await xai.balanceOf(addr2.address);

            // Attempt to submit the claim
            await expect(
                xaiGaslessClaim.connect(addr2).claimRewards(
                    claimAmount,
                    signature.v,
                    signature.r,
                    signature.s,
                )
            ).to.be.revertedWith("Invalid auth");

            // Check final balance of addr2
            let finalBalance = await xai.balanceOf(addr2.address);
            expect(finalBalance).to.equal(initialBalance);
        });

        it("Should not allow a user to claim more than the allowance", async function() {
            // Get the allowance
            const allowance = await xai.allowance(await addr1.getAddress(), await xaiGaslessClaim.getAddress());

            const signature = await signERC2612Permit(
                await xaiGaslessClaim.getAddress(),
                Number(chainId),
                await addr1.getAddress(), 
                allowance + BigInt(1), // Claiming more than the allowance
                process.env.MNEMONIC,
                0,
                owner,
                0,
                claimContractName
            );

            // Check initial balance of addr1
            let initialBalance = await xai.balanceOf(await addr1.getAddress());

            // Attempt to submit the claim
            await expect(
                xaiGaslessClaim.connect(addr1).claimRewards( // Claiming as owner
                    allowance + BigInt(1), // Claiming more than the allowance
                    signature.v,
                    signature.r,
                    signature.s,
                )
            ).to.be.revertedWith("Insufficient allowance");

            // Check final balance of addr1
            let finalBalance = await xai.balanceOf(addr1.address);
            expect(finalBalance).to.equal(initialBalance);
        });

        it("Should not allow a user to claim rewards before the start time", async function() {
            // Set the start time to a future time
            const futureStartTime = (await ethers.provider.getBlock('latest')).timestamp + 3600; // 1 hour later
            const futureEndTime = futureStartTime + 3600; // 2 hours later
            await xaiGaslessClaim.setClaimPeriod(futureStartTime, futureEndTime);

            const signature = await signERC2612Permit(
                await xaiGaslessClaim.getAddress(),
                Number(chainId),
                await addr1.getAddress(), 
                claimAmount,
                process.env.MNEMONIC,
                0,
                owner,
                0,
                claimContractName
            );

            // Attempt to submit the claim
            await expect(
                xaiGaslessClaim.connect(addr1).claimRewards(
                    claimAmount,
                    signature.v,
                    signature.r,
                    signature.s,
                )
            ).to.be.revertedWith("Claim period is not active");
        });

        it("Should not allow a user to claim rewards after the end time", async function() {
            // Set the end time to a past time
            const pastEndTime = (await ethers.provider.getBlock('latest')).timestamp - 3600; // 1 hour ago
            await xaiGaslessClaim.setClaimPeriod(0, pastEndTime);

            const signature = await signERC2612Permit(
                await xaiGaslessClaim.getAddress(),
                Number(chainId),
                await addr1.getAddress(), 
                claimAmount,
                process.env.MNEMONIC,
                0,
                owner,
                0,
                claimContractName
            );

            // Attempt to submit the claim
            await expect(
                xaiGaslessClaim.connect(addr1).claimRewards(
                    claimAmount,
                    signature.v,
                    signature.r,
                    signature.s,
                )
            ).to.be.revertedWith("Claim period is not active");
        });

        it("Should only allow the admin to set the start and end time", async function() {
            const newStartTime = (await ethers.provider.getBlock('latest')).timestamp + 3600; // 1 hour later
            const newEndTime = newStartTime + 3600; // 2 hours later

            // Attempt to set the claim period by a non-admin user
            await expect(
                xaiGaslessClaim.connect(addr1).setClaimPeriod(newStartTime, newEndTime)
            ).to.be.revertedWith("AccessControl: account " + (await addr1.getAddress()).toLowerCase() + " is missing role 0x0000000000000000000000000000000000000000000000000000000000000000");

            // Set the claim period by an admin user
            await xaiGaslessClaim.connect(owner).setClaimPeriod(newStartTime, newEndTime);

            // Verify the new start and end time
            expect(await xaiGaslessClaim.startTime()).to.equal(newStartTime);
            expect(await xaiGaslessClaim.endTime()).to.equal(newEndTime);
        });

        it("Should validate the claim amount correctly", async function() {
            const signature = await signERC2612Permit(
                await xaiGaslessClaim.getAddress(),
                Number(chainId),
                await addr1.getAddress(),
                claimAmount,
                process.env.MNEMONIC,
                0,
                owner,
                0,
                claimContractName
            );

            // Validate the claim amount
            const recoveredAddress = await xaiGaslessClaim.validateClaimAmount(
                claimAmount,
                await addr1.getAddress(),
                signature.v,
                signature.r,
                signature.s,
            );

            // Check if the recovered address matches the permit admin address
            expect(recoveredAddress).to.equal(await xaiGaslessClaim.permitAdmin());
        });

        it("Should not allow a non-KYC'd user who owns a NodeLicense to claim", async function() {
            // Mint a NodeLicense for addr1
            let price = await nodeLicense.price(1, "");
            await nodeLicense.connect(addr1).mint(1, "", {value: price});

            // Ensure addr1 is not KYC'd
            expect(await referee.isKycApproved(addr1.getAddress())).to.be.false;

            const signature = await signERC2612Permit(
                await xaiGaslessClaim.getAddress(),
                Number(chainId),
                await addr1.getAddress(),
                claimAmount,
                process.env.MNEMONIC,
                0,
                owner,
                0,
                claimContractName
            );

            // Attempt to submit the claim
            await expect(
                xaiGaslessClaim.connect(addr1).claimRewards(
                    claimAmount,
                    signature.v,
                    signature.r,
                    signature.s,
                )
            ).to.be.revertedWith("User is not KYC'd");
        });

        it("Should allow a KYC'd user who owns a NodeLicense to claim", async function() {
            // Mint a NodeLicense for addr1
            let price = await nodeLicense.price(1, "");
            await nodeLicense.connect(addr1).mint(1, "", {value: price});

            // Ensure addr1 is KYC'd
            await referee.connect(kycAdmin).addKycWallet(await addr1.getAddress());
            expect(await referee.isKycApproved(addr1.getAddress())).to.be.true;

            const signature = await signERC2612Permit(
                await xaiGaslessClaim.getAddress(),
                Number(chainId),
                await addr1.getAddress(),
                claimAmount,
                process.env.MNEMONIC,
                0,
                owner,
                0,
                claimContractName
            );

            // Attempt to submit the claim
            await expect(
                xaiGaslessClaim.connect(addr1).claimRewards(
                    claimAmount,
                    signature.v,
                    signature.r,
                    signature.s,
                )
            ).to.not.be.reverted;
        });

    };
}
