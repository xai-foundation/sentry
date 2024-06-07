import { ForwardRequest } from "@/models/types/ForwardRequest";
import axios from "axios";

const config = {
    headers: {
        Authorization: `Bearer ${process.env.THIRDWEB_BEARER_TOKEN}`
    }
};

/**
 * ## Forward a signed transaction according to the ERC-2771 standard, 
 * wait until the transaction was sent to the blockchain and return the txHash and the tx cost
 * 
 * @param txRequest The transaction to forward according to ERC-2771 including the signature of the user
 * @param relayerId The project's relayerId used for forwarding the transaction
 * @param forwarderAddress The project's forwarderAddress (default the XAI Forwarder) used for forwarding the transaction
 * 
 * @returns {string} the txHash
 * @returns {string} the tx costs in wei
 */
export async function forwardMetaTransaction(txRequest: ForwardRequest, relayerId: string): Promise<{ txHash: string, txFee: string }> {

    //TODO check request.to with project forwarder address
    //This will still be caught from thridweb however, we will want to return a structured error

    const metaTransaction = {
        type: "forward",
        request: {
            from: txRequest.from,
            to: txRequest.to,
            value: txRequest.value,
            gas: txRequest.gas,
            nonce: txRequest.nonce,
            data: txRequest.data
        },
        signature: txRequest.signature,
        forwarderAddress: txRequest.forwarderAddress
    };

    let queueId: string;
    try {
        const response = await axios.post(`${process.env.THIRDWEB_ENGINE_URL}/relayer/${relayerId}`, metaTransaction, config);
        queueId = response.data.result.queueId;
    } catch (error) {
        console.error("Failed to relay transaction", error);
        //TODO parse axios response error
        throw new Error("Failed to relay transaction");
    }

    //Wait for transaction to be sent to blockchain
    const { txHash, gasPrice } = await waitForTransactionQueue(queueId);
    // const txFee = await getTransactionFee(txHash, gasPrice);

    return {
        txHash,
        txFee: "10000000000000"
    }
}


const getTransactionInfoFromQueueId = async (queueId: string): Promise<{ txHash: string, gasPrice: string } | null> => {

    try {
        const response = await axios.get(`${process.env.THIRDWEB_ENGINE_URL}/transaction/status/${queueId}`, config)

        if (response && response.data && response.data.result && response.data.result.status == 'sent') {
            return {
                txHash: response.data.result.transactionHash,
                gasPrice: response.data.result.gasPrice,
            }
        }

        return null;

    } catch (error) {
        console.error("Failed to process relayed transaction", error);
        //TODO parse axios response error
        throw new Error("Failed to process relayed transaction");
    }
}

const getTransactionFee = async (txHash: string, gasPrice: string): Promise<string> => {

    try {
        const response = await axios.get(`${process.env.THIRDWEB_ENGINE_URL}/transaction/${process.env.XAI_CHAIN_ID}/tx-hash/${txHash}`, config)

        if (response && response.data && response.data.result && response.data.result.gasUsed) {

            return (BigInt(response.data.result.gasUsed) * BigInt(gasPrice)).toString();
        } else {
            //return default tx fee as fallback
            return "10000000000000";
        }

    } catch (error) {
        console.error("Failed to get transaction fee", error);
        //TODO parse axios response error
        //return default tx fee as fallback
        return "10000000000000";
    }
}

async function waitForTransactionQueue(queueId: string): Promise<{ txHash: string, gasPrice: string }> {

    let count = 0;
    while (count < 10) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const txInfo = await getTransactionInfoFromQueueId(queueId);
        if (txInfo != null) {
            return txInfo;
        }
        count++;
    }

    throw new Error("Failed to query relayed transaction after 10 tries");
};