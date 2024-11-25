import { config, NodeLicenseAbi, TinyKeysAirdropAbi } from "@sentry/core";

const TINY_KEYS_AIRDROP_ADDRESS = "0x0"; //TODO Needs to be set after tiny key airdrop contract deployment

/**
 * Mapping wallet address to nonce, to manage nonce manually
 * @type {[wallet: string] => number}
 */
const WALLET_TO_NONCE = {};

const qtyPerSegment = 2;

//Wallets to be used simultaneously
const walletCount = 10;

async function main() {

    const NODE_LICENSE_ADDRESS = config.nodeLicenseAddress;

    // get the deployer
    const signers = (await ethers.getSigners());
    const deployer = signers[0];

    console.log("Running upgrade with deployer admins");

    for (let i = 0; i < walletCount; i++) {
        const adminWalletAddress = signers[i].address;
        let nonce = await ethers.provider.getTransactionCount(adminWalletAddress, "pending");
        WALLET_TO_NONCE[adminWalletAddress] = nonce;
        console.log(`Loaded wallet at index ${i}: ${adminWalletAddress}`);
    }

    // Get the total supply of node licenses

    const TinyKeysAirdrop = await new ethers.Contract(TINY_KEYS_AIRDROP_ADDRESS, TinyKeysAirdropAbi, deployer);

    const totalSupplyAtStart = await TinyKeysAirdrop.totalSupplyAtStart();
    const currentIndex = Number(await TinyKeysAirdrop.stakeCounter());
    let nextIndex = currentIndex;

    while (nextIndex <= totalSupplyAtStart) {
        console.log(`Processing Airdrop Segment for ${qtyPerSegment} tokens beginning at token id ${nextIndex}...`);

        const beforeMint = Date.now();
        const processPromises = [];
        for (let i = 0; i < walletCount; i++) {
            processPromises.push(processTransaction(signers[i]));
        }

        await Promise.allSettled(processPromises);
        console.log(`Completed ${walletCount} wallet tx in ${(Date.now() - beforeMint) / 1000} seconds`)
        nextIndex = Number(await TinyKeysAirdrop.stakeCounter());
    }

    console.log("Tiny Keys Airdrop Completed, calling completeAirDrop...");
    await TinyKeysAirdrop.completeAirDrop();
    
    const NodeLicense = await new ethers.Contract(NODE_LICENSE_ADDRESS, NodeLicenseAbi, deployer);
    await NodeLicense.revokeRole(await NodeLicense.AIRDROP_ADMIN_ROLE(), TINY_KEYS_AIRDROP_ADDRESS);
    console.log("Revoked Role on NodeLicense");
    console.log("Tiny Keys Airdrop Completed, minting and staking enabled, pricing tiers updated");
}

const processTransaction = async (signer) => {
    const TinyKeysAirdrop = await new ethers.Contract(TINY_KEYS_AIRDROP_ADDRESS, TinyKeysAirdropAbi, signer);
    const beforeMint = Date.now();
    try {
        await TinyKeysAirdrop.processAirdropSegmentOnlyStake(qtyPerSegment, { nonce: WALLET_TO_NONCE[signer.address] });
        WALLET_TO_NONCE[signer.address]++;
        console.log(`Completed tx with signer ${signer.address} ${(Date.now() - beforeMint) / 1000} seconds`)
    } catch (error) {
        console.log(`Failed to process with wallet: ${signer.address}`, error);
    }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
