import {useAtomValue, useSetAtom} from "jotai";
import {drawerStateAtom} from "@/features/drawer/DrawerManager";
import {chainStateAtom} from "@/hooks/useChainDataWithCallback";
import {CustomTooltip, PrimaryButton} from "@sentry/ui";
import {useEffect, useState} from "react";
import {useStorage} from "@/features/storage";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {useOperator} from "@/features/operator";
import {HelpIcon, WarningIcon} from "@sentry/ui/dist/src/rebrand/icons/IconsComponents";
import MainCheckbox from "@sentry/ui/dist/src/rebrand/checkboxes/MainCheckbox";
import BaseCallout from "@sentry/ui/dist/src/rebrand/callout/BaseCallout";
import {AiOutlineClose} from "react-icons/ai";

export function WhitelistDrawer() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {owners, pools} = useAtomValue(chainStateAtom);
	const {data} = useStorage();
	const [selected, setSelected] = useState<string[]>([]);
	const {sentryRunning, stopRuntime} = useOperatorRuntime();
	const {publicKey: operatorAddress} = useOperator();

	const disableButton = selected.length <= 0 || !stopRuntime;

	useEffect(() => {
		if (data && data.whitelistedWallets) {
			setSelected(data.whitelistedWallets);
		}
	}, []);

	const toggleSelected = (wallet: string) => {
		setSelected((prevSelected) => prevSelected.includes(wallet)
			? prevSelected.filter((item) => item !== wallet)
			: [...prevSelected, wallet]
		);
	};

	const getOperatorItem = () => {
		if (operatorAddress) {
			return (
				<div>
					<div
						className="p-2 cursor-pointer hover:bg-gray-100 px-6"
					>
						<MainCheckbox
							isChecked={selected.includes(operatorAddress)}
							disabled={false}
							extraClasses={{wrapper: "text-[18px]"}}
							onChange={() => toggleSelected(operatorAddress)}
						>
							{operatorAddress.slice(0, 9)}...{operatorAddress.slice(-9)}
						</MainCheckbox>
					</div>
				</div>
			)
		}
	}

	const getDropdownItems = () => (
		<div>
			{owners.map((wallet) => (
				<div
					className="py-2 cursor-pointer hover:bg-gray-100"
					key={`whitelist-item-${wallet}`}
				>
					<MainCheckbox
						onChange={() => toggleSelected(wallet)}
						isChecked={selected.includes(wallet)}
						extraClasses={{wrapper: "text-[18px]"}}
					>
						{wallet.slice(0, 9)}...{wallet.slice(-9)}
					</MainCheckbox>
				</div>
			))}
			{pools.map((pool) => (
				<div
				className="py-2 cursor-pointer hover:bg-gray-100"
				key={`whitelist-item-${pool}`}
			>
				<MainCheckbox
					onChange={() => toggleSelected(pool)}
					isChecked={selected.includes(pool)}
					extraClasses={{wrapper: "text-[18px]"}}
				>
					{pool.slice(0, 9)}...{pool.slice(-9)}
				</MainCheckbox>
			</div>
			))}
		</div>
	);

	async function handleSubmit() {
		setDrawerState(null);

		if (stopRuntime) {
			void stopRuntime({
				...data,
				sentryRunning: false,
				whitelistedWallets: selected,
			});
		}
	}

	return (
		<div className="relative h-full flex flex-col justify-start items-center !text-white ">
			<div
				className="w-full flex flex-row justify-between items-center border-b border-chromaphobicBlack text-2xl font-bold px-8 py-[24px]">
				<p>Allowed Wallet</p>
				<span
					onClick={() => {setDrawerState(null)}}
					className="cursor-pointer"
				>
					<AiOutlineClose size={20} color="white" className="hover:!text-hornetSting duration-300 ease-in" />
				</span>
			</div>

			<div className={`flex-grow ${owners.length + pools.length > 5 && "overflow-y-scroll"} max-h-[calc(100vh-4rem)] text-americanSilver font-medium max-w-[429px]`}>
				<div className="py-6 border-b border-chromaphobicBlack max-w-[429px]">
					<p className="mb-4 text-lg px-6">
						Below are the wallets assigned to your Sentry Wallet ({operatorAddress}). Select the wallets
						you'd like to enable.
					</p>
					<p className="text-lg px-6">
						Note: Gas fees will be covered using your Sentry Wallet funds whenever an enabled wallet is
						eligible
						to participate in a challenge.
					</p>
				</div>
				<div className="">
					<div className="py-6 border-b border-chromaphobicBlack">
						<div className="flex gap-1 items-center px-6">
							<p className="text-lg font-medium text-americanSilver">Your Sentry Wallet</p>
							<CustomTooltip
								extraClasses={{tooltipContainer: "!left-[-38px] max-w-[275px]"}}
								content={"You should allow the Sentry Wallet only if it contains at least one Key. Otherwise, it is not necessary to select."}
							>
								<HelpIcon width={14} height={14}/>
							</CustomTooltip>
						</div>
						{getOperatorItem()}
					</div>
					<div className="py-6">
						<div className="px-6">
							<p className="text-lg font-medium text-americanSilver">Assigned Wallets/Pools</p>
							{getDropdownItems()}
						</div>
					</div>
				</div>
			</div>

			<div className="w-full flex-shrink-0 h-18 flex flex-col items-center justify-center px-2 pt-[69px] border-t border-chromaphobicBlack">
				<BaseCallout extraClasses={{calloutWrapper: "w-full max-w-[370px]", calloutFront: "text-[#FFC53D] !px-0"}} isWarning>
					<WarningIcon /> <span className="ml-[10px] text-lg font-medium">Applying changes will restart your sentry</span>
				</BaseCallout>

				<div className="w-full my-[10px] flex items-center justify-center gap-2 px-6">
					<PrimaryButton
						onClick={() => {
							setDrawerState(null)
						}}
						wrapperClassName={`max-w-[178px]`}
						className={`w-[176px] !h-[48px] text-lg font-bold uppercase !p-0`}
						colorStyle={"outline"}
						btnText={"Cancel"}
					/>
					{sentryRunning && (
						<PrimaryButton
							onClick={() => handleSubmit()}
							isDisabled={disableButton}
							className={`!h-[48px] w-full !font-bold !text-lg !uppercase !p-0 flex items-center justify-center `}
							btnText={stopRuntime ? "Apply" : "Loading..."}
						/>
					)}
				</div>
			</div>
		</div>
	);
}



