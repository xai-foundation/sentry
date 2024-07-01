import {ChangeEvent, useState} from "react";
import {BiLinkExternal, BiLoaderAlt} from "react-icons/bi";
import {FaCircleCheck} from "react-icons/fa6";
import {useSetAtom} from "jotai";
import {modalStateAtom, ModalView} from "@/features/modal/ModalManager";
import {useStorage} from "@/features/storage";
import {useNavigate} from "react-router-dom";
import {drawerStateAtom} from "@/features/drawer/DrawerManager";
import {useOperator} from "@/features/operator";
import { PrimaryButton } from "@sentry/ui";
import BaseCallout from "@sentry/ui/src/rebrand/callout/BaseCallout";
import { WarningIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";

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
				<span className="text-lg text-bold text-white">Wallet added successfully</span>
			</div>
		)
	}

	// Default state
	if (!loading && !success) {
		return (
			<div>
				<div className="w-full flex flex-col gap-8">
					<div className="flex flex-col gap-2">
						<div className="border-b border-chromaphobicBlack px-6 pt-5 pb-7">
						<p className="text-lg text-americanSilver">
							Enter the the public key of the wallet you want to view keys for
						</p>
                       <div className="w-full bg-foggyLondon global-clip-primary-btn p-[1px] mb-3 mt-4 focus-within:bg-hornetSting">
						<input
							type="text"
							value={ownerAddress}
							onChange={handleInputChange}
							className="w-full p-3 global-clip-primary-btn focus:outline-0 placeholder:text-americanSilver placeholder:text-lg bg-nulnOil text-americanSilver"
							placeholder="Enter public key"
						/>
						</div>

						{ownerAddressError.error && (
							<BaseCallout isWarning extraClasses={{calloutWrapper: "w-full text-bananaBoat my-2"}}> <WarningIcon width={20} height={20}/> <span className="ml-2">{ownerAddressError.errorResult}</span></BaseCallout>
						)}

						<PrimaryButton
							onClick={async () => onAddWallet()}
							className={`w-full text-xl uppercase font-semibold transition-all`}
							isDisabled={ownerAddress === ""}
							btnText="Add wallet"
							colorStyle="outline"
						/>
						</div>
                        <div className="px-6 pt-4">
						<p className="text-lg text-americanSilver mb-5">
							Or connect wallet to view all keys in the wallet
						</p>

						<PrimaryButton
							onClick={startAssignment}
							className="w-full flex flex-row justify-center items-center gap-1 text-xl font-bold uppercase"
							btnText="Connect wallet"
							icon={<BiLinkExternal size={20}/>}
						/>
						</div>
					</div>
				</div>
			</div>
		)
	}
}
