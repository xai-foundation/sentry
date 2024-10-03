/**
 * Submits a test challenge to the mock rollup contract.
 * NOTE: the toggleAssertionChecking() and setRollupAddress() function must exist on the referee
 * contract for this helper function to operate.
 * @param {Contract} referee - The referee contract instance to submit the challenge to.
 * @param {Wallet} challengerWallet - The wallet of the challenger submitting the challenge.
 * @param {Contract} mockRollup - The MockRollup contract instance.
 * @param {Contract} refereeCalculations - The RefereeCalculations contract instance.
 * @param {BigInt} currentAssertion - The current assertion id for the challenge.
 * @param {BigInt} previousAssertion - The previous assertion id.
 * @returns {Object} - An object containing the nodes, assertions, confirmData, and confirmHash.
 */
export const submitMockRollupChallenge = async (
    referee, 
    challengerWallet, 
    mockRollup, 
    refereeCalculations, 
    currentAssertion,
    previousAssertion,
    confirmDataOrHash,
    latestNodeBlockNumber
) => {
    //set isCheckingAssertions to true in referee
    let isAssertionChecking = await referee.isCheckingAssertions();
    if (!isAssertionChecking) {
        await referee.toggleAssertionChecking();
    }
    
    //set referee rollup address to mock rollup
    const prevRollupAddress = await referee.rollupAddress();
    const mockRollupAddress = await mockRollup.getAddress();
    await referee.setRollupAddress(mockRollupAddress);
    
    // Create a Node on the MockRollup
    let nodeArray = [];
    let assertionArray = [];
    let lastNodeBlockNumber = 0;
    for (let i = previousAssertion + 1; i <= currentAssertion; i++) {
        //create new node on mock rollup
        let hexStr = "0x" + BigInt(i).toString(16).padStart(64, "0"); //make unique hex string
        await mockRollup.createNode(
            i,
            hexStr,
            hexStr
        );
        
        //read the Node from the MockRollup to get Node data
        const node = await mockRollup.getNode(i);
        
        //push node into array
        nodeArray.push(node);
        assertionArray.push(i);
        
        //update last block number
        lastNodeBlockNumber = node.createdAtBlock;
    }
    
    //get confirm data and hash from param or directly from contract if null
    let confirmData, confirmHash;
    if (confirmDataOrHash != null) {
        confirmData = confirmDataOrHash;
        confirmHash = confirmDataOrHash;
    } else {
        [confirmData, confirmHash] = await refereeCalculations.getConfirmDataMultipleAssertions(
            assertionArray, 
            mockRollupAddress
        );
    }

    //get last node block number from param or use calculated one if null
    if (latestNodeBlockNumber != null) {
        lastNodeBlockNumber = latestNodeBlockNumber;
    }
    
    // Submit a challenge pointing to the MockRollup Node(s)
    let trx = await referee.connect(challengerWallet).submitChallenge(
        currentAssertion,
        previousAssertion,
        nodeArray.length > 1 ? confirmHash : nodeArray[nodeArray.length - 1].confirmData, 
        lastNodeBlockNumber, 
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
    
    // set isCheckingAssertions to false in the Referee
    isAssertionChecking = await referee.isCheckingAssertions();
    if (isAssertionChecking) {
        await referee.toggleAssertionChecking();
    }

    // set rollup address back to previous rollup address
    await referee.setRollupAddress(prevRollupAddress);

    // Return all Node and Challenge data for further use in the testcase
    return {
        nodes: nodeArray,
        assertions: assertionArray,
        confirmData: confirmData,
        confirmHash: nodeArray.length > 1 ? nodeArray[nodeArray.length - 1].confirmData : confirmHash,
        challengeTrxHash: trx
    }
};
