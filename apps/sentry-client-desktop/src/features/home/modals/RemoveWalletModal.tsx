import {AiFillWarning, AiOutlineClose} from "react-icons/ai";
import {useStorage} from "@/features/storage";
import {useState} from "react";
import {FaCircleCheck} from "react-icons/fa6";
import {WalletAssignedMap} from "@/features/keys/Keys";

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
				className="absolute top-0 right-0 left-0 bottom-0 m-auto w-auto h-auto flex flex-col justify-start items-center z-30">
				<div className="w-full h-full bg-white opacity-75"/>
				<div
					className="absolute top-0 right-0 left-0 bottom-0 m-auto flex flex-col justify-start items-center w-[506px] h-[190px] border border-gray-200 bg-white">
					<div
						className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
						<FaCircleCheck color={"#16A34A"} size={32}/>
						<span className="text-xl font-semibold text-center">Wallet removed</span>
					</div>
				</div>
			</div>
		)
	}

	if (isAssigned) {
		return (
			<div
				className="absolute top-0 right-0 left-0 bottom-0 m-auto w-auto h-auto flex flex-col justify-start items-center z-30">
				<div className="w-full h-full bg-white opacity-75"/>
				<div
					className="absolute top-0 right-0 left-0 bottom-0 m-auto flex flex-col justify-start items-center w-[506px] h-[272px] border border-gray-200 bg-white px-6">
					<div
						className="absolute top-0 right-0 h-16 flex flex-row justify-between items-center text-lg px-6">
						<div className="cursor-pointer z-10" onClick={() => onClose()}>
							<AiOutlineClose/>
						</div>
					</div>
					<div className="w-full h-full flex flex-col justify-center items-center gap-2">
						<AiFillWarning className="w-16 h-16 text-[#F59E28]"/>
						<p className="text-[15px] font-semibold">
							Attempting to remove an assigned wallet
						</p>
						<p className="text-[#525252] text-[15px]">
							If you would like to remove this wallet from the Keys page, you will need to un-assign it
							from the Sentry Wallet page first.
						</p>

						<div className="flex gap-8 mt-4">
							<button
								onClick={() => onClose()}
								className="w-fit h-auto bg-[#F30919] text-[15px] text-white px-8 py-3 font-semibold"
							>
								Okay
							</button>
						</div>
					</div>
				</div>
			</div>
		)
	}

	if (!isAssigned) {
		return (
			<div
				className="absolute top-0 right-0 left-0 bottom-0 m-auto w-auto h-auto flex flex-col justify-start items-center z-30">
				<div className="w-full h-full bg-white opacity-75"/>
				<div
					className="absolute top-0 right-0 left-0 bottom-0 m-auto flex flex-col justify-start items-center w-[506px] h-[272px] border border-gray-200 bg-white">
					<div
						className="absolute top-0 right-0 h-16 flex flex-row justify-between items-center text-lg px-6">
						<div className="cursor-pointer z-10" onClick={() => onClose()}>
							<AiOutlineClose/>
						</div>
					</div>
					<div className="w-full h-full flex flex-col justify-center items-center gap-2">
						<AiFillWarning className="w-16 h-16 text-[#F59E28]"/>
						<p className="text-[15px] font-semibold">
							Are you sure you want to remove this wallet?
						</p>
						<p className="text-[#525252] text-[15px]">
							You will stop tracking all esXAI accrued on this wallet
						</p>

						<div className="flex gap-8 mt-4">
							<button
								onClick={() => removeWallet()}
								className="w-fit h-auto text-[15px] text-[#F30919] px-4 py-3 font-semibold"
							>
								Yes, remove this wallet
							</button>
							<button
								onClick={() => onClose()}
								className="w-fit h-auto bg-[#F30919] text-[15px] text-white px-4 py-3 font-semibold"
							>
								No, take me back
							</button>
						</div>
					</div>
				</div>
			</div>
		)
	}
}
