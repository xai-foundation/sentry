import {getProvider} from "./getProvider.js";
import {ethers} from "ethers";

export async function getWalletBalance(address: string): Promise<bigint> {
	const provider = getProvider();
	return await provider.getBalance(address);
}
