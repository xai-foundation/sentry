import hardhat from "hardhat";
const { ethers } = hardhat;

const contractAddress = "0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2"; // Node license 9
const rpcURL = "https://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B";

async function syncPrice(provider, signer) {
    let funcSignature = "updateLatestETHToUSDC()";
    let selector = `${ethers.keccak256(ethers.toUtf8Bytes(funcSignature)).slice(0, 10)}`;

    try {
        const tx = await signer.sendTransaction({
            to: contractAddress,
            data: selector
        });
        const receipt = await tx.wait();

        console.log(`[${new Date().toISOString()}] updateLatestETHToUSDC transaction mined:`, receipt.transactionHash);
    } catch (error) {
        console.error("Error syncing price:", error);
    }
}

async function main() {
  console.log(`Starting price sync...`);

  const provider = new ethers.JsonRpcProvider(rpcURL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  console.log(`Signing with address: ${await signer.getAddress()}`);

  //poll on interval
  const pollIntervalMs = 5000; //5 seconds
  setInterval(() => syncPrice(provider, signer), pollIntervalMs);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
