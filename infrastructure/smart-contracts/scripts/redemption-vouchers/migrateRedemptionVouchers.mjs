import { config } from "@sentry/core";

async function main() {

    // get the deployer
    const [deployer] = (await ethers.getSigners());
    const deployerAddress = await deployer.getAddress();
    console.log("deployerAddress", deployerAddress);

    console.log("Starting redemption migration...");
    const esXai = await ethers.getContractFactory("esXai4");
    const esXaiInstance = await new ethers.Contract(config.esXaiAddress, esXai.interface, deployer);

    // Step 1: Determine How Many Redemptions Can be Processed in a Single Transaction
    // Step 2: Retrieve a large block of redemption vouchers from the subgraph

    // Step 3: Process the redemption vouchers in batches of the maximum size
    // Step 4: Wait for the transaction to be mined
    // Step 5: Repeat steps 2-4 until all redemption vouchers have been processed

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});





function getConvertibleRedemptions() {
    const query = gql`
        query getRedemptions($first: Int, $skip: Int) {
            redemptionVouchers(first: $first, skip: $skip, where: {redeemed: false}) {
                id
                amount
                user
            }
        }
    `;
    const variables = {
        first: 1000,
        skip: 0
    };
    return request(config.subgraphUrl, query, variables);
}   
    
        