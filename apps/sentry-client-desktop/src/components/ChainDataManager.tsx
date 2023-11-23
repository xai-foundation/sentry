import {useChainDataWithCallback} from "@/hooks/useChainDataWithCallback";

export function ChainDataManager() {

	const {chainState} = useChainDataWithCallback();
	console.log("chainState:", chainState);

	return null;
}
