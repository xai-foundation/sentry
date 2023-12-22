import {getProvider} from "../utils/index.js";
import {ethers} from "ethers";
import {NodeLicenseAbi} from "../abis/index.js";
import {config} from "../config.js";

export async function listClaimableAmount(address: string): Promise<bigint> {
	try {
		const provider = getProvider();
		const contract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);
		return await contract.whitelistAmounts(address);
	} catch (error) {
		console.error("Error fetching claimable amount:", error);
		throw new Error("Error fetching claimable amount.");
	}
}
