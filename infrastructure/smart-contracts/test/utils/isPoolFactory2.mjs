import hardhat from "hardhat";
const { ethers } = hardhat;

export async function isPoolFactory2(contractAddress){

  try {

    const PoolFactory2 = await ethers.getContractFactory("PoolFactory2");
    const poolFactory2 = new ethers.Contract(contractAddress, PoolFactory2.interface, ethers.provider);

    const result = await poolFactory2.failedKyc(ethers.ZeroAddress);

    return true;
  } catch (error) {
    //console.error("Is Not PoolFactory2: ");
    return false
  }
}