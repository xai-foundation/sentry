/**
 * Submits a test challenge to the contract.
 * @param {Contract} contract - The contract instance to submit the challenge to.
 * @param {Wallet} challengerWallet - The wallet of the challenger submitting the challenge.
 * @param {BigInt} startingAssertion - The starting assertion for the challenge.
 * @param {string} stateRoot - The state root for the challenge.
 * @returns {Promise<Transaction>} - A promise that resolves to the transaction result of the challenge submission.
 */
export const submitTestChallenge = async (contract, challengerWallet, startingAssertion, stateRoot) => {
    // Calculate the ending assertion by subtracting 1 from the starting assertion
    const endingAssertion = startingAssertion - 1;

    // Connect the contract to the challenger wallet and submit the challenge
    return contract.connect(challengerWallet).submitChallenge(
        startingAssertion, 
        endingAssertion, 
        stateRoot, 
        0, 
        "0x0000000000000000000000000000000000000000000000000000000000000000"
    );
};
