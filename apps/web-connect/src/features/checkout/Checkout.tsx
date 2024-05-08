import {useEffect, useState} from "react";
import {WebBuyKeysQuantity} from "@/features/checkout/WebBuyKeysQuantity";
import {WebBuyKeysOrderTotal} from "@/features/checkout/WebBuyKeysOrderTotal";
import {useGetPriceForQuantity} from "@/features/checkout/hooks/useGetPriceForQuantity";
import {useContractWrite} from "wagmi";
import {config, NodeLicenseAbi} from "@sentry/core";
import {BiLoaderAlt} from "react-icons/bi";
import {FaCircleCheck} from "react-icons/fa6";
import {useProvider} from "@/features/checkout/hooks/useProvider";
import {Tooltip} from "@sentry/ui";
import { InfoPointRed, RedSentryIcon, WarningIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";
import logo from '../../../public/images/sentry-main.png'

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
					<div className="w-[1300px] h-auto flex justify-center bg-darkLicorice shadow-main">
						<div className="flex flex-col justify-start items-center w-[600px] h-auto py-12 pt-1">
							<div className="w-full flex justify-center">
								<img className="max-w-[280px]" src={logo} />
							</div>
							<div className="w-full flex justify-center max-w-[200px]">
								<span className="text-5xl text-center font-bold text-white">YOUR PURCHASE IS READY</span>
							</div>
							<div className="flex items-center mt-2">
								<WarningIcon width={20} height={20} />
								<span className="text-[#66d058] font-semibold ml-2">You are on the official Xai.games website</span>
							</div>
					</div>
						<div className="w-[750px] h-auto py-12 pr-[100px]">
						<div className="flex justify-between items-start">
							<div className="flex flex-col gap-2">
								<div className="flex flex-row items-center gap-1">
									<RedSentryIcon width={32} height={32} />
									<p className="text-2xl text-white font-semibold">
										XAI SENTRY NODE KEY
									</p>
									<Tooltip
										header={"Xai keys are required for nodes to receive $esXAI network rewards."}
										body={"All purchases must be made in Arbitrum ETH."}
										width={452}
									>
										<InfoPointRed/>
									</Tooltip>
								</div>
								<p className="w-[400px] text-base text-[#525252]">
									Each Sentry Node Key enables you to submit up to 1 reward claim for each network challenge.
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
					</div>
				)}
			</div>
		</div>
	)
}
