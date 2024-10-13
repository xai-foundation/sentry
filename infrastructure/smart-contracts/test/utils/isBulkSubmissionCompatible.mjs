import hardhat from "hardhat";
const { ethers } = hardhat;

export async function isBulkSubmissionCompatible(contractAddress){

  try {

    const Referee10 = await ethers.getContractFactory("Referee10");
    const referee10 = new ethers.Contract(contractAddress, Referee10.interface, ethers.provider);

    const result = await referee10.bulkSubmissions(0, ethers.ZeroAddress);

    return true;
  } catch (error) {
    //console.error("Is Not Compatible: ");
    return false
  }
}