import fs from 'fs';
import path from 'path';
import { Contract } from '@ethersproject/contracts';

/**
 * Extracts the ABI from a contract and writes it to a file.
 * @param contract - The contract object from which to extract the ABI.
 */
async function extractAbi(contract: Contract): Promise<void> {
    // Extract the ABI from the contract
    const abi = contract.interface.format();

    // Define the path to the ABI file
    const abiFilePath = path.resolve(__dirname, '../core/src/abis', `${contract.constructor.name}Abi.ts`);

    // Write the ABI to the file
    fs.writeFileSync(abiFilePath, `export const ${contract.constructor.name}Abi = ${JSON.stringify(abi, null, 2)};`, 'utf8');

    // Define the path to the index file
    const indexFilePath = path.resolve(__dirname, '../core/src/abis', 'index.ts');

    // Read the contents of the index file
    const indexFileContents = fs.readFileSync(indexFilePath, 'utf8');

    // Check if the contract is already imported in the index file
    if (!indexFileContents.includes(`export * from "./${contract.constructor.name}Abi";`)) {
        // If not, append the import statement to the index file
        fs.appendFileSync(indexFilePath, `\nexport * from "./${contract.constructor.name}Abi";`, 'utf8');
    }
}
