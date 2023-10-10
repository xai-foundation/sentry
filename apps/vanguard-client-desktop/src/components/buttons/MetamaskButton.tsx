import {useState} from "react";
import {useSDK} from '@metamask/sdk-react';

export function MetamaskButton() {
	const [account, setAccount] = useState<string>();
	const {sdk, connected, chainId} = useSDK();

	const connect = async () => {
		try {
			const accounts = await sdk?.connect();
			setAccount((accounts as any)?.[0]);
		} catch (err) {
			console.warn(`failed to connect..`, err);
		}
	};

	return (
		<div className="App">
			<button
				className="w-full bg-[#F30919] text-white p-3 uppercase font-semibold mt-2"
				onClick={connect}
			>
				Connect Wallet
			</button>
			{connected && (
				<div>
					<>
						{chainId && `Connected chain: ${chainId}`}
						<p></p>
						{account && `Connected account: ${account}`}
					</>
				</div>
			)}
		</div>
	);
};
