import { NodeLicenseAbi } from "@/assets/abi/NodeLicenseAbi";
import { Web3Instance } from "../services/web3.service";



export async function getCurrentNodeLicensePrice(web3Instance: Web3Instance): Promise<{ price: bigint }> {

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new web3Instance.web3.eth.Contract(NodeLicenseAbi, web3Instance.nodeLicenseAddress);

    // Get the price from the price() function in NodeLicense contract
    const contractPrice = await nodeLicenseContract.methods.price(1, "").call() as bigint;

    return { price: contractPrice };
}