import {  BigInt, log } from "@graphprotocol/graph-ts"
import { 
    RedemptionStarted as RedemptionStartedEvent,
    RedemptionStartedV2 as RedemptionStartedV2Event,
    RedemptionCancelled as RedemptionCancelledEvent,
    RedemptionCompleted as RedemptionCompletedEvent
} from "../generated/esXai/esXai";
import { RedemptionRequest } from "../generated/schema";

export function handleRedemptionStarted(event: RedemptionStartedEvent): void {
    const request = new RedemptionRequest(event.params.user.toHexString() + "_"  + event.params.index.toString());
    request.sentryWallet = event.params.user.toHexString();
    request.index = event.params.index;
    request.amount = BigInt.fromI32(0);
    request.startTime = event.block.timestamp;
    request.endTime = BigInt.fromI32(0);
    request.duration = BigInt.fromI32(0);
    request.cancelled = false;
    request.completed = false;
    request.voucherIssued = false;
    request.save();
}

export function handleRedemptionStartedV2(event: RedemptionStartedV2Event): void {
    const request = new RedemptionRequest(event.params.user.toHexString() + "_"  + event.params.index.toString());
    request.sentryWallet = event.params.user.toHexString();
    request.index = event.params.index;
    request.amount = event.params.amount;
    request.startTime = event.block.timestamp;
    request.endTime = BigInt.fromI32(0);
    request.duration = event.params.duration;
    request.cancelled = false;
    request.completed = false;
    request.voucherIssued = true;
    request.save()
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