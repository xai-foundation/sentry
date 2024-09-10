import { useStorage } from "@/features/storage";
import { getAddress } from "ethers";

export function useCombinedOwners(assignedOwners: string[] = []) {
	const { data } = useStorage();

	assignedOwners = assignedOwners.map(a => getAddress(a));

	const combinedOwners = [...new Set([...assignedOwners, ...(data?.addedWallets?.map(a => getAddress(a)) || [])])]
		.filter((wallet, index, array) => array.indexOf(wallet) === index);

	const walletAssignedMap = combinedOwners.reduce((result, wallet) => {
		result[wallet] = assignedOwners.includes(wallet);
		return result;
	}, {});

	return {
		combinedOwners,
		walletAssignedMap,
	}
}
