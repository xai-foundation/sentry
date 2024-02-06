import {ChangeEvent, useState} from "react";
import {BiLinkExternal, BiLoaderAlt} from "react-icons/bi";
import {FaCircleCheck} from "react-icons/fa6";
import {useSetAtom} from "jotai";
import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";
import {useStorage} from "@/features/storage";
import {useNavigate} from "react-router-dom";
import {drawerStateAtom} from "@/features/drawer/DrawerManager";
import {useOperator} from "@/features/operator";

export function ViewKeysFlow() {
	const [ownerAddress, setOwnerAddress] = useState('');
	const [ownerAddressError, setOwnerAddressError] = useState({
		errorResult: "",
		error: false,
	});

	const [loading, setLoading] = useState<boolean>(false)
	const [success, setSuccess] = useState<boolean>(false)
	const {publicKey: operatorAddress} = useOperator();


	const setDrawerState = useSetAtom(drawerStateAtom);
	const setModalState = useSetAtom(modalStateAtom);
	const navigate = useNavigate();
	const {data, setData} = useStorage();

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		setOwnerAddress(event.target.value);
		setOwnerAddressError({
			errorResult: "",
			error: false,
		});
	};

	async function onAddWallet() {
		setLoading(true);

		const addressRegex = /^(0x)?[0-9a-fA-F]{40}$/;
		const isValidMetamaskAddress = addressRegex.test(ownerAddress);

		// Return if input added isn't a valid address
		if (!isValidMetamaskAddress) {
			setOwnerAddressError({
				errorResult: "Invalid address",
				error: true,
			});
			setLoading(false);
			return
		}

		// Return if wallet already exists inside of addedWallets array
		if (data?.addedWallets?.includes(ownerAddress)) {
			setOwnerAddressError({
				errorResult: "Wallet already added",
				error: true,
			});
			setLoading(false);
			return
		}

		const userWallets = data?.addedWallets || [];
		userWallets.push(ownerAddress);

		setData({
			...data,
			addedWallets: userWallets
		});

		setLoading(false);
		setSuccess(true);
	}

	function startAssignment() {
		setModalState(ModalView.TransactionInProgress);
		window.electron.openExternal(`https://sentry.xai.games/#/assign-wallet/${operatorAddress}`);
	}

	// Load State
	if (loading) {
		return (
			<div
				className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
				<BiLoaderAlt className="animate-spin" color={"#A3A3A3"} size={32}/>
				<span className="text-lg">Adding wallet...</span>
			</div>
		)
	}

	// Success state
	if (!loading && success) {
		setTimeout(() => {
			setDrawerState(null);
			navigate("/keys")
		}, 3000);

		return (
			<div
				className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
				<FaCircleCheck color={"#16A34A"} size={32}/>
				<span className="text-lg">Wallet added successfully</span>
			</div>
		)
	}

	// Default state
	if (!loading && !success) {
		return (
			<div>
				<div className="w-full flex flex-col gap-8">
					<div className="flex flex-col gap-2 px-6 pt-6">
						<p className="text-[15px] text-[#525252]">
							Enter the the public key of the wallet you want to view keys for
						</p>

						<input
							type="text"
							value={ownerAddress}
							onChange={handleInputChange}
							className="w-full mt-2 p-3 border rounded"
							placeholder="Enter public key"
						/>

						{ownerAddressError.error && (
							<p className="text-sm text-[#AB0914]">{ownerAddressError.errorResult}</p>
						)}

						<button
							onClick={async () => onAddWallet()}
							className={`w-full h-12 flex flex-row justify-center items-center gap-1 ${ownerAddress ? "bg-[#F30919]" : "bg-gray-400"} text-[15px] text-white font-semibold mt-2 transition-all`}
							disabled={ownerAddress === ""}
						>
							Add wallet
						</button>

						<p className="text-[15px] text-[#525252] mt-8">
							Or assign wallet to view all keys in the wallet
						</p>

						<button
							onClick={startAssignment}
							className="w-full h-12 flex flex-row justify-center items-center gap-1 bg-[#F30919] text-[15px] text-white font-semibold"
						>
							Assign wallet <BiLinkExternal/>
						</button>
					</div>
				</div>
			</div>
		)
	}
}
