import { ethers } from "ethers";

interface OperatorRuntimeArgs {
    signer: ethers.Signer,
}

interface OperatorRuntimeResponse {
    stop: () => Promise<void>;
}

export function operatorRuntime(args: OperatorRuntimeArgs): OperatorRuntimeResponse {

    async function start() {
        

    }

    async function stop() {
        
    }

    void start();

    return {
        stop,
    };
}