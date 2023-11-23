import {useStorage} from "@/features/storage";

export function useCombinedOwners(assignedOwners: string[] = []) {
	const {data} = useStorage();

	const combinedOwners = [...new Set([...assignedOwners, ...(data?.addedWallets || [])])]
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
