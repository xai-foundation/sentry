import {config, TinyKeysAirdropAbi, NodeLicenseAbi} from "@sentry/core";

const TINY_KEYS_AIRDROP_ADDRESS = config.tinyKeysAirdropAddress; // Needs to be set after tiny key airdrop contract deployment
const NODE_LICENSE_CONTRACT = config.nodeLicenseContract;

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());

    let nextIndex = 1;
    let totalSupply = 0;
    const qtyPerSegment = 100;

    // Get the total supply of node licenses
    const NodeLicense = await new ethers.Contract(NODE_LICENSE_CONTRACT, NodeLicenseAbi, deployer);
    totalSupply = await NodeLicense.totalSupply();

    const TinyKeysAirdrop = await new ethers.Contract(TINY_KEYS_AIRDROP_ADDRESS, TinyKeysAirdropAbi, deployer);

    while (nextIndex <= totalSupply) {    
        console.log(`Processing Airdrop Segment for ${qtyPerSegment} tokens beginning at token id ${nextIndex}...`);
        nextIndex = await TinyKeysAirdrop.processAirdropSegment(qtyPerSegment);
    }
    console.log("Tiny Keys Airdrop Completed...");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  