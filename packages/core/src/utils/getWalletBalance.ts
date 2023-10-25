import {getProvider} from "./getProvider.js";
import {ethers} from "ethers";

export async function getWalletBalance(address: string): Promise<string> {
	const provider = getProvider();
	const wei = await provider.getBalance(address);

	return ethers.formatEther(wei);
}
