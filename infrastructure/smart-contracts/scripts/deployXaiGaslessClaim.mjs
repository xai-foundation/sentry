
const options = {
    starDate: Date.now(), // TODO replace for prod
    endDate: Date.now() + 180*24*60*60*1000
}

async function main() {

    const deployer = (await ethers.getSigners())[0];
    const deployerAddress = await deployer.getAddress();
    console.log("The Deployer is ", deployerAddress);

    
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});