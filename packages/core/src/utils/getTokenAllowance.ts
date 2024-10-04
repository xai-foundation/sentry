import {ethers} from 'ethers';

export async function getTokenAllowance(walletAddress: string, tokenAddress: string, spender: string, rpcUrl: string): Promise<{ approvalAmount: bigint}> {
    if(!walletAddress || walletAddress.length !== 42 || !tokenAddress || tokenAddress.length !== 42) {
        return { approvalAmount: BigInt(0) };
    }

	let provider: ethers.JsonRpcProvider | ethers.WebSocketProvider | ethers.AlchemyProvider | undefined;

    if (rpcUrl.startsWith('http') || rpcUrl.startsWith('https')) {
        provider = new ethers.JsonRpcProvider(rpcUrl);
    } else if (rpcUrl.startsWith('wss')) {
        provider = new ethers.WebSocketProvider(rpcUrl);
    }

    const ERC_20_ALLOWANCE_ABI = ["function allowance(address owner, address spender) view returns (uint256)"];

    // Create an instance of the esXai token contract
    const tokenContract = new ethers.Contract(tokenAddress, ERC_20_ALLOWANCE_ABI, provider);

    // Get the wallet balance of the esXai token
    const approvalAmount = await tokenContract.allowance(walletAddress, spender);

    return { approvalAmount };
}