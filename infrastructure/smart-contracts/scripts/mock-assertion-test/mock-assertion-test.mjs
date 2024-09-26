import { getNodeConfirmedEvents } from "@sentry/core"

// Note, should make the following changes 
// 1. Operator Delay Commented Out
// 2. 50 Mins minimum between challenges reduced to your desired interval

async function main() {

    const deployer = (await ethers.getSigners())[0];
    const BLOCKS_TO_WAIT = 1;
    const mainnetRPC = "https://arb1.arbitrum.io/rpc";
    const mainnetRollupAddress = "0xC47DacFbAa80Bd9D8112F4e8069482c2A3221336";

    const MOCK_ROLLUP_ABI = [
        "function createNode(uint64 nodeNum, bytes32 blockHash, bytes32 sendRoot)",
        "function confirmNode(uint64 nodeNum, bytes32 blockHash, bytes32 sendRoot)"
    ];

    const mockRollupAddress = `0xb3b08bE5041d3F94C9fD43c91434515a184a43af`;
    const mockRollup = new ethers.Contract(mockRollupAddress, MOCK_ROLLUP_ABI, deployer);

    // Need to update these values for each run
    const assertionId1 = 5860;
    const assertionBlock1 = 255338885;

    const assertionId2 = 5861;
    const assertionBlock2 = 255353351;

    const assertionId3 = 5862;
    const assertionBlock3 = 255367996;

    const assertionId4 = 5863;
    const assertionBlock4 = 255382168;

    // Submit Assertion 1 to Mock Rollup to trigger the initial challenge

    console.log(`Getting main net confirm data for assertion ${assertionId1} at block ${assertionBlock1}`);
    const events1 = await getNodeConfirmedEvents(mainnetRPC, mainnetRollupAddress, assertionId1, assertionBlock1, assertionBlock1);

    const blockHash1 = events1[0].args.blockHash;
    const sendRoot1 = events1[0].args.sendRoot;

    console.log(`Creating assertion ${assertionId1} in Mock Rollup`);
    console.log(`Block Hash: ${blockHash1}`);
    console.log(`Send Root: ${sendRoot1}`);

    const createTx1 = await mockRollup.createNode(assertionId1, blockHash1, sendRoot1);
    await createTx1.wait(BLOCKS_TO_WAIT);
    console.log(`Assertion ${assertionId1} created in Mock Rollup`);

    const confirmTx1 = await mockRollup.confirmNode(assertionId1, blockHash1, sendRoot1);
    await confirmTx1.wait(BLOCKS_TO_WAIT);
    console.log(`Assertion ${assertionId1} confirmed in Mock Rollup`);

    console.log("Waiting 15 seconds before submitting the next assertion");
    // Wait 15 Seconds and submit a new assertion to Mock Rollup
    await new Promise(r => setTimeout(r, 15000));


    // Submit Assertion 2 to Mock Rollup
    // This will not trigger a challenge because not enough time has passed

    console.log(`Getting main net confirm data for assertion ${assertionId2} at block ${assertionBlock2}`);
    const events2 = await getNodeConfirmedEvents(mainnetRPC, mainnetRollupAddress, assertionId2, assertionBlock2, assertionBlock2);

    const blockHash2 = events2[0].args.blockHash;
    const sendRoot2 = events2[0].args.sendRoot;

    console.log(`Creating assertion ${assertionId2} in Mock Rollup`);
    console.log(`Block Hash: ${blockHash2}`);
    console.log(`Send Root: ${sendRoot2}`);

    const createTx2 = await mockRollup.createNode(assertionId2, blockHash2, sendRoot2);
    await createTx2.wait(BLOCKS_TO_WAIT);
    console.log(`Assertion ${assertionId2} created in Mock Rollup`);
    const confirmTx2 = await mockRollup.confirmNode(assertionId2, blockHash2, sendRoot2);
    await confirmTx2.wait(BLOCKS_TO_WAIT);
    console.log(`Assertion ${assertionId2} confirmed in Mock Rollup`);

    // Wait two minutes and submit a new assertion to Mock Rollup

    console.log("Waiting 2 minutes before submitting the next assertion");
    console.log(`It should then trigger a batch challenge of assertions ${assertionId2} and ${assertionId3}`);
    await new Promise(r => setTimeout(r, 120000));

    // Submit Assertion 3 to Mock Rollup
    // This should trigger a batch challenge

    console.log(`Getting main net confirm data for assertion ${assertionId3} at block ${assertionBlock3}`);
    const events3 = await getNodeConfirmedEvents(mainnetRPC, mainnetRollupAddress, assertionId3, assertionBlock3, assertionBlock3);

    const blockHash3 = events3[0].args.blockHash;
    const sendRoot3 = events3[0].args.sendRoot;

    console.log(`Creating assertion ${assertionId3} in Mock Rollup`);
    console.log(`Block Hash: ${blockHash3}`);
    console.log(`Send Root: ${sendRoot3}`);

    const createTx3 = await mockRollup.createNode(assertionId3, blockHash3, sendRoot3);
    await createTx3.wait(BLOCKS_TO_WAIT);
    console.log(`Assertion ${assertionId3} created in Mock Rollup`);

    const confirmTx3 = await mockRollup.confirmNode(assertionId3, blockHash3, sendRoot3);
    await confirmTx3.wait(BLOCKS_TO_WAIT);
    console.log(`Assertion ${assertionId3} confirmed in Mock Rollup`);

    // Wait 2 minutes and 10 seconds and submit a new assertion to Mock Rollup

    console.log("Waiting 2 minutes and 10 seconds before submitting the next assertion");
    console.log(`It should then trigger a single challenge of assertion ${assertionId4}`);
    await new Promise(r => setTimeout(r, 130000));

    // Submit Assertion 4 to Mock Rollup
    // This should trigger a single challenge

    console.log(`Getting main net confirm data for assertion ${assertionId4} at block ${assertionBlock4}`);
    const events4 = await getNodeConfirmedEvents(mainnetRPC, mainnetRollupAddress, assertionId4, assertionBlock4, assertionBlock4);

    const blockHash4 = events4[0].args.blockHash;
    const sendRoot4 = events4[0].args.sendRoot;

    console.log(`Creating assertion ${assertionId4} in Mock Rollup`);
    console.log(`Block Hash: ${blockHash4}`);
    console.log(`Send Root: ${sendRoot4}`);

    const createTx = await mockRollup.createNode(assertionId4, blockHash4, sendRoot4);
    await createTx.wait(BLOCKS_TO_WAIT);
    console.log(`Assertion ${assertionId4} created in Mock Rollup`);

    const confirmTx = await mockRollup.confirmNode(assertionId4, blockHash4, sendRoot4);
    await confirmTx.wait(BLOCKS_TO_WAIT);
    console.log(`Assertion ${assertionId4} confirmed in Mock Rollup`);

    console.log("Script Complete");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


// Additional Assertions For Future Runs, must be run in order

// Assertion ID     Block Number
// 5864	            255396555
// 5865	            255410973
// 5866	            255425406
// 5867	            255439858

// 5868	            255454340
// 5869	            255468828
// 5870	            255483064
// 5871	            255497789

// 5872	            255511945
// 5873	            255526079
// 5874	            255540488
// 5875	            255554888

// 5876	            255569277
// 5877	            255583616
// 5878	            255598083
// 5879	            255612722