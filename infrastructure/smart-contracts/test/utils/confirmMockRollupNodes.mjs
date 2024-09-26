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
