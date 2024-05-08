import { Address, BigInt, ethereum, log } from "@graphprotocol/graph-ts";
import {
  StakeKeys,
  UnstakeKeys,
  PoolCreated,
  UpdatePoolDelegate,
  StakeEsXai,
  UnstakeEsXai,
  UpdateShares,
  UpdateMetadata,
  UnstakeRequestStarted,
  PoolFactory,
} from "../generated/PoolFactory/PoolFactory"
import {
  SentryKey,
  PoolInfo,
  UnstakeRequest,
} from "../generated/schema"
import { getInputFromEvent } from "./utils/getInputFromEvent";
import { getTxSignatureFromEvent } from "./utils/getTxSignatureFromEvent";

export function handleStakeKeys(event: StakeKeys): void {

  let pool = PoolInfo.load(event.params.pool.toHexString());
  if (pool) {
    if (pool.owner == event.params.user) {
      pool.ownerStakedKeys = pool.ownerStakedKeys.plus(event.params.amount)
    }
    pool.totalStakedKeyAmount = event.params.totalKeysStaked

    if (pool.updateSharesTimestamp && pool.pendingShares && pool.updateSharesTimestamp.ge(event.block.timestamp)) {
      pool.ownerShare = pool.pendingShares[0];
      pool.keyBucketShare = pool.pendingShares[1];
      pool.stakedBucketShare = pool.pendingShares[2];

      pool.updateSharesTimestamp = BigInt.fromI32(0);
      pool.pendingShares = [BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0)];
    }

    pool.save()
  }

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

  let pool = PoolInfo.load(event.params.pool.toHexString());
  if (pool) {
    if (pool.owner == event.params.user) {
      pool.ownerStakedKeys = pool.ownerStakedKeys.minus(event.params.amount)
    }
    pool.totalStakedKeyAmount = event.params.totalKeysStaked

    if (pool.updateSharesTimestamp && pool.pendingShares && pool.updateSharesTimestamp.ge(event.block.timestamp)) {
      pool.ownerShare = pool.pendingShares[0];
      pool.keyBucketShare = pool.pendingShares[1];
      pool.stakedBucketShare = pool.pendingShares[2];

      pool.updateSharesTimestamp = BigInt.fromI32(0);
      pool.pendingShares = [BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0)];
    }

    pool.save()
  }

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
    pool.ownerRequestedUnstakeKeyAmount = BigInt.fromI32(0);
    pool.updateSharesTimestamp = BigInt.fromI32(0);
    pool.pendingShares = [BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0)];
    pool.save()
  }
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
  if (pool) {
    pool.totalStakedEsXaiAmount = event.params.totalEsXaiStaked

    if (pool.updateSharesTimestamp && pool.pendingShares && pool.updateSharesTimestamp.ge(event.block.timestamp)) {
      pool.ownerShare = pool.pendingShares[0];
      pool.keyBucketShare = pool.pendingShares[1];
      pool.stakedBucketShare = pool.pendingShares[2];

      pool.updateSharesTimestamp = BigInt.fromI32(0);
      pool.pendingShares = [BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0)];
    }

    pool.save()
  }
}

export function handleUnstakeEsXai(event: UnstakeEsXai): void {
  const pool = PoolInfo.load(event.params.pool.toHexString())
  if (pool) {
    pool.totalStakedEsXaiAmount = event.params.totalEsXaiStaked

    if (pool.updateSharesTimestamp && pool.pendingShares && pool.updateSharesTimestamp.ge(event.block.timestamp)) {
      pool.ownerShare = pool.pendingShares[0];
      pool.keyBucketShare = pool.pendingShares[1];
      pool.stakedBucketShare = pool.pendingShares[2];

      pool.updateSharesTimestamp = BigInt.fromI32(0);
      pool.pendingShares = [BigInt.fromI32(0), BigInt.fromI32(0), BigInt.fromI32(0)];
    }

    pool.save()
  }
}

export function handleUpdateMetadata(event: UpdateMetadata): void {
  const pool = PoolInfo.load(event.params.pool.toHexString())

  const dataToDecode = getInputFromEvent(event)
  const decoded = ethereum.decode('(address,string[3],string[])', dataToDecode);

  if (decoded) {
    if (pool) {
      pool.metadata = decoded.toTuple()[1].toStringArray();
      pool.socials = decoded.toTuple()[2].toStringArray();
      pool.save()
    }
  }
}

export function handleUpdatePendingShares(event: UpdateShares): void {
  const pool = PoolInfo.load(event.params.pool.toHexString());
  const poolfactory = PoolFactory.bind(event.address);
  log.warning("Start UpdateShares", []);
  if (pool) {
    const dataToDecode = getInputFromEvent(event)
    const decoded = ethereum.decode('(address,uint32[3])', dataToDecode);
    if (decoded) {
      pool.pendingShares = decoded.toTuple()[0].toBigIntArray();
      pool.updateSharesTimestamp = event.block.timestamp.plus(poolfactory.updateRewardBreakdownDelayPeriod());
      pool.save()
    }
  }
  log.warning("End UpdateShares", []);
}

export function handleUnstakeRequest(event: UnstakeRequestStarted): void {
  const pool = PoolInfo.load(event.params.pool.toHexString())

  const unstakeRequest = new UnstakeRequest(event.params.pool.toHexString() + event.params.user.toHexString() + event.params.index.toHexString())
  const poolfactory = PoolFactory.bind(event.address);

  unstakeRequest.user = event.params.user
  unstakeRequest.pool = event.params.pool
  unstakeRequest.index = event.params.index
  unstakeRequest.amount = event.params.amount
  unstakeRequest.isKey = event.params.isKey
  unstakeRequest.open = false
  unstakeRequest.completeTime = BigInt.fromI32(0)

  if (event.params.isKey) {

    //IF owner
    if (pool && pool.owner == event.params.user && pool.ownerRequestedUnstakeKeyAmount) {

      if (getTxSignatureFromEvent(event) == "0xfe407a92") {
        //It is genesis key unstake request
        unstakeRequest.lockTime = event.block.timestamp.plus(poolfactory.unstakeGenesisKeyDelayPeriod())
        pool.ownerRequestedUnstakeKeyAmount = event.params.amount
        pool.ownerLatestUnstakeRequestCompletionTime = event.block.timestamp.plus(poolfactory.unstakeGenesisKeyDelayPeriod())
      } else {
        if (pool.ownerRequestedUnstakeKeyAmount) {
          pool.ownerRequestedUnstakeKeyAmount = pool.ownerRequestedUnstakeKeyAmount.plus(event.params.amount)
          pool.ownerLatestUnstakeRequestCompletionTime = event.block.timestamp.plus(poolfactory.unstakeKeysDelayPeriod())
        } else {
          pool.ownerRequestedUnstakeKeyAmount = event.params.amount
          pool.ownerLatestUnstakeRequestCompletionTime = event.block.timestamp.plus(poolfactory.unstakeKeysDelayPeriod())
        }
        unstakeRequest.lockTime = event.block.timestamp.plus(poolfactory.unstakeKeysDelayPeriod())
      }
      pool.save()
    }


  } else {
    unstakeRequest.lockTime = event.block.timestamp.plus(poolfactory.unstakeEsXaiDelayPeriod())

  }
  unstakeRequest.save()
}

// export function handleUpdateDelayPeriods(event: UpdateDelayPeriods) {

//   const config = new PoolConfig(event.transaction.hash.concatI32(event.logIndex.toI32()));

//   const dataToDecode = getInputFromEvent(event)
//   const decoded = ethereum.decode('(uint256,uint256,uint256,uint256)', dataToDecode);

//   if(decoded) {
//     config.unstakeKeysDelayPeriod = decoded.toTuple()[0].toBigInt();
//     config.unstakeGenesisKeyDelayPeriod = decoded.toTuple()[1].toBigInt();
//     config.unstakeEsXaiDelayPeriod = decoded.toTuple()[2].toBigInt();
//     config.updateRewardBreakdownDelayPeriod = decoded.toTuple()[3].toBigInt();
//     config.save();
//   }
// }