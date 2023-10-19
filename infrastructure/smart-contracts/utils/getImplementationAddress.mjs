import hardhat from "hardhat";
const { ethers } = hardhat;

/**
 * Function to get the implementation address from a proxy contract.
 * @param {ethers.Contract} contract - The proxy contract
 * @returns {Promise<string>} The implementation address
 */
export async function getImplementationAddress(contract) {
	const {provider} = (await ethers.getSigners())[0];
  const implementationAddress = "0x" + (await provider.getStorage(await contract.getAddress(), "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc")).slice(-40);
  return implementationAddress;
}
