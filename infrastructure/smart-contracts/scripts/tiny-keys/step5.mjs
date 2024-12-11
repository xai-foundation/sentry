import { config, NodeLicenseAbi, TinyKeysAirdropAbi } from "@sentry/core";

const TINY_KEYS_AIRDROP_ADDRESS = "0x0209a0C0Abfe82916DF492D121667aCcA26C7eb0";
const NODE_LICENSE_ADDRESS = config.nodeLicenseAddress;

async function main() {

    // get the deployer
    const signers = (await ethers.getSigners());
    const deployer = signers[0];

    console.log("Running upgrade with deployer admins");
    const TinyKeysAirdrop = await new ethers.Contract(TINY_KEYS_AIRDROP_ADDRESS, TinyKeysAirdropAbi, deployer);

    console.log("Tiny Keys Airdrop Completed, calling completeAirDrop...");
    await TinyKeysAirdrop.completeAirDrop();
    
    const NodeLicense = await new ethers.Contract(NODE_LICENSE_ADDRESS, NodeLicenseAbi, deployer);
    await NodeLicense.revokeRole(await NodeLicense.AIRDROP_ADMIN_ROLE(), TINY_KEYS_AIRDROP_ADDRESS);
    console.log("Revoked Role on NodeLicense");
    console.log("Tiny Keys Airdrop Completed, staking enabled, pricing tiers updated");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
