import { SentryWallet } from "../../generated/schema";
import { Referee } from "../../generated/Referee/Referee"
import { PoolFactory } from "../../generated/PoolFactory/PoolFactory";


/**
 * Bind a referee contract and pass in the sentryWallet entity, this function will lookup all necessary data from the contract
 * and update the sentryWallet entity with the new data. This function does not save the entity, if you need it saved, save it
 * after calling this function.
 * 
 * This function also assumes the sentryWallet number is already set on the entity.
 */
export function updateSentryWallet(referee: Referee, poolFactory: PoolFactory, sentryWallet: SentryWallet): SentryWallet {

    // query for the sentryWallet struct
    let delegatePoolsStruct = poolFactory.getDelegatePools(sentryWallet.address);
    let ownedPoolsStruct = poolFactory.getPoolIndicesOfUser(sentryWallet.address);

    //TODO need to get approved opterator
    let operatorCountStruct = referee.getOperatorCount(sentryWallet.address);

    

    // update any static fields
   sentryWallet.delegatedPools = delegatePoolsStruct
   sentryWallet.ownedPools = ownedPoolsStruct
//    sentryWallet.approvedOwners 



    return sentryWallet;
}

