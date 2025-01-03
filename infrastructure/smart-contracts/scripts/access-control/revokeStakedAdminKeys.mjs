import hardhat from "hardhat";
const { ethers } = hardhat;
import { config } from "@sentry/core";

// Run with npx hardhat run scripts/access-control/revokeStakedAdminKeys.mjs --network arbitrumSepolia

const PRIVATE_KEY = "0xPrivateKeyHere";
const ACCOUNT_TO_REVOKE = "0xAccountAddressHere";

async function main() {
    const provider = ethers.provider; // Use the provider from Hardhat
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    // ABI fragment for PoolFactory2
    const abiFragment = [
        "function revokeStakeKeysAdminRole(address account) external"
    ];
    
    // Attach to the PoolFactory contract
    const contract = new ethers.Contract(config.poolFactoryAddress, abiFragment, signer);

    console.log(`Changing ownership...`);
    const tx = await contract.revokeStakeKeysAdminRole(ACCOUNT_TO_REVOKE);
    
    // Get tx receipt and check status
    const rec = await tx.wait();
    if (rec.status) {
        console.log(`Successfully revoked. TxHash: ${tx.hash}`);
    } else {
        console.log(`Failed to revoke. TxHash: ${tx.hash}`);
    }

    console.log("Revoke process completed.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});