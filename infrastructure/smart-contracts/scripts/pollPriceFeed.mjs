import hardhat from "hardhat";
const { ethers } = hardhat;

const promoCode = "";
// const contractAddress = "0x07C05C6459B0F86A6aBB3DB71C259595d22af3C2"; // Node license 9
const contractAddress = "0xF2ef5ab961a6a69E15530612A3A327e618658f01"; // ethusd price feed
const priceFeedPair = "ETHUSD";
const quantity = 1;
const rpcURL = "https://arb-sepolia.g.alchemy.com/v2/8aXl_Mw4FGFlgxQO8Jz7FVPh2cg5m2_B";

async function fetchPrice(provider) {
  try {
    // Manually encode function call
    // const data = ethers.AbiCoder.defaultAbiCoder().encode(
    //   ["uint256", "string"],
    //   [quantity, promoCode]
    // );
    let funcSignature = "latestAnswer()";
    let selector = `${ethers.keccak256(ethers.toUtf8Bytes(funcSignature)).slice(0, 10)}`;
    let encodedData = `${selector}`; //`${selector}${data.slice(2)}`;

    //call contract
    const result = await provider.call({
      to: contractAddress,
      data: encodedData
    });

    //decode and log result
    const price = ethers.AbiCoder.defaultAbiCoder().decode(["uint256"], result);
    console.log(`[${new Date().toISOString()}] Price for ${quantity} ${priceFeedPair}:`, price.toString());
  } catch (error) {
    console.error("Error fetching price:", error);
  }
}

async function main() {
  console.log(`Starting price sync for: ${priceFeedPair} on contract: ${contractAddress}`);

  const provider = new ethers.JsonRpcProvider(rpcURL);

  //poll on interval
  const pollIntervalMs = 5000; //5 seconds
  setInterval(() => fetchPrice(provider), pollIntervalMs);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
