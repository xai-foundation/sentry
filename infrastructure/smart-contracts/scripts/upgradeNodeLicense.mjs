const address = "0x2DBdA974Fb90e6eB19F4FCce82BC3A9Cf4a0Fd74";

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