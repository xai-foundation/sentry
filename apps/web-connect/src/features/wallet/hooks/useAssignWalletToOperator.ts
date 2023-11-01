import {useMutation} from "react-query";
import {addOperatorToReferee} from "@xai-vanguard-node/core";
import {ethers} from "ethers";

export function useAssignWalletToOperator(operatorAddress: string, signer: ethers.Signer) {

	return useMutation({
		mutationKey: ["assign-wallet"],
		mutationFn: () => addOperatorToReferee(operatorAddress, true, signer),
		onSuccess: () => {
			console.log("success:")
		},
		onError: (err) => {
			console.log("err:", err)
		}
	});
}
