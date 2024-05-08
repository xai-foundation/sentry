import { crypto, Bytes, BigInt, ByteArray } from "@graphprotocol/graph-ts";

function padToBytes32(bytes: ByteArray): ByteArray {
    let length = bytes.length;
    if (length == 32) return bytes; // Return original if already 32 bytes

    let result = new Uint8Array(32); // Create a new 32 byte array, filled with 0s
    result.set(bytes, 32 - length); // Set original bytes at the end, right aligned
    return Bytes.fromUint8Array(result); // Convert back to Bytes type
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

export function checkIfSubmissionEligible(
    nodeLicenseId: BigInt,
    challengeId: BigInt,
    confirmData: Bytes,
    challengerSignedHash: Bytes,
    boostFactor: BigInt,
    refereeVersion: BigInt
): boolean {
    // Convert BigInt to a byte array (32 bytes each)
    let nodeLicenseIdBytes = padToBytes32(Bytes.fromBigInt(nodeLicenseId));
    let challengeIdBytes = padToBytes32(Bytes.fromBigInt(challengeId));

    // Concatenate all byte arrays
    let packedData = concatBytes([
        nodeLicenseIdBytes,
        challengeIdBytes,
        confirmData,
        challengerSignedHash
    ]);

    // Compute keccak256 hash of the packed data
    const assertionHash = crypto.keccak256(packedData);
    const assertionHashNumber = BigInt.fromByteArray(assertionHash)

    if (refereeVersion.equals(BigInt.fromI32(1))) {
        return assertionHashNumber.mod(BigInt.fromI32(100)).equals(BigInt.fromI32(0));
    }

    if (refereeVersion.equals(BigInt.fromI32(2))) {
        return assertionHashNumber.mod(BigInt.fromI32(100)).lt(boostFactor);
    }

    return assertionHashNumber.mod(BigInt.fromI32(10_000)).lt(boostFactor);
}
