import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import {getWinningKeyCountLocal} from "../utils/getWinningKeyCountLocal.mjs";
import fs from "fs";


function RunWinningKeyCountSimulations(deployInfrastructure) {

    return function () {
    it("Confirm the reward rate for submissions.", async function () {
        const { addr1, refereeCalculations } = await loadFixture(deployInfrastructure);

        const stakingBoostFactors = [1, 2, 3, 5, 8, 10, 13, 21, 34, 55, 89, 100, 144, 200, 233, 300,  377, 610, 700, 987];
        const keyAmountTests = [1, 2, 3, 5, 8, 10, 13, 21, 34, 55, 89, 100, 144, 200, 233, 300, 377, 610, 987, 1000, 100000]; // Test cases for staked key amounts
        const iterations = 10000;  // Number of times to run each test case        
        
        // Initialize CSV content with header
        let csvContent = 'Key Count,Boost Factor,Expected Winning Keys,Actual Winning Keys,Min Keys Won,Max Keys Won,Number of Runs\n';


        // Run tests for each key amount in the keyAmountTests array
        for (let keyCount of keyAmountTests) {
            // Run tests for each boost factor in the stakingBoostFactors array
            for (let boostFactor of stakingBoostFactors) {
                let totalWinningKeys = BigInt(0);
                // Tracking the minimum and maximum winning key counts for each test case
                let minWinningKeys = BigInt(Number.MAX_SAFE_INTEGER);
                let maxWinningKeys = BigInt(0);
                let results = [];
                
                // Run the test case for the current key amount and boost factor
                // multiple times to get an average winning key count
                for (let i = 0; i < iterations; i++) {
                    // Get the winning key count for the current test case iteration
                    const random1 = ethers.randomBytes(32);
                    const random2 = ethers.randomBytes(32);

                    const winningKeyCount = getWinningKeyCountLocal(
                        keyCount, 
                        boostFactor, 
                        await addr1.getAddress(), // Pool address will be used in production for the seed
                        i,  // Use iteration as challengeId for variety
                        random1,  // Random confirmData
                        random2   // Random challengerSignedHash
                    );

                    /** Note Uncomment the following code to compare the results from the local function 
                     *  This is only used to confirm the local function results match the contract function results
                     */
                    
                    // const winningKeyCount2 = await refereeCalculations.getWinningKeyCount(
                    //     keyCount, 
                    //     boostFactor, 
                    //     await addr1.getAddress(), // Pool address will be used in production for the seed
                    //     i,  // Use iteration as challengeId for variety
                    //     random1,  // Random confirmData
                    //     random2   // Random challengerSignedHash
                    //     // Random challengerSignedHash
                    // );
                    // console.log("Winning Key Count 2: ", winningKeyCount2);

                    // expect(winningKeyCount).to.equal(winningKeyCount2);

                    // console.log("Winning Counts: ", winningKeyCount, winningKeyCount2);
                    
                    // The amount of winning keys returned from the simulation
                    const winningKeysBigInt = BigInt(winningKeyCount);
                    // Add the winning key count to the total for the specific test case simulation
                    totalWinningKeys += winningKeysBigInt;
                    // Update the minimum and maximum winning key counts for the test case if applicable
                    minWinningKeys = winningKeysBigInt < minWinningKeys ? winningKeysBigInt : minWinningKeys;
                    maxWinningKeys = winningKeysBigInt > maxWinningKeys ? winningKeysBigInt : maxWinningKeys;
                    // Store the results for the test case
                    results.push(Number(winningKeysBigInt));

                }

                // Calculate the average winning key count for the test case
                const averageWinningKeys = Number(totalWinningKeys) / iterations;
                // Calculate the expected winning key count based on the staked key amount and boost factor
                const expectedWinningKeys = (keyCount * boostFactor) / 10000;
                // Calculate the maximum allowable tolerance for variance of expectations
                const tolerance = Math.max(1, expectedWinningKeys * 0.25);  // 10% tolerance or at least 1

                // TODO - Remove console.log statements once we are confident in the algorithm

                console.log(`Staked Keys: ${keyCount}, Boost Factor: ${boostFactor}`);
                console.log(`Average Winning Keys: ${averageWinningKeys.toFixed(4)}`);
                console.log(`Expected Winning Keys: ${expectedWinningKeys.toFixed(4)}`);
                console.log(`Minimum Winning Keys: ${minWinningKeys}`);
                console.log(`Maximum Winning Keys: ${maxWinningKeys}`);
                console.log(`Tolerance: ±${tolerance.toFixed(4)}`);

                expect(averageWinningKeys).to.be.within(
                    expectedWinningKeys - tolerance,
                    expectedWinningKeys + tolerance
                );

                console.log("Test passed");
                console.log("--------------------");

                // Add the results to the CSV content
                csvContent += `${keyCount},${boostFactor},${expectedWinningKeys.toFixed(4)}, ${averageWinningKeys.toFixed(4)},${minWinningKeys},${maxWinningKeys},${iterations}\n`;
            }
        }

        // Write the CSV content to a file
        await fs.writeFile(`./assets/csv-output/key_simulations_${iterations}.csv`, csvContent, {}, (err) => {
            if (err) {
                console.error("Error writing to CSV file:", err);
                return;
            }
            console.log("CSV file has been saved.");
        });
    }).timeout(6000000);

    }
}

export function RefereeWinningKeyCountSimulations(deployInfrastructure) {
	return function () {
        describe("Check reward rates", RunWinningKeyCountSimulations(deployInfrastructure).bind(this));
	}
}
