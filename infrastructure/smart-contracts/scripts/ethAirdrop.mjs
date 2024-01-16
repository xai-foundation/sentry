import csv from "csv-parser";
import fs from "fs";

// production
const PATH_TO_TRANSFERS = "./eth-refunds.csv";

// test
// const PATH_TO_TRANSFERS = "./eth-extract-test.csv";

async function ethAirdrop() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();

    // read a list of addresses and the amount transferred
    const results = [];

    const readStream = fs.createReadStream(PATH_TO_TRANSFERS).pipe(csv());
    for await (const data of readStream) {
        const amount = parseFloat(data["Value_IN(ETH)"]);
        if (amount > 0) {
            results.push({address: data.From, amount: ethers.parseEther(amount.toString())});
        }
    }
    console.log(results);

    // calculate the sum of the amounts to be transferred
    const sum = results.reduce((acc, {amount}) => acc + amount, BigInt(0));
    console.log(`Total amount to be transferred: ${ethers.formatEther(sum)} ETH`);

    // check to see the deployer has enough funds to transfer the sum of the amounts, if it doesn't throw an error
    const deployerBalance = await ethers.provider.getBalance(deployerAddress);
    if (deployerBalance < sum) {
        throw new Error(`Deployer does not have enough funds to transfer ${sum} ETH`);
    }

    // Log the balance of the deployer after the transfer
    const remainingBalance = deployerBalance - sum;
    console.log(`Deployer will have ${ethers.formatEther(remainingBalance)} ETH after the transfer`);

    // iterate through the list of addresses and transfer the amount to each address
    for (const {address, amount} of results) {
        await deployer.sendTransaction({
            to: address,
            value: amount,
        });
        await new Promise((resolve) => setTimeout(resolve, 10000));
        console.log(`Transferred ${ethers.formatEther(amount)} ETH to ${address}`);
    }

    console.log("Airdrop complete");
    console.log("Total amount transferred: ", ethers.formatEther(sum));
    console.log("Deployer balance: ", ethers.formatEther(await ethers.provider.getBalance(deployerAddress)));
}

ethAirdrop().then((_) => {
    process.exit(0);
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
