import {getProvider} from "./getProvider.js";
import {ethers} from "ethers";

export async function getWalletBalance(address: string, rpc?: string): Promise<bigint> {
	let provider = getProvider();
	if(rpc){
		if (rpc.startsWith('http') || rpc.startsWith('https')) {
			provider = new ethers.JsonRpcProvider(rpc);
		} else if (rpc.startsWith('wss')) {
			provider = new ethers.WebSocketProvider(rpc);
		}
	}
	return await provider.getBalance(address);
}
