import { Bytes, ethereum } from "@graphprotocol/graph-ts";

export function getTxSignatureFromEvent(event: ethereum.Event): string {
    return event.transaction.input.toHexString().slice(0, 10)
}