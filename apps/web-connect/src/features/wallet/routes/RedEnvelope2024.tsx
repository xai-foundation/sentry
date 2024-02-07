import {useAccount} from "wagmi";

export function RedEnvelope2024() {
	const {address} = useAccount();

	return (
		<div>
			<div className="h-full min-h-[90vh] flex flex-col items-center pt-40">
				<h1 className="text-3xl font-semibold text-center">XAI Red Envelope 2024</h1>

				{!address && (
					<>
						<p className="text-lg text-[#525252] max-w-[590px] text-center mt-2">
							Connect your wallet to check your eligibility.
						</p>
						<div className="m-8">
							<w3m-button/>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
