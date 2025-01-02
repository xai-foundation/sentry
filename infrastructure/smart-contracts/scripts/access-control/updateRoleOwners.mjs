import hardhat from "hardhat";
const { ethers } = hardhat;
import { config } from "@sentry/core";

// Run with npx hardhat run scripts/access-control/updateRoleOwners.mjs --network arbitrumSepolia

const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
const POOL_ADMIN = "0x12ad05bde78c5ab75238ce885307f96ecd482bb402ef831f99e7018a0f169b7b";
const MINTER_ROLE = "0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6";
const CHALLENGER_ROLE = "0xe752add323323eb13e36c71ee508dfd16d74e9e4c4fd78786ba97989e5e13818";
const KYC_ADMIN_ROLE = "0x811427a0fa4932aef534bba16bc34e9b7b2d7d2a79c475fca1765f6cc1faebea";
const AIRDROP_ADMIN_ROLE = "0x786fcfa0099ab9aba15d4b2ccc7ffa9994e7c522c9b340b95e584749e47fcfb9";
const ADMIN_MINT_ROLE = "0x507caaa5b2a5a027bc340a5334d9220583b7d60d846ee2aabc76e37d69a7253b";
const TRANSFER_ROLE = "0x8502233096d909befbda0999bb8ea2f3a6be3c138b9fbf003752a4c8bce86f6c";
const STAKE_KEYS_ADMIN_ROLE = "0x4744ee11e24f5fc5de82fa6dba03b134899d8fd3405c7e9a26e120c89c8d9c28";

const GRANT_ROLE = "grantRole";
const REVOKE_ROLE = "revokeRole";
const RENOUNCE_ROLE = "renounceRole"; //NOTE: only needed if removing role from self, otherwise revoke

//NOTE: grant new roles first, then revoke old roles
const JOBS_TO_RUN = [
    //grants
    {
        contract: config.poolFactoryAddress, //contract to call
        role: DEFAULT_ADMIN_ROLE, //role being granted/revoked/renounced
        func: GRANT_ROLE, //function to call
        account: "0xAccountAddressHere" //account to grant/revoke/renounce
    },
    {
        contract: config.refereeCalculationsAddress,
        role: DEFAULT_ADMIN_ROLE,
        func: GRANT_ROLE,
        account: "0xAccountAddressHere"
    },
    //revokes
    {
        contract: config.esXaiAddress,
        role: DEFAULT_ADMIN_ROLE,
        func: REVOKE_ROLE,
        account: "0xAccountAddressHere"
    },
    {
        contract: config.gasSubsidyAddress,
        role: DEFAULT_ADMIN_ROLE,
        func: REVOKE_ROLE,
        account: "0xAccountAddressHere"
    },
    {
        contract: config.gasSubsidyAddress,
        role: TRANSFER_ROLE,
        func: REVOKE_ROLE,
        account: "0xAccountAddressHere"
    },
    {
        contract: config.poolFactoryAddress,
        role: DEFAULT_ADMIN_ROLE,
        func: REVOKE_ROLE,
        account: "0xAccountAddressHere"
    },
    {
        contract: config.poolFactoryAddress,
        role: STAKE_KEYS_ADMIN_ROLE,
        func: REVOKE_ROLE,
        account: "0xAccountAddressHere"
    },
    {
        contract: config.refereeAddress,
        role: DEFAULT_ADMIN_ROLE,
        func: REVOKE_ROLE,
        account: "0xAccountAddressHere"
    },
    {
        contract: config.refereeCalculationsAddress,
        role: DEFAULT_ADMIN_ROLE,
        func: REVOKE_ROLE,
        account: "0xAccountAddressHere"
    },
    {
        contract: config.nodeLicenseAddress,
        role: DEFAULT_ADMIN_ROLE,
        func: REVOKE_ROLE,
        account: "0xAccountAddressHere"
    },
    {
        contract: config.xaiGaslessClaimAddress,
        role: DEFAULT_ADMIN_ROLE,
        func: REVOKE_ROLE,
        account: "0xAccountAddressHere"
    },
    {
        contract: config.xaiRedEnvelope2024Address,
        role: DEFAULT_ADMIN_ROLE,
        func: REVOKE_ROLE,
        account: "0xAccountAddressHere"
    },
    // Add more jobs to run here...
];

const PRIVATE_KEY = "0xPrivateKeyHere";

async function main() {
    // const [signer] = (await ethers.getSigners());
    const provider = ethers.provider; // Use the provider from Hardhat
    const signer = new ethers.Wallet(PRIVATE_KEY, provider);

    // ABI fragment for AccessControlUpgradeable
    const abiFragment = [
        "function revokeRole(bytes32 role, address account) external",
        "function grantRole(bytes32 role, address account) external",
        "function renounceRole(bytes32 role, address account) external"
    ];

    // Iterate over the list and execute jobs
    for (const job of JOBS_TO_RUN) {
        // Attach to the contract
        const contract = new ethers.Contract(job.contract, abiFragment, signer);

        let tx;
        let rec;

        try {
            console.log(`${job.func} ${job.role} for address: ${job.account} on contract ${job.contract}`);
        
            //switch on job function
            switch (job.func) {
                case REVOKE_ROLE:
                    tx = await contract.revokeRole(job.role, job.account);
                    break;
                case RENOUNCE_ROLE:
                    tx = await contract.renounceRole(job.role, job.account);
                    break;
                case GRANT_ROLE:
                    tx = await contract.grantRole(job.role, job.account);
                    break;
                default:
                    console.log(`Job function not recognized. Skipping...`);
                    continue;
            }
            
            // Get tx receipt and check status
            rec = await tx.wait();
            if (rec.status) {
                console.log(`Successfully executed job: ${tx.hash}`);
            } else {
                console.log(`Failed to get tx status: ${tx.hash}`);
            }
            
        } catch (error) {
            console.error(`Failed to execute job:`, error);
        }
    }

    console.log("Role updating process completed.");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});