import hardhat from "hardhat";
const { ethers } = hardhat;
import { config } from "@sentry/core";

// Run with npx hardhat run scripts/access-control/updateBeaconProxyAdmin.mjs --network arbitrumSepolia

const PRIVATE_KEY = "0xPrivateKeyHere";
const NEW_OWNER_ACCOUNT = "0xAccountAddressHere";
const POOL_BEACON_ADDRESS = "0xPoolBeaconAddressHere";

async function main() {
    // const [signer] = (await ethers.getSigners());
    const provider = ethers.provider; // Use the provider from Hardhat
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    // ABI fragment for PoolBeacon
    const abiFragment = [
        "function transferOwnership(address newOwner) public"
    ];
    
    // Attach to the PoolBeacon contract
    const contract = new ethers.Contract(POOL_BEACON_ADDRESS, abiFragment, signer);

    console.log(`Changing ownership...`);
    const tx = await contract.transferOwnership(NEW_OWNER_ACCOUNT);
    
    // Get tx receipt and check status
    const rec = await tx.wait();
    if (rec.status) {
        console.log(`Successfully revoked. TxHash: ${tx.hash}`);
    } else {
        console.log(`Failed to revoke. TxHash: ${tx.hash}`);
    }

    console.log("Ownership transfer process completed.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});