import {useChainDataWithCallback} from "@/hooks/useChainDataWithCallback";

export function ChainDataManager() {

	useChainDataWithCallback();
	console.log("useChainDataWithCallback");

	return null;
}
