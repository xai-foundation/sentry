const address = "0xbc14d8563b248B79689ECbc43bBa53290e0b6b66";

async function main() {
    const NodeLicense2 = await ethers.getContractFactory("NodeLicense2");
    await upgrades.upgradeProxy(address, NodeLicense2);

    await run("verify:verify", {
        address: address,
        constructorArguments: [],
    });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });