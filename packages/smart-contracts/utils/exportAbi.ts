import fs from 'fs';
import path from 'path';
import { BaseContract } from 'ethers';

/**
 * Extracts the ABI from a contract and writes it to a file.
 * @param contract - The contract object from which to extract the ABI.
 */
export async function extractAbi(contractName: string, contract: BaseContract): Promise<void> {

    // Convert contractName to camel case if it's not
    const camelCaseContractName = contractName.replace(/([-_][a-z])/ig, ($1) => {
        return $1.toUpperCase()
            .replace('-', '')
            .replace('_', '');
    });

    // Extract the ABI from the contract
    const abi = JSON.parse(contract.interface.formatJson());

    // Define the path to the ABI file
    const abiFilePath = path.resolve(__dirname, '../../core/src/abis', `${camelCaseContractName}Abi.ts`);

    // Write the ABI to the file
    fs.writeFileSync(abiFilePath, `export const ${camelCaseContractName}Abi = ${JSON.stringify(abi, null, 2)};`, 'utf8');

    // Define the path to the index file
    const indexFilePath = path.resolve(__dirname, '../../core/src/abis', 'index.ts');

    // Read the contents of the index file
    let indexFileContents = fs.readFileSync(indexFilePath, 'utf8').split('\n');

    // Check if the contract is already imported in the index file
    if (!indexFileContents.includes(`export * from "./${camelCaseContractName}Abi";`)) {
        // If not, append the import statement to the index file
        indexFileContents.push(`export * from "./${camelCaseContractName}Abi";`);
    }

    // Sort the exports in the index file in alphabetical order
    indexFileContents = indexFileContents.sort();

    // Write the sorted contents back to the index file
    fs.writeFileSync(indexFilePath, indexFileContents.join('\n'), 'utf8');
}
