import {useChainDataWithCallback} from "@/hooks/useChainDataWithCallback";

export function ChainDataManager() {

	console.log("I'm firing");

	useChainDataWithCallback();
	return null;
}
