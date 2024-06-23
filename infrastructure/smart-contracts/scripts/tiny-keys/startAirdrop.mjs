import {config} from "@sentry/core";

const TINY_KEYS_AIRDROP_ADDRESS = config.tinyKeysAirdropAddress; // Needs to be set after deployment

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());
  
    // Activate tiny keys airdrop
    console.log("Activating Tiny Keys Airdrop...");
    const TinyKeysAirdrop = await ethers.getContractFactory("TinyKeysAirdrop");
    const tinyKeysAirdrop =  TinyKeysAirdrop.connect(TINY_KEYS_AIRDROP_ADDRESS);

    // Connect the signer to the contract
    const tinyKeysAirdropWithSigner = tinyKeysAirdrop.connect(deployer);

    await tinyKeysAirdropWithSigner.startAirdrop();
    console.log("Tiny Keys Airdrop Started...");    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  