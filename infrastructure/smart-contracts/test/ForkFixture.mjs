
import { config } from "@sentry/core";

describe("Fixture Tests Run on Fork of Mainnet", function () {

    // We define a fixture to reuse the same setup in every test. We use
    // loadFixture to run this setup once, snapshot that state, and reset Hardhat
    // Network to that snapshot in every test.
    async function deployForkInfrastructure() {

        // Get addresses to use in the tests
        const [
            deployer,
            challenger,
            fundsReceiver,
            refereeDefaultAdmin,
            kycAdmin,
            xaiDefaultAdmin,
            xaiMinter,
            esXaiDefaultAdmin,
            esXaiMinter,
            gasSubsidyDefaultAdmin,
            gasSubsidyTransferAdmin,
            nodeLicenseDefaultAdmin,
            addr1,
            addr2,
            addr3,
            addr4,
            operator,
        ] = await ethers.getSigners();

        // Deploy Xai
        
        const xai = await ethers.getContractAt("Xai", config.xaiAddress);
        console.log("xai", xai);
        console.log("xai", xai.address);
        // Deploy esXai
       // const EsXai = await ethers.getContractFactory("esXai3");
     //   const esXai = await EsXai.attach(config.esXaiAddress);

        // Deploy Gas Subsidy
    //    const GasSubsidy = await ethers.getContractFactory("GasSubsidy");
       // const gasSubsidy = await GasSubsidy.attach(config.gasSubsidyAddress);

		// // Deploy the Staking Pool (implementation only)
		// const StakingPool = await ethers.deployContract("StakingPool");
		// await StakingPool.waitForDeployment();
		// const stakingPoolImplAddress = await StakingPool.getAddress();
		// await extractAbi("StakingPool", StakingPool);

		// // Deploy the Key Bucket Tracker (implementation only)
		// const KeyBucketTracker = await ethers.deployContract("BucketTracker");
		// await KeyBucketTracker.waitForDeployment();
		// const keyBucketTrackerImplAddress = await KeyBucketTracker.getAddress();
		// await extractAbi("BucketTracker", KeyBucketTracker);

		// // Deploy the esXai Bucket Tracker (implementation only)
		// const EsXaiBucketTracker = await ethers.deployContract("BucketTracker");
		// await EsXaiBucketTracker.waitForDeployment();
		// const esXaiBucketTrackerImplAddress = await EsXaiBucketTracker.getAddress();

		// Deploy Referee
      //  const Referee = await ethers.getContractFactory("Referee8");
     //   const referee = await Referee.attach(config.refereeAddress);

		// Deploy Node License
	//	const NodeLicense = await ethers.getContractFactory("NodeLicense8");
      //  const nodeLicense = await NodeLicense.attach(config.nodeLicenseAddress);

        // Impersonate the rollup controller
       // const rollupController = await ethers.getImpersonatedSigner("0x6347446605e6f6680addb7c4ff55da299ecd2e69");
       // config.defaultRpcUrl = "http://localhost:8545/";

        return {
            deployer,
            addr1,
            addr2,
            addr3,
            addr4,
            //operator,
            //referee,
            //nodeLicense,
            //gasSubsidy,
           // esXai,
            xai
        };
    }

    //describe("TinyKeysTest", TinyKeysTest(deployForkInfrastructure).bind(this));


})