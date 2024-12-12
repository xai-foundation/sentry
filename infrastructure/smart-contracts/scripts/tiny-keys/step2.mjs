import { TinyKeysAirdropAbi, sendSlackNotification } from "@sentry/core";

const TINY_KEYS_AIRDROP_ADDRESS = "0x0209a0C0Abfe82916DF492D121667aCcA26C7eb0";

const slackWebHook = "";

/**
 * Mapping wallet address to nonce, to manage nonce manually
 * @type {[wallet: string] => number}
 */
const WALLET_TO_NONCE = {};

const qtyPerSegment = 2;

//Wallets to be used simultaneously
const WALLET_COUNT = 1;

// This is the hard cap on how much we are willing to pay for 
// '0.03' Will be up to $3
// '0.09' Will be up to $10 -> when the base fee goes up for much action on arb we need to set to the max value to keep sending tx
const MAX_GAS_ALLOWED = '0.033';

//NEED TO LOOK UP MAINNET VALUES ON PROD RUN
const maxFeePerGas = ethers.parseUnits(MAX_GAS_ALLOWED, 'gwei');
const maxPriorityFeePerGas = 1n;

// This is for the coolDown, currently set much higher than the MAX_GAS_ALLOWED would allow, this is mostly used for notifications
const MAX_GAS_PRICE_FOR_COOL_DOWN_START = 1753828000;
const MAX_GAS_PRICE_FOR_COOL_DOWN_END = 1603828000;

// The script will auto refund the minting wallets to this amount.
const WALLET_MIN_FUNDING = 0.5;

//The script will stop working if the main wallet (https://arbiscan.io/address/0xd20D67E2A414e8C1D56814db73E4d079CC8C8D2b) will have less funds than this
const MIN_MAIN_WALLET_BALLANCE = 3;

// Used for tracking the process speed
const NEXT_STEP = 100;
let lastStep;
let processedLastStep = Date.now();

let _signers;
let deployer;
let signers = [];

async function main() {

    if (!TINY_KEYS_AIRDROP_ADDRESS) {
        throw Error("TK Airdrop address needs to be set");
    }

    // get the deployer
    _signers = (await ethers.getSigners());
    deployer = _signers[0];
    signers = [];

    const mainWalletBalance = await ethers.provider.getBalance(deployer.address);
    console.log(`Initial balance of MAIN WALLET: ${deployer.address} = ${Number(mainWalletBalance) / 10 ** 18}`);
    console.log("Running upgrade with deployer admins");
    if (Number(mainWalletBalance) / 10 ** 18 < MIN_MAIN_WALLET_BALLANCE) {
        console.error(`Main wallet balance too low, won't continue with less than ${MIN_MAIN_WALLET_BALLANCE} ETH, current balance: ${Number(mainWalletBalance) / 10 ** 18}`);
        sendSlackNotification(slackWebHook, `Main wallet balance too low, won't continue with less than ${MIN_MAIN_WALLET_BALLANCE} ETH, current balance: ${Number(mainWalletBalance) / 10 ** 18}`)
        return "Main wallet balance too low";
    }

    await fundAndPrepareWallets();

    // Get the total supply of node licenses

    const TinyKeysAirdrop = await new ethers.Contract(TINY_KEYS_AIRDROP_ADDRESS, TinyKeysAirdropAbi, deployer);

    const totalSupplyAtStart = await TinyKeysAirdrop.totalSupplyAtStart();
    const currentIndex = Number(await TinyKeysAirdrop.airdropCounter());
    console.log(`Starting Airdrop with totalSupplyAtStart ${totalSupplyAtStart} & currentIndex ${currentIndex}`);
    let nextIndex = currentIndex;

    let errorCount = 0;

    lastStep = nextIndex;

    while (nextIndex <= totalSupplyAtStart) {
        console.log(`Processing Airdrop Segment for ${qtyPerSegment} tokens beginning at token id ${nextIndex}...`);

        let feeData = await ethers.provider.getFeeData();
        await waitForNetworkCoolDown(feeData);

        const beforeMint = Date.now();
        const processPromises = [];
        for (let i = 0; i < WALLET_COUNT; i++) {
            const maxGas = maxFeePerGas < feeData.maxFeePerGas ? maxFeePerGas : feeData.maxFeePerGas;
            processPromises.push(processTransaction(signers[i], maxGas));
        }

        const res = await Promise.allSettled(processPromises);
        await new Promise(resolve => setTimeout(resolve, 2800));
        console.log(`Completed ${WALLET_COUNT} wallet tx in ${(Date.now() - beforeMint) / 1000} seconds`);

        if (res.some(r => r.value != "")) {
            const secondsToWait = 10;
            console.log(`One or more errored, waiting ${secondsToWait} seconds...`);
            await new Promise(resolve => setTimeout(resolve, secondsToWait * 1000));
            errorCount++;
            if (errorCount > 5) {
                await fundAndPrepareWallets();
                errorCount = 0;
                // console.error("Stopping after 3 errors");
                // return "Stopping after errors";
            }
        } else {
            errorCount = 0;
        }

        nextIndex = Number(await TinyKeysAirdrop.airdropCounter());

        if (nextIndex > (lastStep + NEXT_STEP)) {
            sendSlackNotification(slackWebHook, `Completed step of ${nextIndex - lastStep} keys in ${(Date.now() - processedLastStep) / 1000} seconds`)
            console.log(`Completed step of ${nextIndex - lastStep} keys in ${(Date.now() - processedLastStep) / 1000} seconds`)
            processedLastStep = Date.now();
            lastStep = nextIndex;
        }
    }

    console.log("Tiny Keys Airdrop Completed...");
}

const processTransaction = async (signer, maxGas) => {
    const TinyKeysAirdrop = await new ethers.Contract(TINY_KEYS_AIRDROP_ADDRESS, TinyKeysAirdropAbi, signer);
    const beforeMint = Date.now();
    try {
        const tx = await TinyKeysAirdrop.processAirdropSegmentOnlyMint(qtyPerSegment,
            {
                nonce: WALLET_TO_NONCE[signer.address],
                maxFeePerGas: maxGas,
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

const fundAndPrepareWallets = async () => {
    for (let i = 1; i <= WALLET_COUNT; i++) {
        const adminWalletAddress = _signers[i].address;
        let nonce = await ethers.provider.getTransactionCount(adminWalletAddress, "pending");
        WALLET_TO_NONCE[adminWalletAddress] = nonce;
        console.log(`Loaded wallet at index ${i}: ${adminWalletAddress}, currentNonce: ${WALLET_TO_NONCE[adminWalletAddress]}`);
        signers.push(_signers[i]);

        const initialBalance = await ethers.provider.getBalance(adminWalletAddress);
        console.log(`Initial balance of: ${adminWalletAddress} = ${Number(initialBalance) / 10 ** 18}`);

        const initBalanceNum = (Number(initialBalance) / 10 ** 18)
        if (initBalanceNum < WALLET_MIN_FUNDING) {
            // Transfer funds if needed
            await deployer.sendTransaction({
                to: adminWalletAddress,
                value: ethers.parseEther((WALLET_MIN_FUNDING + 0.02 - initBalanceNum).toFixed(18)),
            });
            console.log(`Transferred funds to: ${adminWalletAddress}, ${((WALLET_MIN_FUNDING + 0.02) - initBalanceNum)}`);
        }
    }
}

const waitForNetworkCoolDown = async (feeData) => {
    console.log(`Feed price at: ${Number(feeData.maxFeePerGas)}, maxFeeAllowed: ${Number(maxFeePerGas)}, coolDown start at ${MAX_GAS_PRICE_FOR_COOL_DOWN_START}`)
    if (Number(feeData.maxFeePerGas) > MAX_GAS_PRICE_FOR_COOL_DOWN_START) {
        // sendSlackNotification(slackWebHook, `Cool down starting with feed price at: ${Number(feeData.maxFeePerGas)}, cool down start at ${MAX_GAS_PRICE_FOR_COOL_DOWN_START}, coolDown end at ${MAX_GAS_PRICE_FOR_COOL_DOWN_END}`)
        const beforeWait = Date.now();
        let coolDownCount = 0;
        while (Number(feeData.maxFeePerGas) > MAX_GAS_PRICE_FOR_COOL_DOWN_END) {
            coolDownCount++;
            console.warn(`Gas price too high, waiting for ${Number(feeData.maxFeePerGas)} to drop to ${MAX_GAS_PRICE_FOR_COOL_DOWN_END}`)
            const coolDown = 3000;
            let remainingSeconds = coolDown;
            const interval = setInterval(async () => {
                feeData = await ethers.provider.getFeeData();
                console.log(`Feed price at: ${Number(feeData.maxFeePerGas)}, maxFeeAllowed: ${MAX_GAS_PRICE_FOR_COOL_DOWN_END}`)
                console.log(`Cool down remaining ${(remainingSeconds -= 1000) / 1000}s`);
            }, 1000)
            await new Promise(resolve => setTimeout(resolve, coolDown));
            clearInterval(interval);
        }
        console.log(`Completed cool down in ${((Date.now() - beforeWait) / 1000) / 60} minutes`);
        // sendSlackNotification(slackWebHook, `Completed cool down in ${((Date.now() - beforeWait) / 1000) / 60} minutes`)
        coolDownCount = 0;
    }
}

const runtime = async () => {
    try {
        const result = await main();
        if (result == "Main wallet balance too low") {
            sendSlackNotification(slackWebHook, `<!channel> Stopping runtime, waiting restart after refunding main wallets`)
            return;
        } else if (result == "Stopping after errors") {
            console.log("Restarting after errors");
            sendSlackNotification(slackWebHook, `Restarting after tx errors`)
            runtime();
        } else {
            console.log("Runtime stopped with unknown reason: ", result);
            sendSlackNotification(slackWebHook, "Restarting runtime after stop with unknown reason: " + result)
            runtime();
        }
    } catch (error) {
        console.error("Runtime failed with error", error);
        sendSlackNotification(slackWebHook, "<!channel> Runtime failed with error: " + (error && error.message ? error.message : error))
        console.log("Restarting....")
        runtime();
    }
}

// process.on('SIGINT', async () => {
//     console.error("Main Runtime SIGINT, restarting...");
//     sendSlackNotification(slackWebHook, "Main Runtime SIGINT, restarting...");
//     runtime()
// });

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
runtime().catch((error) => {
    sendSlackNotification(slackWebHook, "Main Runtime error, restarting...");
    console.error("Main Runtime error, restarting...", error);
    runtime();
});
