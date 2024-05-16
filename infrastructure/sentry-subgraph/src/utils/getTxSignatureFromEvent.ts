import { Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { prepareTransactionInput } from "./getInputFromEvent";

/**
 * Return the transaction selector from the event's transaction input data
 * This can be used to know from what function call the event was triggered
 * 
 * In the case of a MultiSig contract execTransaction this function will automatically return the underlying function's selector
 * 
 * @param event - The event that got emitted by the function call
 * @returns The transaction selector / signature hash
 */
export function getTxSignatureFromEvent(event: ethereum.Event): string {
    let signature = event.transaction.input.toHexString().slice(0, 10)
    if (signature == "0x6a761202") {
        //This is "execTransaction" from on of the most common multisig standards, we will have to extend this if we notice different standards
        const dataString = prepareTransactionInput(event.transaction.input, true)
        const decoded = ethereum.decode('(address,uint256,bytes,uint8,uint256,uint256,uint256,address,address,bytes)', Bytes.fromByteArray(Bytes.fromHexString(dataString)))
        if (decoded) {
            signature = decoded.toTuple()[2].toBytes().toHexString().slice(0, 10)
        } else {
            log.warning("Failed to decode getTxSignatureFromEvent for multisig TX: " + event.transaction.hash.toHexString(), [])
        }
    }

    return signature
}