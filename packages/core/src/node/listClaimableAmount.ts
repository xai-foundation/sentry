import {getProvider} from "../utils/index.js";
import {ethers} from "ethers";
import {NodeLicenseAbi} from "../abis/index.js";
import {config} from "../config.js";

export async function listClaimableAmount(address: string): Promise<bigint> {
	try {

		const provider = getProvider("https://icy-thrilling-frog.arbitrum-goerli.quiknode.pro/4d27f3253823ff8ec0afbabc49cbe924bfc9acdb/");
		const contract = new ethers.Contract("0xd8362099000ba0C8A8f0Dd9Ed8413bC8Bc8691B9", NodeLicenseAbi, provider);
//
// 		const provider = getProvider();
// 		const contract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);
		return await contract.whitelistAmounts(address);
	} catch (error) {
		console.error("Error fetching claimable amount:", error);
		throw new Error("Error fetching claimable amount.");
	}
}
