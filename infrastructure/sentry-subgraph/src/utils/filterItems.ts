import { Bytes, log } from "@graphprotocol/graph-ts";

// this function acts as a helper to filter items from Bytes[]
export function filterItems(itemToRemove: Bytes, approvedItems: Bytes[]): Bytes[] {
    let newItems: Bytes[] = [];
/* 
    log.warning(`Filter items to remove addresses: ${itemToRemove.toString()} and ${approvedItems.toString()}`, []); */

    for (let i = 0; i < approvedItems.length; i++) {
        if (approvedItems[i] != itemToRemove) {
            newItems.push(approvedItems[i]);
        }
    }
/* 
    log.warning(`Filter after remove addresses: ${newItems.toString()}`, []); */

    approvedItems = newItems;

    return approvedItems;
}