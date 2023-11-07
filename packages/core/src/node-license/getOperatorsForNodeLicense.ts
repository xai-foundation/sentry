import { getOwnerOfNodeLicense } from './getOwnerOfNodeLicense.js';
import { listOperatorsForAddress } from '../index.js';

/**
 * Fetches all the operators for a list of nodeLicense IDs.
 * @param nodeLicenseIds - The IDs of the nodeLicenses.
 * @returns The operators for the given nodeLicense IDs.
 */
export async function getOperatorsForNodeLicense(nodeLicenseIds: bigint[]): Promise<string[][]> {

    // Get the owners of the nodeLicenses
    const ownerAddresses = await getOwnerOfNodeLicense(nodeLicenseIds);

    // Get the operators for each owner
    const operatorsList: string[][] = [];
    const operatorsMemo: { [key: string]: string[] } = {};
    for (const ownerAddress of ownerAddresses) {
        if (!operatorsMemo[ownerAddress]) {
            operatorsMemo[ownerAddress] = await listOperatorsForAddress(ownerAddress);
        }
        operatorsList.push(operatorsMemo[ownerAddress]);
    }

    return operatorsList;
}
