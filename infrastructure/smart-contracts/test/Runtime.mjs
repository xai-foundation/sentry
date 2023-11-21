import {listOwnersForOperator, operatorRuntime, listNodeLicenses} from "@sentry/core";
import {winningHashForNodeLicense0} from "./AssertionData.mjs";
import { expect } from "chai";

/**
 * @title Runtime Tests
 * @dev Test Nodes running alonside the challenger
 */
export function RuntimeTests(deployInfrastructure) {
    return function() {

        describe("Check the operator runtime, is capable of performing all of its roles", async function() {

            it("Check the Operator is capable of detecting all of the node licenses it is attached to", async function() {
                const {operator} = await deployInfrastructure();
                
                // get list that licenses that operator has access to
                const owners = await listOwnersForOperator(await operator.getAddress());

                // iterate over owners and call listNodeLicenses, making an array of the nodeLicenses
                const nodeLicenses = [];
                for (const owner of owners) {
                    const licenses = await listNodeLicenses(owner);
                    nodeLicenses.push(...licenses);
                }

                // start the operator and wait to see the operator update the license that was added
                const stop = await new Promise(async (resolve, reject) => {

                    // make a map of all the nodeLicenses to a boolean, when the node is found set to true
                    const nodeLicenseMap = new Map(nodeLicenses.map(license => [license, false]));

                    const _stop = await operatorRuntime(operator, (_status) => {
                        // console.log(_status.forEach(console.log));
                        _status.forEach((_, key) => {
                            if (nodeLicenses.includes(key)) {
                                // set the nodeLicense to true, meaning it was connected
                                nodeLicenseMap.set(key, true);
                            }
                        });
                    });

                    // if not all the values in the map are true, then reject
                    if (Array.from(nodeLicenseMap.values()).includes(false)) {
                        reject(new Error("Not all node licenses were connected."));
                    }

                    resolve(_stop);
                });

                // stop the operator
                await stop();
            })

            it("Check the Operator is capable of detecting and processing claims for it.", async function() {
                const {challenger, referee, operator, publicKeyHex, esXai, addr1} = await deployInfrastructure();


                // submit an assertion to the referee, starting a challenge
                await referee.connect(challenger).submitChallenge(
                    100,
                    99,
                    winningHashForNodeLicense0,
                    0,
                    publicKeyHex
                );

                // check to see the challenge is open for submissions
                const {openForSubmissions} = await referee.getChallenge(0);
                expect(openForSubmissions).to.be.eq(true);

                // submit a claim for the assertion
                await referee.connect(operator).submitAssertionToChallenge(1,0,winningHashForNodeLicense0);
                
                // get the submission back to see it was created
                const [{submitted, successorStateRoot, claimed}] = await referee.getSubmissionsForChallenges([0], 1);
                expect(submitted).to.be.eq(true)
                expect(claimed).to.be.eq(false);

                // // check to see if the submission was eligible for a payout
                const [payoutEligible] = await referee.createAssertionHashAndCheckPayout(1, 0, successorStateRoot);
                expect(payoutEligible).to.be.eq(true);

                // submit another assertion to end the previous challenge
                await referee.connect(challenger).submitChallenge(
                    101,
                    100,
                    winningHashForNodeLicense0, // doesn't matter that its the same
                    0,
                    publicKeyHex
                );

                // check to see the previous challenge closed
                const {openForSubmissions: openForSubmissionsAfter, numberOfEligibleClaimers} = await referee.getChallenge(0);
                expect(openForSubmissionsAfter).to.be.eq(false);
                expect(numberOfEligibleClaimers).to.be.eq(BigInt(1));

                // get the esXai balance of the addr1 prior to claiming
                const balanceBefore = await esXai.balanceOf(await addr1.getAddress());

                // start the runtime, and see that the challenge is claimed
                // start the operator and wait to see the operator update the license that was added
                const stop = await new Promise(async (resolve, reject) => {

                    const _stop = await operatorRuntime(operator);

                    resolve(_stop);
                });

                // stop the operator
                await stop();

                // expect to see esXai balance increased
                const balanceAfter = await esXai.balanceOf(await addr1.getAddress());
                expect(balanceAfter).to.be.gt(balanceBefore);
            })
        })


    }
}