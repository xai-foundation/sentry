import { crypto, Bytes, BigInt, ByteArray } from "@graphprotocol/graph-ts";

function padToBytes32(value: BigInt): Bytes {
    let bytes = Bytes.fromBigInt(value);
    let result = new Uint8Array(32);
    let start = 32 - bytes.length;

    for (let i = 0; i < bytes.length; i++) {
        result[start + bytes.length - 1 - i] = bytes[i]; // Reverse the bytes into the result
    }

    return Bytes.fromUint8Array(result); // Convert Uint8Array back to Bytes
}

function concatBytes(arrays: ByteArray[]): Bytes {
    let totalLength = 0;
    for (let i = 0; i < arrays.length; i++) {
        totalLength += arrays[i].length;
    }

    let result = new Uint8Array(totalLength);
    let offset = 0;

    for (let i = 0; i < arrays.length; i++) {
        result.set(arrays[i], offset);
        offset += arrays[i].length;
    }

    return Bytes.fromUint8Array(result);
}

function reverseBytes(bytes: ByteArray): Bytes {
    let result = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
        result[i] = bytes[bytes.length - 1 - i];
    }
    return Bytes.fromUint8Array(result);
}

export function checkIfSubmissionEligible(
    nodeLicenseId: BigInt,
    challengeId: BigInt,
    confirmData: Bytes,
    challengerSignedHash: Bytes,
    boostFactor: BigInt,
    refereeVersion: BigInt
): boolean {

    let nodeLicenseIdBytes = padToBytes32(nodeLicenseId);
    let challengeIdBytes = padToBytes32(challengeId);
    let encoded = concatBytes([nodeLicenseIdBytes, challengeIdBytes, confirmData, challengerSignedHash]);

    const assertionHash = crypto.keccak256(encoded);
    let reversedBytes = reverseBytes(assertionHash);
    const assertionHashNumber = BigInt.fromUnsignedBytes(reversedBytes)
    
    if (refereeVersion.equals(BigInt.fromI32(1))) {
        return assertionHashNumber.mod(BigInt.fromI32(100)).equals(BigInt.fromI32(0));
    }

    if (refereeVersion.equals(BigInt.fromI32(2))) {
        return assertionHashNumber.mod(BigInt.fromI32(100)).lt(boostFactor);
    }

    return assertionHashNumber.mod(BigInt.fromI32(10_000)).lt(boostFactor);
}
