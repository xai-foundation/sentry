import {AiOutlineClose} from "react-icons/ai";
import {useAtomValue, useSetAtom} from "jotai";
import {drawerStateAtom} from "@/features/drawer/DrawerManager";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {useCombinedOwners} from "@/hooks/useCombinedOwners";
import {XaiButton, XaiCheckbox} from "@sentry/ui";
import {useState} from "react";
import {useStorage} from "@/features/storage";

export function WhitelistDrawer() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {owners} = useAtomValue(chainStateAtom);
	const {data, setData} = useStorage();
	const {combinedOwners} = useCombinedOwners(owners);
	const [selected, setSelected] = useState<string[]>([]);

	const toggleSelected = (wallet: string) => {
		setSelected((prevSelected) =>
			prevSelected.includes(wallet)
				? prevSelected.filter((item) => item !== wallet)
				: [...prevSelected, wallet]
		);
	};

	const getDropdownItems = () => (
		<div>
			{combinedOwners.map((wallet, i) => (
				<div
					className="p-2 cursor-pointer hover:bg-gray-100"
					key={`whitelist-item-${i}`}
				>
					<XaiCheckbox
						onClick={() => toggleSelected(wallet)}
						condition={selected.includes(wallet)}
					>
						{wallet}
					</XaiCheckbox>
				</div>
			))}
		</div>
	);

	function handleSubmit() {
		setData({
			...data,
			whitelistedWallets: selected,
		});
		setDrawerState(null);
	}

	return (
		<div className="relative h-full flex flex-col justify-start items-center">
			<div
				className="w-full h-[4rem] min-h-[4rem] flex flex-row justify-between items-center border-b border-gray-200 text-lg font-semibold px-8">
				<div className="flex flex-row gap-2 items-center">
					<p>Whitelist Wallet</p>
				</div>
				<div className="cursor-pointer z-10" onClick={() => setDrawerState(null)}>
					<AiOutlineClose/>
				</div>
			</div>

			<div className="flex-grow overflow-y-scroll max-h-[calc(100vh-4rem)] px-6 pt-[1rem]">
				<p className="mb-2">
					Select wallets that you would like to whitelist to your operator:
				</p>
				<div>
					{getDropdownItems()}
				</div>
			</div>

			<div className="flex-shrink-0 h-16 bg-white flex items-center justify-center">
				<XaiButton onClick={() => handleSubmit()} width="27.25rem">
					Submit
				</XaiButton>
			</div>
		</div>
	);
}
