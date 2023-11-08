import {getProvider} from "./getProvider.js";
import {ethers} from "ethers";

export async function getWalletBalance(address: string): Promise<BigInt> {
	const provider = getProvider();
	return await provider.getBalance(address);

	return ethers.formatEther(wei);
}
