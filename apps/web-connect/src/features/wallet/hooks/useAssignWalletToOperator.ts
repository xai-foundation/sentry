import {useMutation} from "react-query";
import {addOperatorToReferee} from "@xai-vanguard-node/core";
import {Addressable, ethers} from "ethers";

export function useAssignWalletToOperator(operatorAddress: string, signer: ethers.Signer) {


	return useMutation({
		mutationKey: ["assign-wallet"],
		// @ts-ignore
		mutationFn: () => addOperatorToReferee(operatorAddress, true, signer),
	});
}
