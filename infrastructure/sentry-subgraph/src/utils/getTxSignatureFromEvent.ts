import { Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { prepareTransactionInput } from "./getInputFromEvent";

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