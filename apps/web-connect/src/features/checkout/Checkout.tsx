import {useEffect, useState} from "react";
import {WebBuyKeysQuantity} from "@/features/checkout/WebBuyKeysQuantity";
import {WebBuyKeysOrderTotal} from "@/features/checkout/WebBuyKeysOrderTotal";
import {useGetPriceForQuantity} from "@/features/checkout/hooks/useGetPriceForQuantity";
import {useContractWrite} from "wagmi";
import {config, NodeLicenseAbi} from "@sentry/core";
import {BiLoaderAlt} from "react-icons/bi";
import {FaCircleCheck} from "react-icons/fa6";
import {useProvider} from "@/features/checkout/hooks/useProvider";
import {AiOutlineInfoCircle} from "react-icons/ai";
import {Tooltip} from "@sentry/ui";
import {ReactComponent as XaiLogo} from "@/svgs/xai-logo.svg";
import {XaiBanner} from "@/features/checkout/XaiBanner";

export function Checkout() {
	const queryString = window.location.search;
	const queryParams = new URLSearchParams(queryString);
	const prefilledAmount = queryParams.get("quantity");
	const prefilledPromoCode = queryParams.get("promoCode");
	const [quantity, setQuantity] = useState<number>(1);
	const [promoCode, setPromoCode] = useState<string>("");

	const {data: getPriceData, isLoading: isPriceLoading} = useGetPriceForQuantity(quantity);
	const {data: providerData} = useProvider();
	const [discount, setDiscount] = useState({applied: false, error: false,});

	useEffect(() => {
		if (prefilledAmount) {
			setQuantity(Number(prefilledAmount));
		}
	}, [prefilledAmount]);

	useEffect(() => {
		if (prefilledPromoCode) {
			setPromoCode(prefilledPromoCode);
		}
	}, [prefilledPromoCode]);

	const {isLoading, isSuccess, write, error, data} = useContractWrite({
		address: config.nodeLicenseAddress as `0x${string}`,
		abi: NodeLicenseAbi,
		functionName: "mint",
		args: [quantity, promoCode],
		value: getPriceData && discount.applied ? getPriceData.price * BigInt(95) / BigInt(100) : getPriceData?.price,
		onError(error) {
			console.warn("Error", error);
		},
	});

	function returnToClient() {
		window.location = `xai-sentry://purchase-successful?txHash=${data?.hash}` as unknown as Location;
	}

	return (
		<div>
			<div className="h-full min-h-[90vh] flex flex-col justify-center items-center">
				<XaiBanner/>

				{isLoading && (
					<div className="w-[744px] h-[208px] flex flex-col justify-center border border-[#E5E5E5] m-4">
						<div className="w-full h-[390px] flex flex-col justify-center items-center gap-2">
							<BiLoaderAlt className="animate-spin" color={"#A3A3A3"} size={32}/>
							<p>Processing transaction...</p>
						</div>
					</div>
				)}

				{isSuccess && (
					<div
						className="flex flex-col justify-center items-center w-[744px] h-[320px] border border-gray-200 bg-white m-4">
						<div
							className="flex flex-col justify-center items-center gap-2">
							<FaCircleCheck color={"#16A34A"} size={64}/>
							<span className="text-2xl font-semibold mt-2">Purchase successful</span>
							<p className="text-[15px]">Transaction ID:
								<a
									onClick={() => window.open(`${providerData?.blockExplorer}/tx/${data?.hash}`)}
									className="text-[#F30919] ml-1 cursor-pointer"
								>
									{data?.hash}
								</a>
							</p>

							<button
								onClick={returnToClient}
								className="w-[436px] bg-[#F30919] text-white p-4 font-semibold mt-8"
							>
								Return to Xai Client
							</button>
							<div className="text-[15px] mt-1">
								Haven't installed Xai Client yet?
								<a
									onClick={() => window.open("https://xai.games/sentrynodes/", "_blank", "noopener noreferrer")}
									className="text-[#F30919] ml-1 cursor-pointer"
								>
									Click here to download and run a node.
								</a>
							</div>
						</div>
					</div>
				)}

				{!isLoading && !isSuccess && (
					<div className="w-[744px] h-auto flex flex-col justify-center border border-[#E5E5E5] m-4">
						<div className="w-full flex justify-center items-center border-b border-[#E5E5E5] px-6 py-4">
							<span className="text-3xl py-2 px-6 font-semibold">Your purchase is ready</span>
						</div>
						<div className="w-full flex justify-between items-center border-b border-[#E5E5E5] px-6 py-4">
							<div className="flex flex-col gap-2">
								<div className="flex flex-row items-center gap-1">
									<XaiLogo className="w-[16px]"/>
									<p className="text-lg font-semibold">
										Xai Sentry Node Key
									</p>
									<Tooltip
										header={"Xai keys are required for nodes to receive $esXAI network rewards."}
										body={"All purchases must be made in Arbitrum ETH."}
										width={452}
									>
										<AiOutlineInfoCircle size={16} className="text-[#A3A3A3]"/>
									</Tooltip>
								</div>
								<p className="w-[294px] text-[15px] text-[#525252]">
									Key for submitting one claim to each Xai network challenge
								</p>
							</div>

							{/*		Quantity section		*/}
							<WebBuyKeysQuantity quantity={quantity} setQuantity={setQuantity}/>
						</div>

						{/*		Order Total / Banner section		*/}
						<WebBuyKeysOrderTotal
							onClick={write}
							getPriceData={getPriceData}
							discount={discount}
							setDiscount={setDiscount}
							isPriceLoading={isPriceLoading}
							prefilledPromoCode={prefilledPromoCode}
							promoCode={promoCode}
							setPromoCode={setPromoCode}
							error={error}
						/>
					</div>
				)}
			</div>
		</div>
	)
}
