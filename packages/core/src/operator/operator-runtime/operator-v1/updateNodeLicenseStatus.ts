import { NodeLicenseStatus } from "../../index.js";
import { operatorState } from "../operatorState.js";

/**
 * Update the status message for display in the operator desktop app key list
 * @param {bigint} nodeLicenseId - The nodeLicense key id.
 * @param {NodeLicenseStatus | string} newStatus - The new status to display
 */
export function updateNodeLicenseStatus_V1(nodeLicenseId: bigint, newStatus: NodeLicenseStatus | string) {
    const nodeLicenseInfo = operatorState.nodeLicenseStatusMap.get(nodeLicenseId);
    if (nodeLicenseInfo) {
        nodeLicenseInfo.status = newStatus;
        operatorState.nodeLicenseStatusMap.set(nodeLicenseId, nodeLicenseInfo);
        operatorState.safeStatusCallback();
    } else {
        operatorState.cachedLogger(`NodeLicenseId ${nodeLicenseId} not found in nodeLicenseStatusMap.`);
    }
}
