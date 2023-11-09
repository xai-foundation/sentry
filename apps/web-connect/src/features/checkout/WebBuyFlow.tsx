import {Dispatch, SetStateAction, useState} from "react";
import {WebBuyKeysOrderTotal} from "@/features/checkout/WebBuyKeysOrderTotal";
import {WebBuyKeysQuantity} from "@/features/checkout/WebBuyKeysQuantity";

interface WebBuyFlowProps {
	setPurchase: Dispatch<SetStateAction<boolean>>;
}

export function WebBuyFlow({setPurchase}: WebBuyFlowProps) {
	// const queryString = window.location.search;
	// const queryParams = new URLSearchParams(queryString);
	// const prefilledAmount = queryParams.get("quantity");

	const [quantity, setQuantity] = useState<number>(1);


	// prefilledAmount ? setQuantity(Number(prefilledAmount)) : setQuantity(1)
	// if (prefilledAmount) {
	// 	setQuantity(Number(prefilledAmount))
	// }

	return (
		<div className="w-[744px] h-auto flex flex-col justify-center border border-[#E5E5E5] m-4">
			<div className="w-full flex justify-center items-center border-b border-[#E5E5E5] px-6 py-4">
				<span className="text-3xl py-2 px-6 font-semibold">Your purchase is ready</span>
			</div>
			<div className="w-full flex justify-between items-center border-b border-[#E5E5E5] px-6 py-4">
				<div className="flex flex-col gap-2">
					<div className="flex flex-row items-center gap-2">
						<p className="flex gap-3 items-center text-lg font-semibold">
							{/*<XaiLogo className="w-[16px]"/>*/}
							Xai Sentry Node Key
						</p>
					</div>
					<p className="w-[294px] text-[15px] text-[#525252]">
						Key for submitting one claim to each Xai network challenge
					</p>
				</div>

				{/*		Quantity section		*/}
				<WebBuyKeysQuantity quantity={quantity} setQuantity={setQuantity}/>
			</div>

			{/*		Order Total / Banner section		*/}
			<WebBuyKeysOrderTotal quantity={quantity} setPurchase={setPurchase}/>
		</div>
	);
}


// const nodeLicenseContract = new ethers.Contract(config.nodeLicenseAddress, NodeLicenseAbi, signer);

// const {isLoading, isSuccess, write, error, data} = useContractWrite({
// 	address: config.nodeLicenseAddress as `0x${string}`,
// 	abi: NodeLicenseAbi,
// 	functionName: "mint",
// 	args: [quantity, referralAddress ? referralAddress : ethers.ZeroAddress],
// 	// args: [quantity, referralAddress],
// 	onSuccess(data) {
// 		window.location = `xai-sentry://unassigned-wallet?txHash=${data.hash}` as unknown as Location;
// 	},
// 	onError(error) {
// 		console.log("Error", error);
// 	},
// });

// console.log(isLoading, isSuccess, write, error, data);
