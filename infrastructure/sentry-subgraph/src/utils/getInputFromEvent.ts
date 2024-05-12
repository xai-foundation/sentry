import { Bytes, ethereum, log } from "@graphprotocol/graph-ts";
import { getTxSignatureFromEvent } from "./getTxSignatureFromEvent";


function prepareTransactionInput(transactionInput: Bytes, hasDynamicTypes: boolean): string {
    if (hasDynamicTypes) {
        //take away function signature and prepend tuple offset
        return '0x0000000000000000000000000000000000000000000000000000000000000020' + transactionInput.toHexString().slice(10); // prepend tuple offset
    } else {
        return "0x" + transactionInput.toHexString().slice(10)
    }
}

// hasDynamicTypes should only be true when the function contains structs or dynamic variables
// https://github.com/rust-ethereum/ethabi/issues/222#issuecomment-997139741
// https://medium.com/@r2d2_68242/indexing-transaction-input-data-in-a-subgraph-6ff5c55abf20
export function getInputFromEvent(event: ethereum.Event, hasDynamicTypes: boolean): Bytes {

    let transactionInput = event.transaction.input;

    const signature = getTxSignatureFromEvent(event);
    if (signature == "0x6a761202") {
        //This is "execTransaction" from on of the most common multisig standards, we will have to extend this if we notice different standards
        const dataString = prepareTransactionInput(event.transaction.input, true)
        const decoded = ethereum.decode('(address,uint256,bytes,uint8,uint256,uint256,uint256,address,address,bytes)', Bytes.fromByteArray(Bytes.fromHexString(dataString)))

        if (decoded) {
            transactionInput = decoded.toTuple()[2].toBytes()
        } else {
            log.warning("Failed to decode getInputFromEvent for multisig TX: " + event.transaction.hash.toHexString(), [])
        }

    }

    const hexStringToDecode = prepareTransactionInput(transactionInput, hasDynamicTypes)

    return Bytes.fromByteArray(Bytes.fromHexString(hexStringToDecode));
}