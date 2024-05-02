import { SentryWallet } from "../../generated/schema";
import { PoolFactory } from "../../generated/PoolFactory/PoolFactory";
import { Address, Bytes, log } from "@graphprotocol/graph-ts";

/**
 * Bind a referee contract and pass in the sentryWallet entity, this function will lookup all necessary data from the contract
 * and update the sentryWallet entity with the new data. This function does not save the entity, if you need it saved, save it
 * after calling this function.
 * 
 * This function also assumes the sentryWallet number is already set on the entity.
 */
export function updateSentryWallet(poolFactory: PoolFactory, sentryWallet: SentryWallet): SentryWallet {

    let sentryAddress = Address.fromBytes(sentryWallet.address);
    // query for the sentryWallet struct

   log.warning(`SentryAddress: ${sentryAddress.toHexString()}`, []); 

    let ownedPoolsStruct: Address[] = []; // your Address array
    ownedPoolsStruct = poolFactory.getPoolIndicesOfUser(sentryAddress);
   log.warning(`Hello there`, []); 

    let ownedPoolsBytes: Bytes[] = []; // Initialize an empty array for Bytes

    for (let i = 0; i < ownedPoolsStruct.length; i++) {
        let bytes = Bytes.fromHexString(ownedPoolsStruct[i].toHexString());
        log.warning(`BYTES: ${bytes.toHexString}`, [])
        ownedPoolsBytes.push(bytes);
    }

    // Now ownedPoolsBytes contains the Bytes representation of the Address array
    sentryWallet.ownedPools = ownedPoolsBytes;

    return sentryWallet;
}

