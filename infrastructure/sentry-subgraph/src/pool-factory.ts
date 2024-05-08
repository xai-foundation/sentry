import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import {
  StakeKeys,
  UnstakeKeys,
  PoolCreated,
  UpdatePoolDelegate,
  StakeEsXai,
  UnstakeEsXai,
  UpdateShares,
  UpdateMetadata
} from "../generated/PoolFactory/PoolFactory"
import {
  SentryKey,
  SentryWallet,
  PoolInfo,
} from "../generated/schema"
import { getInputFromEvent } from "./utils/getInputFromEvent";

export function handleStakeKeys(event: StakeKeys): void {
  log.warning("Start StakeKeys", []);
  let pool = PoolInfo.load(event.params.pool.toHexString());
  if (pool) {
    if (pool.owner == event.params.user) {
      pool.ownerStakedKeys = pool.ownerStakedKeys.plus(event.params.amount)
    }
    pool.totalStakedKeyAmount = event.params.totalKeysStaked
    pool.save()
  }
  log.warning("End StakeKeys", []);

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

  log.warning("Start unStakeKeys", []);

  let pool = PoolInfo.load(event.params.pool.toHexString());
  if (pool) {
    if (pool.owner == event.params.user) {
      pool.ownerStakedKeys = pool.ownerStakedKeys.minus(event.params.amount)
    }
    pool.totalStakedKeyAmount = event.params.totalKeysStaked
    pool.save()
  }
  log.warning("End unStakeKeys", []);

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
  log.warning("Start Poolinfo", []);
  if (decoded) {
    let delegateAddress = decoded.toTuple()[0].toAddress();
    if (delegateAddress) {
      pool.delegateAddress = delegateAddress;
    }
    pool.metadata = decoded.toTuple()[3].toStringArray();
    pool.socials = decoded.toTuple()[4].toStringArray();
    pool.ownerShare = decoded.toTuple()[2].toBigIntArray()[0];
    pool.keyBucketShare = decoded.toTuple()[2].toBigIntArray()[1];
    pool.stakedBucketShare = decoded.toTuple()[2].toBigIntArray()[2];
    pool.totalStakedKeyAmount = BigInt.fromI32(decoded.toTuple()[1].toBigIntArray().length);
    pool.ownerStakedKeys = BigInt.fromI32(decoded.toTuple()[1].toBigIntArray().length);
    pool.save()
  }
  log.warning("End Poolinfo", []);

}

export function handleUpdatePoolDelegate(event: UpdatePoolDelegate): void {
  const pool = PoolInfo.load(event.params.pool.toHexString())
  if (pool) {
    pool.delegateAddress = event.params.delegate;
    pool.save()
  }
}

export function handleStakeEsXai(event: StakeEsXai): void {
  const pool = PoolInfo.load(event.params.pool.toHexString())
  log.warning("Start StakeEsXai", []);
  if (pool) {
    pool.totalStakedEsXaiAmount = event.params.totalEsXaiStaked
    pool.save()
  }
  log.warning("End StakeEsXai", []);
}

export function handleUnstakeEsXai(event: UnstakeEsXai): void {
  const pool = PoolInfo.load(event.params.pool.toHexString())
  log.warning("Start unStakeEsXai", []);
  if (pool) {
    pool.totalStakedEsXaiAmount = event.params.totalEsXaiStaked
    pool.save()
  }
  log.warning("End unStakeEsXai", []);
}

export function handleUpdateMetadata(event: UpdateMetadata): void {
  const pool = PoolInfo.load(event.params.pool.toHexString())
  log.warning("Start UpdateMetadata", []);

  const dataToDecode = getInputFromEvent(event)
  const decoded = ethereum.decode('(address,string[3],string[])', dataToDecode);

  if (decoded) {
    if (pool) {
      pool.metadata = decoded.toTuple()[1].toStringArray();
      pool.socials = decoded.toTuple()[2].toStringArray();
      pool.save()
    }
    log.warning("End UpdateMetadata", []);
  }
}

// export function handleUpdateShares(event: UpdateShares): void {
//   const pool = PoolInfo.load(event.params.pool.toHexString())
//   log.warning("Start unStakeEsXai", []);
//   if(pool){
//     const dataToDecode = getInputFromEvent(event)
//     const decoded = ethereum.decode('(address,uint32[3])', dataToDecode);
//     if(decoded){
//       pool. = event.params.totalEsXaiStaked
//       pool.save()
//     }
//   }
//   log.warning("End unStakeEsXai", []);
// }