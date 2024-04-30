import { SentryWallet } from "../../generated/schema";
import { Referee } from "../../generated/Referee/Referee"
import { PoolFactory } from "../../generated/PoolFactory/PoolFactory";

/**
 * Bind a referee contract and pass in the challenge entity, this function will lookup all necessary data from the contract
 * and update the challenge entity with the new data. This function does not save the entity, if you need it saved, save it
 * after calling this function.
 * 
 * This function also assumes the challenge number is already set on the entity.
 */
export function updateSentryWallet(referee: Referee, poolFactory: PoolFactory, sentryWallet: SentryWallet): SentryWallet {

    // query for the sentryWallet struct
    let delegatePoolsStruct = poolFactory.getDelegatePools(sentryWallet.address);
    let ownedPoolsStruct = poolFactory.getPoolIndicesOfUser(sentryWallet.address);

   

    // // update any static fields
    // sentryWallet.approvedOwners = sentryWalletStruct.

    return sentryWallet;
}

