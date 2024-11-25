import { TinyKeysAirdropAbi } from "@sentry/core";

const TINY_KEYS_AIRDROP_ADDRESS = ""; //TODO Needs to be set after tiny key airdrop contract deployment

/**
 * Mapping wallet address to nonce, to manage nonce manually
 * @type {[wallet: string] => number}
 */
const WALLET_TO_NONCE = {};

const qtyPerSegment = 2;

//Wallets to be used simultaneously
const walletCount = 10;

//NEED TO LOOK UP MAINNET VALUES ON PROD RUN
const maxFeePerGas = ethers.parseUnits('0.3', 'gwei');
const maxPriorityFeePerGas = 1n;

async function main() {

    if (!TINY_KEYS_AIRDROP_ADDRESS) {
        throw Error("TK Airdrop address needs to be set");
    }

    // get the deployer
    const signers = (await ethers.getSigners());
    const deployer = signers[0];

    console.log("Running upgrade with deployer admins");

    for (let i = 0; i < walletCount; i++) {
        const adminWalletAddress = signers[i].address;
        let nonce = await ethers.provider.getTransactionCount(adminWalletAddress, "pending");
        WALLET_TO_NONCE[adminWalletAddress] = nonce;
        console.log(`Loaded wallet at index ${i}: ${adminWalletAddress}, currentNonce: ${WALLET_TO_NONCE[adminWalletAddress]}`);

        // //Transfer funds if needed
        // await deployer.sendTransaction({
        //     to: adminWalletAddress,
        //     value: ethers.parseEther("1"),
        // });
    }

    // Get the total supply of node licenses

    const TinyKeysAirdrop = await new ethers.Contract(TINY_KEYS_AIRDROP_ADDRESS, TinyKeysAirdropAbi, deployer);

    const totalSupplyAtStart = await TinyKeysAirdrop.totalSupplyAtStart();
    const currentIndex = Number(await TinyKeysAirdrop.airdropCounter());
    console.log(`Starting Airdrop with totalSupplyAtStart ${totalSupplyAtStart} & currentIndex ${currentIndex}`);
    let nextIndex = currentIndex;

    while (nextIndex <= totalSupplyAtStart) {
        console.log(`Processing Airdrop Segment for ${qtyPerSegment} tokens beginning at token id ${nextIndex}...`);

        const beforeMint = Date.now();
        const processPromises = [];
        for (let i = 0; i < walletCount; i++) {
            processPromises.push(processTransaction(signers[i]));
        }

        const res = await Promise.allSettled(processPromises);
        console.log(`Completed ${walletCount} wallet tx in ${(Date.now() - beforeMint) / 1000} seconds`);

        if (res.some(r => r.value != "")) {
            console.log("One or more errored, waiting 10 seconds...");
            await new Promise(resolve => setTimeout(resolve, 10000));
        }

        nextIndex = Number(await TinyKeysAirdrop.airdropCounter());
    }

    console.log("Tiny Keys Airdrop Completed...");
}

const processTransaction = async (signer) => {
    const TinyKeysAirdrop = await new ethers.Contract(TINY_KEYS_AIRDROP_ADDRESS, TinyKeysAirdropAbi, signer);

    const feeData = await ethers.provider.getFeeData();

    const beforeMint = Date.now();
    try {
        const tx = await TinyKeysAirdrop.processAirdropSegmentOnlyMint(qtyPerSegment,
            {
                nonce: WALLET_TO_NONCE[signer.address],
                maxFeePerGas: maxFeePerGas < feeData.maxFeePerGas ? maxFeePerGas : feeData.maxFeePerGas,
                maxPriorityFeePerGas: maxPriorityFeePerGas,
            }
        );
        const receipt = await tx.wait();
        if (receipt.status === 1) {
            WALLET_TO_NONCE[signer.address]++;
            console.log(`Completed tx with signer ${signer.address} ${(Date.now() - beforeMint) / 1000} seconds`)
        } else {
            throw new Error('Transaction failed');
        }

    } catch (error) {
        console.log(`Failed to process with wallet: ${signer.address}`, (error && error.message ? error.message : error));
        return "Failed to process";
    }

    return "";
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
