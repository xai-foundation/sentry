import {useEffect, useState} from "react";
import {WebBuyKeysQuantity} from "@/features/checkout/WebBuyKeysQuantity";
import {WebBuyKeysOrderTotal} from "@/features/checkout/WebBuyKeysOrderTotal";
import {useGetPriceForQuantity} from "@/features/checkout/hooks/useGetPriceForQuantity";
import {useContractWrite} from "wagmi";
import {config, NodeLicenseAbi} from "@sentry/core";
import {BiLoaderAlt} from "react-icons/bi";
import {FaCircleCheck} from "react-icons/fa6";
import {useProvider} from "@/features/checkout/hooks/useProvider";
import {CustomTooltip, PrimaryButton} from "@sentry/ui";
import { InfoPointRed, RedSentryIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";
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
			<div className="h-full xl:min-h-screen flex-1 flex flex-col justify-center items-center">
				{isLoading && (
					<div className="lg:w-[744px] h-[208px] sm:w-[90%] flex flex-col justify-center bg-darkLicorice m-4">
						<div className="w-full h-[390px] flex flex-col justify-center items-center gap-2">
							<BiLoaderAlt className="animate-spin" color={"#F30919"} size={32}/>
							<p className="text-elementalGrey text-[18px]">Transaction in progress…</p>
						</div>
					</div>
				)}

				{isSuccess && (
					<div
						className="flex flex-col justify-center items-center sm:max-w-[90%] lg:w-[844px] lg:px-[60px] lg:py-[40px] sm:px-[20px] sm:py-[35px] bg-darkLicorice m-4 shadow-main">
						<div
							className="flex flex-col justify-center items-center gap-2">
							<FaCircleCheck color={"#16A34A"} size={64}/>
							<span className="text-3xl text-white text-center uppercase font-bold mt-2">Purchase successful</span>
							<div className="flex lg:flex-row sm:flex-col break-words"> 
							<span className="text-[18px] sm:text-center text-elementalGrey">Transaction ID:</span>
							<a
								onClick={() => window.open(`${providerData?.blockExplorer}/tx/${data?.hash}`)}
									className="text-white text-center underline ml-1 cursor-pointer text-[18px] sm:max-w-[260px] lg:max-w-full"
								>
								{data?.hash}
							</a>
							</div>
							<PrimaryButton onClick={returnToClient} btnText={"Return to Xai Client"} colorStyle="primary" className="w-full text-white text-xl font-bold my-8 uppercase"/>
							<div className="flex lg:flex-row sm:flex-col items-center text-[18px] text-americanSilver mt-1">
								<span>Haven't installed Xai Client yet?</span>
								<a
									onClick={() => window.open("https://xai.games/sentrynodes/", "_blank", "noopener noreferrer")}
									className="text-[#F30919] ml-1 cursor-pointer font-bold"
								>
									Download it here.
								</a>
							</div>
						</div>
					</div>
				)}

				{!isLoading && !isSuccess && (
					<div className="h-auto sm:w-[90%] lg:w-auto flex sm:flex-col lg:flex-row justify-center bg-darkLicorice shadow-main md:my-0 my-[24px]">
						<div className="flex flex-col justify-start items-center h-auto sm:px-4 sm:py-4 lg:p-12 xg:pl-[80px] lg:pt-1 ">
							<div className="w-full flex justify-center">
								<img className="max-w-[280px]" src={logo} />
							</div>
							<div className="w-full flex justify-center lg:max-w-[280px]">
								<span className="sm:text-4xl lg:text-6xl text-center font-bold text-white">YOUR PURCHASE IS READY</span>
							</div>
					</div>
						<div className="h-auto xl:p-12 sm:px-2 sm:py-10">
						<div className="flex sm:flex-col lg:flex-row justify-between lg:items-start sm:items-center">
							<div className="flex flex-col sm:items-center lg:items-start gap-2">
								<div className="flex flex-row sm:w-full sm:justify-center lg:justify-start items-center gap-1">
									<RedSentryIcon width={32} height={32} />
								<p className="sm:text-2xl lg:text-3xl text-white font-bold">
									XAI SENTRY NODE KEY
								</p>
								<div className="h-full flex items-center ml-2">
									<CustomTooltip
										header={"Xai keys are required for nodes to receive $esXAI network rewards."}
										content={"All purchases must be made in Arbitrum ETH."}
										extraClasses={{tooltipContainer: "sm:w-[340px] lg:w-[452px] sm:left-[-295px] lg:left-[-38px]"}}
									>
										<InfoPointRed/>
									</CustomTooltip></div>
								</div>
								<p className="sm:w-full lg:w-[400px] sm:text-center sm:px-8 lg:px-0 lg:text-left text-[18px] text-elementalGrey font-medium">
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
