import {ethers} from 'ethers';

/**
 * Fetches a wallet's token balance.
 * @param walletAddress - The address of the wallet to fetch the balance of.
 * @param tokenAddress - The address of the token to fetch the balance of.
 * @param rpcUrl - The RPC URL to use.
 * @returns balance bigint The token balance of the wallet.
 */

export async function getTokenBalance(walletAddress: string, tokenAddress: string, rpcUrl: string): Promise<{ balance: bigint}> {
    if(!walletAddress || walletAddress.length !== 42 || !tokenAddress || tokenAddress.length !== 42) {
        return { balance: BigInt(0) };
    }

	let provider: ethers.JsonRpcProvider | ethers.WebSocketProvider | ethers.AlchemyProvider | undefined;

    if (rpcUrl.startsWith('http') || rpcUrl.startsWith('https')) {
        provider = new ethers.JsonRpcProvider(rpcUrl);
    } else if (rpcUrl.startsWith('wss')) {
        provider = new ethers.WebSocketProvider(rpcUrl);
    }

    const ERC_20_BALANCE_OF_ABI = ["function balanceOf(address owner) view returns (uint256)"];

    // Create an instance of the esXai token contract
    const tokenContract = new ethers.Contract(tokenAddress, ERC_20_BALANCE_OF_ABI, provider);

    // Get the wallet balance of the esXai token
    const balance = await tokenContract.balanceOf(walletAddress);

    return { balance };
}