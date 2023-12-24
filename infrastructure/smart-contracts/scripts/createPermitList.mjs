import fs from "fs";

const PATH_TO_CLAIM_AMOUNTS = "./wallet-xai-drop.json";

async function main() {
    const deployer = (await ethers.getSigners())[0];
    const deployerAddress = await deployer.getAddress();

    // read the file of amounts
    const claimAmounts = JSON.parse(fs.readFileSync(PATH_TO_CLAIM_AMOUNTS, 'utf8'));

    // create list of permits

    // save permit list file into the web public directory

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
  