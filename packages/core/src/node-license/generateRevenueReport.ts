import {ethers} from "ethers";
import {config, getProvider, NodeLicenseAbi} from "../index.js";
import axios from "axios";

export async function generateRevenueReport() {

    // Get the provider
    const provider = getProvider();

    // Create an instance of the NodeLicense contract
    const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, provider);

    // Iterate over all PromoCodeCreated events to get the promo codes
    const promoCodeCreatedTopic = nodeLicenseContract.getEvent("PromoCodeCreated").getFragment().topicHash;
    const blockNumber = config.nodeLicenseDeployedBlockNumber;
    const eventBlockStep = 1000000;
    const currentBlockNumber = await provider.getBlockNumber();
    let promoCodes: Array<[string, bigint | undefined]> = [];

    for(let i = blockNumber; i <= currentBlockNumber; i += eventBlockStep) {
        const promoCodeCreatedLogs = await provider.getLogs({
            fromBlock: i,
            toBlock: Math.min(i + eventBlockStep - 1, currentBlockNumber),
            address: config.nodeLicenseAddress,
            topics: [promoCodeCreatedTopic],
        });

        console.log(`Processing blocks from ${i} to ${Math.min(i + eventBlockStep - 1, currentBlockNumber)}. Remaining blocks: ${currentBlockNumber - i}`);

        const newPromoCodes = promoCodeCreatedLogs.map(log => {
            const mutableLog = { ...log, topics: [...log.topics] };
            const parsedLog = nodeLicenseContract.interface.parseLog(mutableLog);
            return parsedLog?.args?.promoCode;
        }).filter(promoCode => promoCode !== undefined);

        // Add the new promo codes to the array with an undefined value
        promoCodes = [...promoCodes, ...newPromoCodes.map((promoCode: string) => [promoCode, undefined] as [string, bigint | undefined])];
    }

    // iterate over all promo codes and get how much they have gotten lifetime
    for (let i = 0 ; i < promoCodes.length; i++) {
        const {receivedLifetime} = await nodeLicenseContract.getPromoCode(promoCodes[i][0]);
        promoCodes[i][1] = receivedLifetime;
        console.log(promoCodes[i]);
    }

    const totalPromoCodesValue = promoCodes.reduce((total, promoCode) => {
        return promoCode[1] ? total + promoCode[1] : total;
    }, BigInt(0));
    console.log(`Total value from promo codes: ${totalPromoCodesValue} (${ethers.formatEther(totalPromoCodesValue)} eth)`);

    // get all the transaction hashes where there was a mint event
    const mintTopic = nodeLicenseContract.getEvent("Transfer").getFragment().topicHash;
    const zeroAddress = ethers.ZeroAddress;
    const logBlockStep = 1000000;
    let transferTransactionHashes: Array<string> = ["0x28ac89393111faee49829f689feed29b5fe483b9790530957dbd5bbb5d909ebb"];

    async function getTransferLogs(fromBlock: number, toBlock: number, logBlockStep: number): Promise<ethers.Log[]> {
        try {
            return await provider.getLogs({
                fromBlock,
                toBlock: Math.min(fromBlock + logBlockStep - 1, toBlock),
                address: config.nodeLicenseAddress,
                topics: [mintTopic],
            });
        } catch (error) {
            if (logBlockStep > 1) {
                const halfStep = Math.floor(logBlockStep / 2);
                const firstHalfLogs = await getTransferLogs(fromBlock, toBlock, halfStep);
                const secondHalfLogs = await getTransferLogs(fromBlock + halfStep, toBlock, halfStep);
                return [...firstHalfLogs, ...secondHalfLogs];
            } else {
                throw error;
            }
        }
    }

    for(let i = blockNumber; i <= currentBlockNumber; i += logBlockStep) {
        const transferLogs = await getTransferLogs(i, currentBlockNumber, logBlockStep);

        // Parse each log, and only add the logs that came from the zero address
        const newTransferTransactionHashes = transferLogs
            .filter(log => {
                const mutableLog = { ...log, topics: [...log.topics] };
                const parsedLog = nodeLicenseContract.interface.parseLog(mutableLog);
                return parsedLog?.args?.from === zeroAddress;
            })
            .map(log => log.transactionHash);

        if(newTransferTransactionHashes.length > 0) {
            console.log(`Found transfers at blocks: ${newTransferTransactionHashes.length} transfers`);
        }

        // Add the new transaction hashes to the array and remove duplicates
        transferTransactionHashes = Array.from(new Set([...transferTransactionHashes, ...newTransferTransactionHashes]));

        // Show logs of progress of how many blocks have been queried so far and how many left.
        console.log(`Processed blocks from ${i} to ${Math.min(i + logBlockStep - 1, currentBlockNumber)}. Remaining blocks: ${currentBlockNumber - i}`);
    }

    async function traceTransactions(txHashes: string[]) {
        const promises = txHashes.map(async (txHash) => {
            let response;
            while (!response) {
                try {
                    response = await axios.post(config.arbitrumOneJsonRpcUrl, {
                        jsonrpc: '2.0',
                        id: 1,
                        method: 'debug_traceTransaction',
                        params: [txHash, { "tracer": "callTracer" }]
                    });

                    if (response.data.error) {
                        console.error(`Error tracing transaction ${txHash}: ${JSON.stringify(response.data.error)}. Retrying in 5 seconds...`);
                        await new Promise(resolve => setTimeout(resolve, 5000));
                        response = null;
                        continue;
                    }

                    if (!response.data.result) {
                        console.warn("No result found", response.data);
                    }

                } catch (error) {
                    console.error(`Failed to trace transaction ${txHash}. Retrying in 5 seconds...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
            }
            return response.data.result;
        });

        const responses = await Promise.all(promises);
        return responses;
    }

    const fundsReceiver = (await nodeLicenseContract.fundsReceiver()).toLowerCase(); // this will stop working if we change this in the future

    /**
     * Recursively search through calls and find all entries with type: "CALL", to: fundsReceiver, input: "0x".
     * @param calls - The calls array in each transaction.
     * @param fundsReceiver - The funds receiver address.
     * @returns An array of BigInt values.
     */
    function findMatchingCalls(calls: any[], fundsReceiver: string): bigint[] {
        let values: bigint[] = [];

        for (const call of calls) {
            if (call.type === 'CALL' && call.to.toLowerCase() === fundsReceiver && call.input === '0x') {
                values.push(BigInt(call.value));
            }

            if (call.calls) {
                values = [...values, ...findMatchingCalls(call.calls, fundsReceiver)];
            }
        }

        return values;
    }

    const chunkSize = 50;
    let allValues: bigint[] = [];
    let allTransactionHashes: string[] = [];

    for (let i = 0; i < transferTransactionHashes.length; i += chunkSize) {
        const transactionHashesChunk = transferTransactionHashes.slice(i, i + chunkSize);
        const traces = await traceTransactions(transactionHashesChunk);

        for (let j = 0; j < transactionHashesChunk.length; j++) {

            if (!traces[j]?.calls) {
                console.warn(`Transaction ${transactionHashesChunk[j]} has no calls.`, traces[j]);
                continue;
            }

            const values = findMatchingCalls(traces[j].calls, fundsReceiver);
            allValues = [...allValues, ...values];
            allTransactionHashes.push(transactionHashesChunk[j]);
        }

        console.log(`Progress: ${i+1}/${transferTransactionHashes.length} chunks processed.`);
    }

    const totalValue = allValues.reduce((a, b) => a + b, BigInt(0));
    console.log(`Total value transferred to funds receiver: ${totalValue} (${ethers.formatEther(totalValue)} eth)`);

}

