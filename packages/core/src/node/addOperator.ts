import { ethers } from 'ethers';
import { RefereeAbi } from '../abis/index.js';
import { config } from '../config.js';

/**
 * Adds an operator to the Referee contract.
 * @param operatorAddress - The address of the operator to be added.
 * @param isApproved - The approval status to be set for the operator.
 * @param signer - The signer to interact with the contract.
 */
export async function addOperatorToReferee(
    operatorAddress: string,
    isApproved: boolean,
    signer: ethers.Signer
): Promise<void> {

    // Create an instance of the Referee contract
    const refereeContract = new ethers.Contract(config.refereeAddress, RefereeAbi, signer);

    // Add the operator to the Referee contract
    await refereeContract.setApprovalForOperator(operatorAddress, isApproved);
}
