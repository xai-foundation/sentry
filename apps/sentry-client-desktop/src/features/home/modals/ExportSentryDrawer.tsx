import {AiOutlineCheck, AiOutlineClose} from "react-icons/ai";
import {useSetAtom} from "jotai";
import {drawerStateAtom} from "../../drawer/DrawerManager.js";
import {useOperator} from "../../operator";
import {useState} from "react";
import {BiLoaderAlt} from "react-icons/bi";
import log from "electron-log";
import {CopyIcon} from "@sentry/ui/dist/src/rebrand/icons/IconsComponents";

export function ExportSentryDrawer() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {isLoading, privateKey} = useOperator();
	const [copied, setCopied] = useState<boolean>(false);

	function copyPrivateKey() {
		if (privateKey && navigator.clipboard) {
			navigator.clipboard.writeText(privateKey)
				.then(() => {
					setCopied(true);
					setTimeout(() => {
						setCopied(false);
					}, 2000);
				})
				.catch(err => {
					log.error('Unable to copy to clipboard: ', err);
				});
		} else {
			log.error('Clipboard API not available, unable to copy to clipboard');
		}
	}

	function wrapTextWithLineBreaks() {
		if (privateKey) {
			let result = '';
			for (let i = 0; i < privateKey.length; i += 42) {
				result += privateKey.slice(i, i + 42) + '\n';
			}
			return result;
		}
	}

	const wrappedPrivateKey = wrapTextWithLineBreaks();

	return (
		<div>
			<div className="h-full flex flex-col justify-start items-center">
				<div
					className="w-full flex flex-row text-white justify-between items-center border-b border-chromaphobicBlack">
					<div className="flex flex-row gap-2 justify-between w-full items-center text-2xl font-bold px-8 py-[24px]">

						<span>Export Sentry Wallet</span>
						<span
							onClick={() => {
								setDrawerState(null)
							}}
							className="cursor-pointer"
						>
							<AiOutlineClose size={20} color="white" className="hover:!text-hornetSting duration-300 ease-in" />
						</span>
					</div>
				</div>

				{isLoading ? (
					<div
						className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
						<BiLoaderAlt className="animate-spin" color={"#FF0030"} size={32}/>
						<span className="text-lg">Loading private key...</span>
					</div>

				) : (
					<div className="w-full flex flex-col gap-8">
						<div className="flex flex-col gap-2 px-6 pt-6">
							<p className="text-lg font-medium text-americanSilver">
								By exporting a Sentry Wallet, you can continue running your node on another client
								without the need
								to leave your local machine on.
							</p>

							<p className="text-lg font-medium text-americanSilver mt-4 mb-5">
								Here is the private key of the Sentry Wallet
							</p>

							<div className="p-[1px] w-full h-full bg-chromaphobicBlack global-clip-btn">
								<div
									onClick={() => copyPrivateKey()}
									className="relative bg-dynamicBlack w-full h-fit flex justify-between text-americanSilver p-2 cursor-pointer overflow-hidden text-lg font-medium global-clip-btn"
								>
									<p className="w-full">{wrappedPrivateKey}</p>
									<div
										className="absolute flex justify-center items-center bottom-0 right-0 p-2">
										{copied ? <AiOutlineCheck className="h-[15px]"/> : <CopyIcon/>}
									</div>
								</div>
							</div>

							<p className="text-lg font-medium text-americanSilver mt-5">
								Want to run a cloud instance?
								<a
									onClick={() => window.electron.openExternal("https://xai-foundation.gitbook.io/xai-network/xai-blockchain/sentry-node-purchase-and-setup/step-2-download-and-run-the-xai-sentry-node")}
									className="text-[#F30919] ml-1 cursor-pointer font-bold hover:text-white duration-300 ease-in-out"
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
