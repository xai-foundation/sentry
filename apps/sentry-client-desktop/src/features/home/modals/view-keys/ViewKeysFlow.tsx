import {ChangeEvent, useState} from "react";
import {BiLinkExternal, BiLoaderAlt} from "react-icons/bi";
import {listNodeLicenses} from "@sentry/core";
import {FaCircleCheck} from "react-icons/fa6";
import {useNavigate} from "react-router-dom";
import {useSetAtom} from "jotai";
import {drawerStateAtom} from "../../../drawer/DrawerManager.js";
import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";


export function ViewKeysFlow() {
	const [ownerAddress, setOwnerAddress] = useState('');
	const [ownerAddressError, setOwnerAddressError] = useState({
		errorResult: "",
		error: false,
	});

	const [loading, setLoading] = useState<boolean>(false)
	const [success, setSuccess] = useState<boolean>(false)

	const setDrawerState = useSetAtom(drawerStateAtom);
	const setModalState = useSetAtom(modalStateAtom);
	const navigate = useNavigate();

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		setOwnerAddress(event.target.value);
		setOwnerAddressError({
			errorResult: "",
			error: false,
		});
	};

	async function onAddWallet() {
		setLoading(true);

		try {
			const res = await listNodeLicenses(ownerAddress);

			if (res.length >= 1) {
				setLoading(false);
				setSuccess(true);
			} else {
				setLoading(false);
				setOwnerAddressError({
					errorResult: "No keys found in provided wallet",
					error: true,
				});
			}

		} catch (e) {
			setLoading(false);
			setOwnerAddressError({
				errorResult: "Invalid public key",
				error: true,
			});
			console.error("Invalid public key", e);
		}
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
	//todo: confirm this logic works
	if (!loading && success) {
		setTimeout(() => {
			setDrawerState(null);
			navigate("/keys")
		}, 4000);

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
				<div className="w-full flex flex-col gap-8 mt-12">
					<div className="flex flex-col gap-2 px-6 pt-8">
				<span className="text-[15px] text-[#525252] mt-2">
					Enter the the public key of the wallet you want to view keys for
				</span>

						<input
							type="text"
							value={ownerAddress}
							onChange={handleInputChange}
							className="w-full mt-2 p-3 border rounded"
							placeholder="Enter public key"
						/>

						{ownerAddressError.error && (
							<p className="text-[14px] text-[#AB0914]">{ownerAddressError.errorResult}</p>
						)}

						<button
							onClick={async () => onAddWallet()}
							className={`w-full h-12 flex flex-row justify-center items-center gap-1 ${ownerAddress ? "bg-[#F30919]" : "bg-gray-400"} text-[15px] text-white font-semibold mt-2 transition-all`}
							disabled={ownerAddress === ""}
						>
							Add wallet
						</button>

						<span className="text-[15px] text-[#525252] mt-8">
					Or connect wallet to view all keys in the wallet
				</span>

						<button
							onClick={() => {
								setModalState(ModalView.TransactionInProgress)
								window.electron.openExternal('http://localhost:7555/connect-wallet')
							}}
							className="w-full h-12 flex flex-row justify-center items-center gap-1 bg-[#F30919] text-[15px] text-white font-semibold"
						>
							Connect wallet <BiLinkExternal/>
						</button>
					</div>
				</div>
			</div>
		)
	}
}
