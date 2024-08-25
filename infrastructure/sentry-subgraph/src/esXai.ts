import {  BigInt, Bytes, ethereum, log } from "@graphprotocol/graph-ts"
import { 
    RedemptionStarted as RedemptionStartedEvent,
    RedemptionCancelled as RedemptionCancelledEvent,
    RedemptionCompleted as RedemptionCompletedEvent,
    VoucherIssued as VoucherIssuedEvent,
    Transfer as esXaiTransferEvent
} from "../generated/esXai/esXai";
import { RedemptionRequest, SentryWallet } from "../generated/schema";

export function handleRedemptionStarted(event: RedemptionStartedEvent): void {

    // Create a new redemption request entity 
    const request = new RedemptionRequest(event.params.user.toHexString() + "_"  + event.params.index.toString());
    
    // Decode the transaction input data to get the redemption amount and duration
    const inputData = event.transaction.input.toHexString().slice(10); // Remove function selector
    const decoded = ethereum.decode('(uint256,uint256)', Bytes.fromHexString(inputData) as Bytes);

    if (decoded) {      
        const decodedTuple = decoded.toTuple();
            request.amount = decodedTuple[0].toBigInt();
            request.duration = decodedTuple[1].toBigInt();
    } else {
        log.warning("Failed to decode startRedemption TX: {}", [event.transaction.hash.toHexString()]);
        return;
    }
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

export function handleesXaiTransfer(event:esXaiTransferEvent): void {
    // Load the receiving wallet
    let receivingSentryWallet = SentryWallet.load(event.params.to.toHexString())

    // If the wallet does not exist, create a new one
    if (!receivingSentryWallet) {
        receivingSentryWallet = new SentryWallet(event.params.to.toHexString())
        receivingSentryWallet.address = event.params.to
        receivingSentryWallet.approvedOperators = []
        receivingSentryWallet.isKYCApproved = false
        receivingSentryWallet.v1EsXaiStakeAmount = BigInt.fromI32(0)
        receivingSentryWallet.esXaiStakeAmount = BigInt.fromI32(0)
        receivingSentryWallet.keyCount = BigInt.fromI32(0)
        receivingSentryWallet.stakedKeyCount = BigInt.fromI32(0)
        receivingSentryWallet.esXaiBalance = event.params.value
    } else {
        receivingSentryWallet.esXaiBalance = receivingSentryWallet.esXaiBalance.plus(event.params.value)
    }
    receivingSentryWallet.save();

    // If the sender is the zero address, this is a mint operation, so return    
    if(event.params.from.toHexString() == "0x0000000000000000000000000000000000000000") return;

    // Load the sending wallet    
    const sendingSentryWallet = SentryWallet.load(event.params.from.toHexString())

    // If the wallet does not exist, log a warning and return
    // This should never happen as the wallet should be created when it receives its first esXai
    if (!sendingSentryWallet) {
        log.warning("Failed to find sending wallet on handleesXaiTransfer: TX: " + event.transaction.hash.toHexString() + ", user: " + event.params.from.toHexString(), []);
        return;
    }else{
    // Update the sending wallet esXai balance
    sendingSentryWallet.esXaiBalance = sendingSentryWallet.esXaiBalance.minus(event.params.value)
    sendingSentryWallet.save();
    }
}