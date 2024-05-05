import { Address, ethereum } from "@graphprotocol/graph-ts";
import {
  StakeKeys,
  UnstakeKeys,
  PoolCreated,
  PoolFactory
} from "../generated/PoolFactory/PoolFactory"
import {
  SentryKey,
  PoolFactoryStakeKeysEvent,
  PoolFactoryUnstakeKeysEvent,
  PoolFactoryPoolCreatedEvent,
  SentryWallet,
  PoolInfo,
} from "../generated/schema"
import { updateSentryWallet } from "./utils/updateSentryWallet";
import { getInputFromEvent } from "./utils/getInputFromEvent";

export function handleStakeKeys(event: StakeKeys): void {
  //TODO update PoolInfo

  const dataToDecode = getInputFromEvent(event)
  const decoded = ethereum.decode('(address,uint256[])', dataToDecode);
  if (decoded) {
    let nodeLicenseIds = decoded.toTuple()[1].toBigIntArray();
    for (let i = 0; i < nodeLicenseIds.length; i++) {
      let sentryKey = SentryKey.load(nodeLicenseIds[i].toString())
      if (sentryKey) {
        sentryKey.assignedPool = event.params.pool
        sentryKey.save()
      }
    }
  }
}

export function handleUnstakeKeys(event: UnstakeKeys): void {
  const dataToDecode = getInputFromEvent(event)
  const decoded = ethereum.decode('(address,uint256,uint256[])', dataToDecode);
  if (decoded) {
    let nodeLicenseIds = decoded.toTuple()[2].toBigIntArray();
    for (let i = 0; i < nodeLicenseIds.length; i++) {
      let sentryKey = SentryKey.load(nodeLicenseIds[i].toString())
      if (sentryKey) {
        sentryKey.assignedPool = new Address(0)
        sentryKey.save()
      }
    }
  }
}

export function handlePoolCreated(event: PoolCreated): void {

  const pool = new PoolInfo(event.params.poolAddress.toHexString())
  pool.address = event.params.poolAddress
  pool.owner = event.params.poolOwner
  pool.save()

  let sentryWallet = SentryWallet.load(event.params.poolOwner.toHexString());

  if (sentryWallet) {
    let pools = sentryWallet.ownedPools;
    pools.push(event.params.poolAddress);
    sentryWallet.ownedPools = pools;
    sentryWallet.save();
  }

}