// We define a fixture to reuse the same setup in every test. We use
// loadFixture to run this setup once, snapshot that state, and reset Hardhat
// Network to that snapshot in every test.
export async function deployInfrastructureXai() {

    // Get addresses to use in the tests
    const [
        deployer,
        addr1,
        addr2,
        addr3,
        addr4,
    ] = await ethers.getSigners();

    // Deploy Forwarder
    const Forwarder = await ethers.getContractFactory("Forwarder");
    const forwarder = await upgrades.deployProxy(Forwarder, [], { deployer: deployer });
    await forwarder.waitForDeployment();

    // Deploy Receiver
    const TestReceiver = await ethers.getContractFactory("ForwarderTestReceiver");
    const testReceiver = await TestReceiver.deploy((await forwarder.getAddress()));

    return {
        addr1,
        addr2,
        addr3,
        addr4,

        forwarder,
        testReceiver
    };
}