import { ForwardRequest } from "@/models/types/ForwardRequest";

/**
 * Validate a forward request object
 * 
 * @param txRequest The transaction to forward according to ERC-2771 including the signature of the user
 * 
 * @returns {string} the validation error or empty string if the request obj is valid
 */
export function validateForwardRequest(txRequest: ForwardRequest): string {

    if (!txRequest.from || !txRequest.from.length) {
        //TODO validate EVM address
        return "Invalid request from";
    }
    if (!txRequest.to || !txRequest.to.length) {
        //TODO validate EVM address
        return "Invalid request to";
    }
    if (txRequest.value != "0") {
        return "Invalid request value";
    }
    if (!txRequest.gas || !txRequest.gas.length) {
        return "Invalid request gas";
    }
    if (!txRequest.nonce || !txRequest.nonce.length) {
        return "Invalid request nonce";
    }
    if (!txRequest.data || !txRequest.data.length) {
        return "Invalid request data";
    }
    if (!txRequest.signature || !txRequest.signature.length) {
        //TODO validate signature length
        return "Invalid signature";
    }

    return "";
}