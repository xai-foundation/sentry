import { Address, ethereum } from "@graphprotocol/graph-ts";
import {
  StakeKeys,
  UnstakeKeys,
  PoolCreated,
  UpdatePoolDelegate
} from "../generated/PoolFactory/PoolFactory"
import {
  SentryKey,
  SentryWallet,
  PoolInfo,
} from "../generated/schema"
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

  const dataToDecode = getInputFromEvent(event)
  const decoded = ethereum.decode('(address,uint256[],uint32[3],string[3],string[],string[2][2])', dataToDecode);
  if (decoded) {
    pool.delegateAddress = decoded.toTuple()[0].toAddress();
  }
  pool.save()
}

export function handleUpdatePoolDelegate(event: UpdatePoolDelegate): void {
  const pool = PoolInfo.load(event.params.pool.toHexString())
  if(pool){
    pool.delegateAddress = event.params.delegate;
    pool.save()
  }
}
