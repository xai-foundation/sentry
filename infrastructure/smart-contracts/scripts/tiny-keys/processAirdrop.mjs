import {config, TinyKeysAirdropAbi} from "@sentry/core";

const TINY_KEYS_AIRDROP_ADDRESS = config.tinyKeysAirdropAddress; //TODO Needs to be set after tiny key airdrop contract deployment

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());

    const qtyPerSegment = 2;

    // Get the total supply of node licenses

    const TinyKeysAirdrop = await new ethers.Contract(TINY_KEYS_AIRDROP_ADDRESS, TinyKeysAirdropAbi, deployer);
    
    const totalSupplyAtStart = await TinyKeysAirdrop.totalSupplyAtStart();
    const currentIndex = Number(await TinyKeysAirdrop.airdropCounter());
    let nextIndex = currentIndex;

    while (nextIndex <= totalSupplyAtStart) {
        console.log(`Processing Airdrop Segment for ${qtyPerSegment} tokens beginning at token id ${nextIndex}...`);
        try {
            await TinyKeysAirdrop.processAirdropSegmentOnlyMint(qtyPerSegment);
            //TODO we should be running this from multiple wallets so we don't get errors for tx nonce or tx queue then remove that timeout
            await new Promise((resolve)=> setTimeout(resolve, 100));
            await TinyKeysAirdrop.processAirdropSegmentOnlyStake(qtyPerSegment);
            nextIndex += qtyPerSegment
        } catch (error) {
            console.error("Tiny Keys Airdrop error", error);
            return;
        }
    }
    console.log("Tiny Keys Airdrop Completed...");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  