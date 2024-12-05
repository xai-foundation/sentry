import { PrimaryButton } from "@sentry/ui/src/rebrand";
import { FaCircleCheck } from "react-icons/fa6";
import { useWebBuyKeysContext } from "../contexts/useWebBuyKeysContext";
import { CopyIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";
import ExternalLinkIcon from "@sentry/ui/src/rebrand/icons/ExternalLinkIcon";
import { Tooltip } from "@sentry/ui";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import BackArrow from "@sentry/ui/src/rebrand/icons/BackArrow";
import { stakingPageURL } from "../Checkout";
import ShareButton from "@sentry/ui/src/rebrand/buttons/ShareButton";
const { VITE_APP_ENV } = import.meta.env
import { useTranslation } from "react-i18next";

let timeoutId: number;

interface IPurchaseSuccessful {
	returnToClient: (hash: string) => void;
}

const salePageBaseURL = `https://${VITE_APP_ENV === "development" ? "develop." : ""}sentry.xai.games`;
const operatorDownloadLink = "https://github.com/xai-foundation/sentry/releases/latest"

const PurchaseSuccessful: React.FC<IPurchaseSuccessful> = ({ returnToClient }) => {
	const { mintWithEth, mintWithXai, mintWithCrossmint, blockExplorer } = useWebBuyKeysContext();

	const { address } = useAccount();
	const [isTooltipAllowedToOpen, setIsTooltipAllowedToOpen] = useState(false);
	const [canShare, setCanShare] = useState(false);
    const { t: translate } = useTranslation("Checkout");

    useEffect(() => {
		setCanShare(navigator.share !== undefined);
	}, []);

	const getHash = () => {
		const hash = mintWithEth.data ?? mintWithXai.data ?? mintWithCrossmint.txHash;
		if (!hash) {
			throw new Error("No hash found");
		}
		return hash;
	}

	const handleReturnToClient = () => {
		returnToClient(getHash());
	}

	const copyReferralCode = () => {
		if (address) {

			navigator.clipboard.writeText(`${salePageBaseURL}?promoCode=${address}`);
			setIsTooltipAllowedToOpen(true);

			if (timeoutId) {
				clearTimeout(timeoutId);
			}

			timeoutId = window.setTimeout(() => {
				setIsTooltipAllowedToOpen(false);
			}, 2000);
		}
	}


	return (
		<div className="flex flex-col justify-center sm:max-w-[90%] lg:w-[450px] lg:py-[20px]sm:py-[35px] bg-knightRider m-4 shadow-main">
			<div className="px-[20px] pt-[30px] mb-[30px]">
				<button
					onClick={handleReturnToClient}
					className="text-white text-lg flex items-center group hover:text-hornetSting duration-300">
					<BackArrow height={12} className="group-hover:fill-hornetSting fill-white duration-300" />
                    {translate("backButton")}
				</button>
			</div>
			<div className="flex flex-col justify-center items-center gap-2">
				<FaCircleCheck color={"#16A34A"} size={64} />
				<span
					className="text-3xl text-white text-center uppercase font-bold mt-2">{translate("successfulPurchase.title")}</span>
				<span className="block text-foggyLondon font-bold text-base max-w-[260px] text-center my-[10px]">{translate("successfulPurchase.text")}</span>
				<div className="bg-optophobia w-full ">
					<div className="flex justify-between border-t border-chromaphobicBlack px-[20px] py-[15px]">
						<span className="text-[18px] sm:text-center text-elementalGrey ">{translate("successfulPurchase.transactionId")}</span>
						<a
							onClick={() => window.open(`${blockExplorer}/tx/${getHash()}`)}
							className="group hover:text-hornetSting duration-300 text-wrap text-elementalGrey text-center underline ml-1 cursor-pointer text-[18px] sm:max-w-[260px] lg:max-w-full"
						>
							<div className="flex items-center gap-[10px]">
								{getHash().slice(0, 6)}...{getHash().slice(-4)}
								<ExternalLinkIcon
									extraClasses={{ svgClasses: "group-hover:fill-hornetSting fill-elementalGrey duration-300" }} />
							</div>
						</a>
					</div>
					<div className="w-full text-elementalGrey text-[18px] flex justify-between border-t border-b border-chromaphobicBlack items-start px-[20px] py-[15px]">
						<div className="flex flex-col items-end">
							{address &&
								<div className="relative">
									<p className="text-base">{translate("successfulPurchase.promo.shareLink")}</p>
									<p className="text-base mb-3">{translate("successfulPurchase.promo.info")}</p>
									<div
										className={`p-[1px] w-full h-full bg-chromaphobicBlack global-clip-btn`}>
										<div
											className={`relative items-center lg:w-[400px] w-full bg-optophobia h-fit flex justify-between text-americanSilver p-2 overflow-hidden text-lg font-medium global-clip-btn`}
										>
											<p className="select-none lg:max-w-[300px] sx:max-w-[210px] sm:max-w-[190px] overflow-x-hidden">{`${salePageBaseURL}/${address}`}</p>

										</div>
									</div>			
									{canShare ? <div className="mr-3 cursor-pointer absolute right-[10px] sx:top-[73px] sm:top-[96px] z-60">
										<ShareButton
										buttonText={translate("successfulPurchase.shareButton.text")}
										buttonTitle={translate("successfulPurchase.shareButton.title")}
										shareUrl={`${salePageBaseURL}?promoCode=${address}`}
										shareButtonClasses={"w-full"}
									/></div> : 
									<div className="mr-3 cursor-pointer absolute right-[10px] sx:top-[73px] sm:top-[96px] z-60" onClick={copyReferralCode}>
										<Tooltip body={translate("successfulPurchase.copyTooltip")} open={isTooltipAllowedToOpen} extraClasses={{ content: " max-w-[75px]", body: "!text-black !font-bold" }}>
											<CopyIcon />
										</Tooltip>
									</div>
									}
								</div>}
						</div>
					</div>
				</div>
				<p className="text-elementalGrey my-3 px-[10px] font-bold">{translate("successfulPurchase.stakePromo.title")}</p>
				<div className="px-[20px] w-full">
					<PrimaryButton onClick={() => window.open(stakingPageURL)} btnText={translate("successfulPurchase.stakePromo.buttonText")} colorStyle="primary" className="w-full text-xl font-bold uppercase text-brandyWine" />
				</div>
				<a className="text-elementalGrey font-bold underline mb-5 mt-3" href={operatorDownloadLink} target={"_blank"}>{translate("successfulPurchase.stakePromo.downloadOperator")}</a>
			</div>
		</div>
	);
};

export default PurchaseSuccessful;
