import {expect} from "chai";
import {loadFixture} from "@nomicfoundation/hardhat-network-helpers";
import {submitTestChallenge} from "../utils/submitTestChallenge.mjs";

export function RefereeCloseChallengeTests(deployInfrastructure) {

	return function () {
		it("Check that a challenge can be closed with the closeCurrentChallenge function and the next challenge can be submitted.", async function () {
			const {referee, challenger, refereeDefaultAdmin} = await loadFixture(deployInfrastructure);

			const challengeCounter = await referee.challengeCounter();		
			
			const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);			// Submit First challenge
			
			const challenge = await referee.getChallenge(challengeCounter);
			expect(challenge.openForSubmissions).to.be.eq(true);									// Confirm the challenge exists and is open

			const fiftyFiveMinutes = 60 * 55;
            await network.provider.send("evm_increaseTime", [fiftyFiveMinutes]);
            await network.provider.send("evm_mine");          

			await referee.connect(refereeDefaultAdmin).closeCurrentChallenge();						// Close the challenge

			const challengeAfterClose = await referee.getChallenge(challengeCounter);
			expect(challengeAfterClose.openForSubmissions).to.be.eq(false);							// Confirm the challenge is closed
			
			const nextAssertion = startingAssertion + 1;
			await submitTestChallenge(referee, challenger, nextAssertion, stateRoot);				// Submit a new challenge
			const newChallenge = await referee.getChallenge(challengeCounter + 1n);
			
			expect(newChallenge.openForSubmissions).to.be.eq(true);									// Confirm the new challenge exists and is open
		});
		it("Check that a challenge cannot be closed before 50 minutes have passed.", async function () {
			const {referee, challenger, refereeDefaultAdmin} = await loadFixture(deployInfrastructure);

			const challengeCounter = await referee.challengeCounter();		
			
			const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);			// Submit First challenge
			
			const challenge = await referee.getChallenge(challengeCounter);
			expect(challenge.openForSubmissions).to.be.eq(true);									// Confirm the challenge exists and is open

			const thirtyMinutes = 60 * 30;
            await network.provider.send("evm_increaseTime", [thirtyMinutes]);
            await network.provider.send("evm_mine");          

			await expect(referee.connect(refereeDefaultAdmin).closeCurrentChallenge()).to.be.revertedWith("59");						
		});

		it("Check that trying to close a challenge without default admin role will fail.", async function () {
			const {referee, challenger, operator} = await loadFixture(deployInfrastructure);

			const challengeCounter = await referee.challengeCounter();
			
			const stateRoot = "0x0000000000000000000000000000000000000000000000000000000000000000";            
            const startingAssertion = 100;
            await submitTestChallenge(referee, challenger, startingAssertion, stateRoot);  			// Submit First challenge
			
			const challenge = await referee.getChallenge(challengeCounter);
			expect(challenge.openForSubmissions).to.be.eq(true);									// Confirm the challenge exists and is open

			const defaultAdminRole = "0x0000000000000000000000000000000000000000000000000000000000000000";

			// Confirm that closing the challenge without the default admin role will revert
			await expect(referee.connect(operator).closeCurrentChallenge()).to.be.revertedWith(`AccessControl: account ${operator.address.toLowerCase()} is missing role ${defaultAdminRole}`);
			
		});
    };
}