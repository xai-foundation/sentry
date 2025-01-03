import hardhat from "hardhat";
const { ethers } = hardhat;

// Run with npx hardhat run scripts/access-control/updateBeaconProxyAdmin.mjs --network arbitrumSepolia

//set these variables before running
const PRIVATE_KEY = "0xPrivateKeyHere";
const NEW_OWNER_ACCOUNT = "0xAccountAddressHere";
const PROXY_ADMIN_ADDRESS = "0xProxyAdminAddressHere";

async function main() {
    // const [signer] = (await ethers.getSigners());
    const provider = ethers.provider; // Use the provider from Hardhat
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    // ABI fragment for ProxyAdmin contract
    const abiFragment = [
        "function transferOwnership(address newOwner) public"
    ];
    
    // Attach to the ProxyAdmin contract
    const contract = new ethers.Contract(PROXY_ADMIN_ADDRESS, abiFragment, signer);

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