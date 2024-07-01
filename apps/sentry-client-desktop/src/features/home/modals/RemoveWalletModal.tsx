import {useStorage} from "@/features/storage";
import {useState} from "react";
import {FaCircleCheck} from "react-icons/fa6";
import {WalletAssignedMap} from "@/features/keys/Keys";
import {WarningIcon} from "@sentry/ui/dist/src/rebrand/icons/IconsComponents";
import {CloseIcon} from "@sentry/ui/dist/src/rebrand/icons/CloseIcon";
import {PrimaryButton} from "@sentry/ui";

interface ImportSentryAlertModalProps {
	onClose: () => void;
	selectedWallet: string | null;
	isWalletAssignedMap: WalletAssignedMap,
}

export function RemoveWalletModal({onClose, selectedWallet, isWalletAssignedMap}: ImportSentryAlertModalProps) {
	const {data, setData} = useStorage();
	const userWallets = data?.addedWallets || [];
	const indexToRemove = userWallets.findIndex(wallet => wallet === selectedWallet);
	const [success, setSuccess] = useState<boolean>(false);
	let isAssigned;

	if (selectedWallet) {
		isAssigned = isWalletAssignedMap[selectedWallet];
	}

	function removeWallet() {
		if (indexToRemove !== -1) {
			userWallets.splice(indexToRemove, 1);
		}
		void setData({...data, addedWallets: userWallets});
		setSuccess(true)
		setTimeout(() => {
			window.location.reload();
		}, 2000);
	}

	if (success) {
		return (
			<div
				className="absolute top-0 right-0 left-0 bottom-0 m-auto w-auto h-auto flex flex-col justify-start items-center z-[60]">
				<div className="w-full h-full bg-chromaphobicBlack opacity-75"/>
				<div
					className="absolute top-0 right-0 left-0 bottom-0 m-auto flex flex-col justify-start items-center w-[692px] h-[200px] bg-black">
					<div
						className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
						<FaCircleCheck color={"#16A34A"} size={32}/>
						<span className="text-2xl font-bold text-white text-center">Wallet removed</span>
					</div>
				</div>
			</div>
		)
	}

	if (isAssigned) {
		return (
			<div
				className="absolute top-0 right-0 left-0 bottom-0 m-auto w-auto h-auto flex flex-col justify-start items-center z-[60]">
				<div className="w-full h-full bg-chromaphobicBlack opacity-75"/>
				<div
					className="absolute top-0 right-0 left-0 bottom-0 m-auto flex flex-col justify-start items-center w-[692px] h-[200px] bg-black px-6">
					<div
						className="absolute top-0 right-0 h-16 flex flex-row justify-between items-center text-lg px-6">
						<div className="cursor-pointer z-10 remove-assign-wallet-modal" onClick={() => onClose()}>
							<CloseIcon fill={"#fff"}/>
						</div>
					</div>
					<div className="w-full h-full flex flex-col justify-center items-start gap-2">
						<div className="flex items-center gap-[17px]">
							<WarningIcon width={37} height={32} />
							<p className="text-2xl font-bold text-white">
								Attempting to remove an assigned wallet
							</p>
						</div>
						<p className="text-americanSilver text-[17px] font-medium ml-[55px]">
							If you would like to remove this wallet from the Keys page, you will need to un-assign it
							from the Sentry Wallet page first.
						</p>

						<div className="flex justify-end w-full gap-8 mt-4">
							<PrimaryButton
								onClick={() => onClose()}
								wrapperClassName="w-max"
								className="w-fit text-lg uppercase px-4 !py-0 !h-[40px]"
								btnText={"Okay"}
							/>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!isAssigned) {
		return (
			<div
				className="absolute top-0 right-0 left-0 bottom-0 m-auto w-auto h-auto flex flex-col justify-start items-center z-[60]">
				<div className="w-full h-full bg-chromaphobicBlack opacity-75"/>
				<div
					className="absolute top-0 right-0 left-0 bottom-0 m-auto flex flex-col justify-start items-center w-[692px] h-[181px] bg-black">
					<div
						className="absolute top-0 right-0 h-16 flex flex-row justify-between items-center text-lg px-6 mt-[2px]">
						<div className="cursor-pointer z-10 remove-wallet-modal-close" onClick={() => onClose()}>
							<CloseIcon fill="#fff" />
						</div>
					</div>
					<div className="w-full h-full flex flex-col justify-center items-start gap-2 px-5">
						<div className="flex items-center gap-[17px]">
							<WarningIcon width={37} height={32} />
							<p className="text-2xl font-bold text-white">
								Are you sure you want to remove this wallet?
							</p>
						</div>
						<p className="text-americanSilver text-[17px] font-medium ml-[55px]">
							You will stop tracking all esXAI accrued on this wallet
						</p>

						<div className="flex gap-4 mt-4 justify-end w-full items-center">
							<button
								onClick={() => removeWallet()}
								className="w-fit h-auto text-lg font-bold text-[#F30919] py-3 hover:text-white duration-300 ease-in-out"
							>
								Yes, remove this wallet
							</button>
							<PrimaryButton
								onClick={() => onClose()}
								wrapperClassName="w-max"
								className="w-fit text-lg uppercase font-bold px-4 !py-0 !h-[40px]"
								btnText={"No, take me back"}
							/>
						</div>
					</div>
				</div>
			</div>
		)
	}
}
