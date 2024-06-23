import {config} from "@sentry/core";

const TINY_KEYS_AIRDROP_ADDRESS = config.tinyKeysAirdropAddress; // Needs to be set after tiny key airdrop contract deployment
const NODE_LICENSE_CONTRACT = config.nodeLicenseContract;

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());

    let nextIndex = 1;
    let totalSupply = 0;
    const qtyPerSegment = 100;

    // Get the total supply of node licenses
    const NodeLicense = await ethers.getContractFactory("NodeLicense9");
    const nodeLicense = NodeLicense.connect(NODE_LICENSE_CONTRACT);
    totalSupply = await nodeLicense.totalSupply();

    const TinyKeysAirdrop = await ethers.getContractFactory("TinyKeysAirdrop");
    const tinyKeysAirdrop =  TinyKeysAirdrop.connect(TINY_KEYS_AIRDROP_ADDRESS);

    // Connect the signer to the contract
    const tinyKeysAirdropWithSigner = tinyKeysAirdrop.connect(deployer);

    while (nextIndex <= totalSupply) {    
        console.log(`Processing Airdrop Segment for ${qtyPerSegment} tokens beginning at token id ${nextIndex}...`);
        nextIndex = await tinyKeysAirdropWithSigner.processAirdropSegment(qtyPerSegment);
    }
    console.log("Tiny Keys Airdrop Completed...");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  