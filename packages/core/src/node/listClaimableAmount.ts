import {getProvider} from "../utils/index.js";
import {ethers} from "ethers";
import {NodeLicenseAbi} from "../abis/index.js";
import {config} from "../config.js";

export async function listClaimableAmount(
	address: string,
): Promise<string[]> {

	// Get the provider
	const provider = getProvider();

	// Create a contract instance
	const contract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);

	// Get the number of owners
	const claimableAmount = await contract.whitelistAmounts(address);

	return claimableAmount;
}
