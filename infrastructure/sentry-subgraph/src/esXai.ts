import {  BigInt, log } from "@graphprotocol/graph-ts"
import { 
    RedemptionStarted as RedemptionStartedEvent,
    RedemptionCancelled as RedemptionCancelledEvent,
    RedemptionCompleted as RedemptionCompletedEvent,
    VoucherIssued as VoucherIssuedEvent
} from "../generated/esXai/esXai";
import { RedemptionRequest } from "../generated/schema";
import { esXai } from "../generated/esXai/esXai";

export function handleRedemptionStarted(event: RedemptionStartedEvent): void {

    // Create a new redemption request entity 
    const request = new RedemptionRequest(event.params.user.toHexString() + "_"  + event.params.index.toString());

    // Extract the user and index from the event parameters
    const index = event.params.index;
    const user = event.params.user;
    
    // Get the contract instance
    const contract = esXai.bind(event.address);
    
    // Get the redemption amount and duration from the contract
    const redemptionRequestResult  = contract.try_getRedemptionRequest(user, index);

    // Check if the call was successful
    if (redemptionRequestResult.reverted) {
        log.error("Failed to get redemption request on handleRedemptionStarted: TX: {}", [event.transaction.hash.toHexString()]);
        return;

    }
    const redemptionRequest = redemptionRequestResult.value;

    if (!redemptionRequest.amount) {
        log.error("Failed to get redemption request amount on handleRedemptionStarted: TX: {}", [event.transaction.hash.toHexString()]);
        return;
    }   

    if (!redemptionRequest.duration) {
        log.error("Failed to get redemption request duration on handleRedemptionStarted: TX: {}", [event.transaction.hash.toHexString()]);
        return;
    }


    request.amount = redemptionRequest.amount;
    request.duration = redemptionRequest.duration;
    request.sentryWallet = event.params.user.toHexString();
    request.index = event.params.index;
    request.startTime = event.block.timestamp;
    request.claimableTime = event.block.timestamp.plus(request.duration);
    request.endTime = BigInt.fromI32(0);
    request.cancelled = false;
    request.completed = false;
    request.voucherIssued = false;
    request.save();
}

export function handleRedemptionCancelled(event: RedemptionCancelledEvent): void {
    const request = RedemptionRequest.load(event.params.user.toHexString() + "_"  + event.params.index.toString());

    if(!request) {
        log.warning("Failed to find redemption request on handleRedemptionCancelled: TX: " + event.transaction.hash.toHexString() + ", user: " + event.params.user.toHexString() + ", index: " + event.params.index.toString(), []);
        return;
    }

    request.cancelled = true;
    request.endTime = event.block.timestamp;
    request.completed = true;
    request.save();
    
}
export function handleRedemptionCompleted(event: RedemptionCompletedEvent): void {
    const request = RedemptionRequest.load(event.params.user.toHexString() + "_"  + event.params.index.toString());

    if(!request) {
        log.warning("Failed to find redemption request on handleRedemptionCompleted: TX: " + event.transaction.hash.toHexString() + ", user: " + event.params.user.toHexString() + ", index: " + event.params.index.toString(), []);
        return;
    }

    request.endTime = event.block.timestamp;
    request.completed = true;
    request.save();    
}

export function handleVoucherIssued(event: VoucherIssuedEvent): void {

    // Get the user and  indices of the vouchers issued
    const user = event.params.user.toHexString();
    const indices = event.params.indices;
    
    // Loop through the indices and update the voucherIssued field on the redemption request
    for (let i = 0; i < indices.length; i++) {

        // Load the existing redemption request from the store
        const request = RedemptionRequest.load(user + "_"  + indices[i].toString());

        if(!request) {
            log.warning("Failed to find redemption request on handleVoucherIssued: TX: " + event.transaction.hash.toHexString() + ", user: " + user + ", index: " + indices[i].toString(), []);
            continue;
        }

        // Update the voucherIssued field and save the request
        request.voucherIssued = true;
        request.save();
    }

}