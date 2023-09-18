import { ethers } from "hardhat";

async function main() {
  const challengerPublicKey = "0x123..."; // replace with actual public key
  const rollUpUserLogicAddress = "0xabc..."; // replace with actual address

  const Referee = await ethers.getContractFactory("Referee");
  const referee = await Referee.deploy(challengerPublicKey, rollUpUserLogicAddress);

  await referee.deployed();

  console.log("Referee deployed to:", referee.address);

  // write the ABI of referee into core/src/abi/RefereeAbi.ts
  // TODO

  // save the referee contract address into core/src/config.ts by reading the ts file,
  // finding the key of the 'refereeContractAddress' and replacing the string next to it
  // TODO
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

