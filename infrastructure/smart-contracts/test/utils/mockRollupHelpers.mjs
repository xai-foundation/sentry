/**
 * Submits one or more createNode transaction to the MockRollup contract.
 * NOTE: the toggleAssertionChecking() and setRollupAddress() function must exist on the referee
 * contract for this helper function to operate.
 * @param {Contract} referee - The referee contract instance to submit the challenge to.
 * @param {Contract} mockRollup - The MockRollup contract instance.
 * @param {BigInt} currentAssertion - The current assertion id for the challenge.
 * @param {BigInt} previousAssertion - The previous assertion id.
 * @returns {Object} - An object containing the nodes, assertions, confirmData, and confirmHash.
 */
export const createMockRollupNodes = async (
    referee, 
    mockRollup, 
    currentAssertion,
    previousAssertion
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

    //create node(s) on the MockRollup
    let nodeArray = [];
    let assertionArray = [];
    let trxArray = [];
    let lastNodeBlockNumber = 0;
    for (let i = previousAssertion + 1; i <= currentAssertion; i++) {
        //create new node on mock rollup
        let hexStr = "0x" + BigInt(i).toString(16).padStart(64, "0"); //make unique hex string
        let trx = await mockRollup.createNode(
            i,
            hexStr,
            hexStr
        );
        
        //read the Node from the MockRollup to get Node data
        const node = await mockRollup.getNode(i);
        
        //push values into array
        nodeArray.push(node);
        assertionArray.push(i);
        trxArray.push(trx);
        
        //update last block number
        lastNodeBlockNumber = node.createdAtBlock;
    }
    
    //set isCheckingAssertions and referee address back to previous values
    isAssertionChecking = await referee.isCheckingAssertions();
    if (isAssertionChecking) {
        await referee.toggleAssertionChecking();
    }

    //set rollup address back to previous rollup address
    await referee.setRollupAddress(prevRollupAddress);

    return {
        nodes: nodeArray,
        assertions: assertionArray,
        transactions: trxArray,
        lastNodeBlockNumber: lastNodeBlockNumber
    }
};

/**
 * Submits one or more confirmNode transactions to the MockRollup contract.
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
export const confirmMockRollupNodes = async (
    referee, 
    mockRollup, 
    refereeCalculations,
    currentAssertion,
    previousAssertion
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

    //confirm nodes
    let assertionArray = [];
    let trxArray = [];
    for (let i = previousAssertion + 1; i <= currentAssertion; i++) {
        let hexStr = "0x" + BigInt(i).toString(16).padStart(64, "0");
        let trx = await mockRollup.confirmNode(
            i,
            hexStr,
            hexStr
        );
        assertionArray.push(i);
        trxArray.push(trx);
    }

    //get confirm data and hash from contract
    const [confirmData, confirmHash] = await refereeCalculations.getConfirmDataMultipleAssertions(
        assertionArray, 
        mockRollupAddress
    );
    
    //set isCheckingAssertions to false in the Referee
    isAssertionChecking = await referee.isCheckingAssertions();
    if (isAssertionChecking) {
        await referee.toggleAssertionChecking();
    }

    //set rollup address back to previous rollup address
    await referee.setRollupAddress(prevRollupAddress);

    return {
        confirmData: confirmData,
        confirmHash: confirmHash,
        transactions: trxArray
    }
};
