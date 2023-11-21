import {listOwnersForOperator, operatorRuntime, listNodeLicenses} from "@sentry/core";
import {stakeOnNewNode0} from "./AssertionData.mjs";

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
                const {operator, referee, rollupController, rollupContract} = await deployInfrastructure();

                // Define the types of the parameters
                const types = [
                    'tuple(tuple(tuple(bytes32[2] bytes32Vals, uint64[2] u64Vals) globalState, uint8 machineStatus) beforeState, tuple(tuple(bytes32[2] bytes32Vals, uint64[2] u64Vals) globalState, uint8 machineStatus) afterState, uint64 numBlocks)',
                    'bytes32',
                    'uint256'
                ];

                const functionSignature = 'stakeOnNewNode(tuple,bytes32,uint256)';
                const functionSelector = ethers.id(functionSignature).slice(0, 10);
                console.log(functionSignature);

                // Encode the parameters
                const encodedParameters = ethers.AbiCoder.defaultAbiCoder().encode(types, stakeOnNewNode0);

                // submit an assertion to the referee, starting a challenge
                await rollupContract.connect(rollupController).stakeOnNewNode(stakeOnNewNode0);

                // submit a claim for the assertion
                

                // submit another assertion to end the previous challenge

                // start the runtime, and see that the challenge is claimed

            })

            it("Check the Operator is capable of claiming rewards that are now claimable since it was last turned on", async function() {
                const {operator, referee} = await deployInfrastructure();
                
            })

            it("Check the Operator is capable of processing at least 10 challenges", async function() {
                // TODO
            })

            it("Check the Operator is capable of claiming when a challenge closes", async function() {
                // TODO
            })

        })



    }
}