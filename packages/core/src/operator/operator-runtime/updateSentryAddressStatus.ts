import { NodeLicenseStatus } from "../../index.js";
import { operatorState } from "./operatorState.js";

/**
 * Update the status message for display in the operator desktop app key list
 * @param {string} address - The pool or wallet address.
 * @param {NodeLicenseStatus | string} newStatus - The new status to display
 */
export function updateSentryAddressStatus(address: string, newStatus: NodeLicenseStatus | string) {
    const sentryAddressInfo = operatorState.sentryAddressStatusMap.get(address.toLowerCase());
    if (sentryAddressInfo) {
        sentryAddressInfo.status = newStatus;
        operatorState.sentryAddressStatusMap.set(address.toLowerCase(), sentryAddressInfo);
        operatorState.safeStatusCallback();
    } else {
        operatorState.cachedLogger(`SentryAddress ${address} not found in sentryAddressStatusMap.`);
    }
}
