import { ethers } from 'ethers';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../config.js';

/**
 * Removes an operator from the Referee contract.
 * @param operatorAddress - The address of the operator to be removed.
 * @param signer - The signer to interact with the contract.
 */
export async function removeOperatorFromReferee(
    operatorAddress: string,
    signer: ethers.Signer
): Promise<void> {

    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    // Remove the operator from the Referee contract
    await refereeContract.setApprovalForOperator(operatorAddress, false);
}
