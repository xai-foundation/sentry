import {AiOutlineCheck, AiOutlineClose} from "react-icons/ai";
import {useSetAtom} from "jotai";
import {drawerStateAtom} from "../../drawer/DrawerManager.js";
import {useOperator} from "../../operator";
import {PiCopy} from "react-icons/pi";
import {useState} from "react";
import {BiLoaderAlt} from "react-icons/bi";

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
					console.error('Unable to copy to clipboard: ', err);
				});
		} else {
			console.error('Clipboard API not available, unable to copy to clipboard');
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
					className="absolute top-0 w-full h-[4rem] flex flex-row justify-between items-center border-b border-gray-200 text-lg font-semibold px-8">
					<span>Export Sentry Wallet</span>
					<div className="cursor-pointer z-10" onClick={() => setDrawerState(null)}>
						<AiOutlineClose/>
					</div>
				</div>

				{isLoading ? (
					<div
						className="absolute top-0 bottom-0 left-0 right-0 m-auto flex flex-col justify-center items-center gap-4">
						<BiLoaderAlt className="animate-spin" color={"#A3A3A3"} size={32}/>
						<span className="text-lg">Loading private key...</span>
					</div>

				) : (
					<div className="w-full flex flex-col gap-8 mt-12">
						<div className="flex flex-col gap-2 px-6 pt-8">

							<p className="text-[15px] text-[#525252] mt-2">
								By exporting a Sentry Wallet, you can continue running your node on another client
								without the need
								to leave your local machine on.
							</p>

							<p className="text-[15px] text-[#525252] mt-2">
								Here is the private key of the Sentry Wallet
							</p>

							<div
								onClick={() => copyPrivateKey()}
								className="relative w-full h-fit flex justify-between text-[#A3A3A3] border border-[#A3A3A3] p-2 cursor-pointer overflow-hidden"
							>
								<p className="w-full">{wrappedPrivateKey}</p>
								<div
									className="absolute flex justify-center items-center bg-white bottom-0 right-0 p-2">
									{copied ? <AiOutlineCheck className="h-[15px]"/> : <PiCopy/>}
								</div>
							</div>

							<p className="text-[15px] text-[#525252] mt-2">
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
