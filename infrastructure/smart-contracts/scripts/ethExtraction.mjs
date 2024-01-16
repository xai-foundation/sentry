
// production
const nonceTarget = 23;

// test
// const nonceTarget = 3; 

async function ethExtractor() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();

    // check to make sure the deployer address is below the nonce target
    let deployerNonce = await ethers.provider.getTransactionCount(deployerAddress);
    if (deployerNonce > nonceTarget) {
        throw new Error(`Deployer nonce is ${deployerNonce}, which is greater than the target nonce of ${nonceTarget}. Unable to recover the eth.`);
    }

    // perform transactions of sending 1 wei to get the nonce up to the nonceTarget
    for (let i = deployerNonce; i < nonceTarget; i++) {
        await deployer.sendTransaction({ to: deployerAddress, value: 1 });
        await new Promise((resolve) => setTimeout(resolve, 10000));
        console.log(`Transaction ${i + 1} of ${nonceTarget} completed.`);
    }

    await new Promise((resolve) => setTimeout(resolve, 30000));

    // confirm the nonce is at the target
    deployerNonce = await ethers.provider.getTransactionCount(deployerAddress);
    if (deployerNonce !== nonceTarget) {
        throw new Error(`Deployer nonce is ${deployerNonce}, which is not equal to the target nonce of ${nonceTarget}. Unable to recover the eth.`);
    }

    // deploy the eth extractor
    const ethExtractorFactory = await ethers.getContractFactory("EthExtractor");
    const ethExtractor = await ethExtractorFactory.deploy({ nonce: nonceTarget });
    await ethExtractor.deploymentTransaction();
    console.log("EthExtractor deployed to:", await ethExtractor.getAddress());

    // log the balance before the extraction to the deployer
    const deployerBalance = await ethers.provider.getBalance(deployerAddress);
    console.log("Deployer balance before transaction:", ethers.formatEther(deployerBalance));

    // withdraw the eth into the deployer address
    await ethExtractor.extractETH(deployerAddress);

    // log the balance of the transaction after the extraction
    const deployerBalanceAfter = await ethers.provider.getBalance(deployerAddress);
    console.log("Deployer balance after transaction:", ethers.formatEther(deployerBalanceAfter));

    // calculate and log the amount of eth extracted
    const ethExtracted = deployerBalanceAfter - deployerBalance;
    console.log("Amount of ETH extracted:", ethers.formatEther(ethExtracted));

    return ethExtractor.address;
}

ethExtractor().then((_) => {
    process.exit(0);
}).catch((error) => {
    console.error(error);
    process.exit(1);
});
