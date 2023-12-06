import {AiOutlineClose} from "react-icons/ai";
import {useSetAtom} from "jotai";
import {drawerStateAtom} from "../../drawer/DrawerManager.js";
import {useOperator} from "../../operator";
import {ChangeEvent, useState} from "react";
import {BiLoaderAlt} from "react-icons/bi";
import {ImportSentryAlertModal} from "@/features/home/modals/ImportSentryAlertModal";
import {verifyPrivateKey} from "@sentry/core";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";

export function ImportSentryDrawer() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {isLoading, importPrivateKey} = useOperator();
	const {stopRuntime} = useOperatorRuntime();
	const [inputValue, setInputValue] = useState('');
	const [showModal, setShowModal] = useState<boolean>(false);
	const [privateKeyError, setPrivateKeyError] = useState({
		message: "",
		error: false,
	});

	const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
		setInputValue(event.target.value);

		if (inputValue === "") {
			setPrivateKeyError({
				message: "",
				error: false,
			});
		}
	};

	const handleButton = () => {
		const validPrivateKey = verifyPrivateKey(inputValue);

		if (!validPrivateKey) {
			setInputValue("");
			setPrivateKeyError({
				message: "Private key not valid",
				error: true,
			});
		}

		if (inputValue !== "" && validPrivateKey) {
			setShowModal(true);
		}
	}

	const handleSetData = () => {
		importPrivateKey(inputValue).then(() => {
			setDrawerState(null)
			if (stopRuntime) {
				void stopRuntime()
			}
		});
	};

	return (
		<div>
			{showModal && (
				<ImportSentryAlertModal
					setShowModal={setShowModal}
					onSuccess={handleSetData}
				/>
			)}
			<div className="h-full flex flex-col justify-start items-center">
				<div
					className="absolute top-0 w-full h-[4rem] flex flex-row justify-between items-center border-b border-gray-200 text-lg font-semibold px-8">
					<span>Import Sentry Wallet</span>
					<div className="cursor-pointer z-10" onClick={() => setDrawerState(null)}>
						<AiOutlineClose/>
					</div>
				</div>

				{isLoading ? (
					<div
						className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
						<BiLoaderAlt className="animate-spin" color={"#A3A3A3"} size={32}/>
						<span className="text-lg">Importing Sentry Wallet...</span>
					</div>

				) : (
					<div className="w-full flex flex-col gap-8 mt-12">
						<div className="flex flex-col gap-2 px-6 pt-8">

							<p className="text-[15px] text-[#525252] mt-2">
								By importing a Sentry Wallet, you can continue running your node without the need to
								leave your local machine on.
							</p>

							<p className="text-[15px] text-[#525252] mt-3">
								Enter the the private key of the Sentry Wallet you would like to import
							</p>

							<div className="w-full h-full flex flex-col justify-center items-center">
								<input
									type="text"
									value={inputValue}
									onChange={handleInputChange}
									className="w-full mt-2 p-2 border rounded"
									placeholder="Enter private key"
								/>

								{privateKeyError.error && (
									<p className="w-full text-[14px] text-[#AB0914]">{privateKeyError.message}</p>
								)}

								<button
									onClick={handleButton}
									className="w-full flex justify-center items-center gap-1 text-[15px] text-white bg-[#F30919] font-semibold mt-3 px-6 py-3"
								>
									Confirm import
								</button>
							</div>

							<p className="text-[15px] text-[#525252] mt-3">
								Want to run a cloud instance?
								<a
									onClick={() => window.electron.openExternal("https://xai-foundation.gitbook.io/xai-network/xai-blockchain/xai-protocol/sentry-nodes-explained/who-can-operate-a-sentry")}
									className="text-[#F30919] ml-1 cursor-pointer"
								>
									Learn more
								</a>
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
