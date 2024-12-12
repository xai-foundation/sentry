import { useCallback, useEffect, useState } from 'react';
import { PrimaryButton } from "@sentry/ui";
import BaseCallout from "@sentry/ui/src/rebrand/callout/BaseCallout";
import { WarningIcon } from "@sentry/ui/src/rebrand/icons";
import { mapWeb3Error } from "@/utils/errors";
import { useWebBuyKeysContext } from '../contexts/useWebBuyKeysContext';
import CrossmintModal from './crossmint/CrossmintModal';
import { isValidNetwork } from '@sentry/core';
import { useNetworkConfig } from '@/hooks/useNetworkConfig';
import { convertEthAmountToUsdcAmount } from '@/utils/convertEthAmountToUsdcAmount';
import { useTranslation } from "react-i18next";
import ReactGA from "react-ga4";


/**
 * ActionSection Component
 * 
 * This component renders the main action button for buying Sentry Keys
 * and displays relevant error messages. It uses the WebBuyKeysContext to
 * access shared state and functions.
 * 
 * @returns {JSX.Element} The rendered ActionSection component
 */
export function ActionSection(): JSX.Element {
    const [creditCardOpen, setCreditCardOpen] = useState(false);
    const { isDevelopment } = useNetworkConfig();
    const [isInitialized, setIsInitialized] = useState(false);
    const [totalPriceInUsdc, setTotalPriceInUsdc] = useState<string>("0");

    // Destructure values and functions from the context
    const {
        currency,
        ready,
        chainId,
        userHasTokenBalance,
        mintWithEth,
        mintWithXai,
        mintWithEthError,
        approve,
        quantity,
        promoCode,
        isConnected,
        getApproveButtonText,
        handleApproveClicked,
        handleMintWithEthClicked,
        handleMintWithXaiClicked,
        getEthButtonText,
        calculateTotalPrice,
        setCurrency,
        mintWithCrossmint,
        discount,
    } = useWebBuyKeysContext();
    const { t: translate } = useTranslation("Checkout");

    /**
     * Determines the text to display on the main action button for token transactions
     * 
     * @returns {string} The button text
     */
    const getTokenButtonText = useCallback(() => {
        if (mintWithEth.isPending || mintWithXai.isPending || approve.isPending) return translate("actionSection.tokenButtonTexts.isPending");
        if (!isValidNetwork(chainId, isDevelopment)) return translate("actionSection.tokenButtonTexts.switchToArbitrum");
        const [buttonText] = getApproveButtonText();
        return buttonText;
    }, [mintWithEth.isPending, mintWithXai.isPending, approve.isPending, chainId, getApproveButtonText]);

    const handleBuyWithXaiClicked = async () => {
        const [_, isApprove] = getApproveButtonText();
        if (isApprove) {
            handleApproveClicked();
        } else {
            handleMintWithXaiClicked();
        }
    };

    useEffect(() => {
        async function setUsdcPrice(){
            setIsInitialized(false);
            const usdcPrice = await convertEthAmountToUsdcAmount(calculateTotalPrice(), 18); // USDC Price in 18 decimals
            setTotalPriceInUsdc(usdcPrice.toString());
            setIsInitialized(true);
        }
        setUsdcPrice();
    }, [quantity, promoCode]);

    return (
        <div className="flex flex-col justify-center gap-8 mt-8">
            <div>
                {/* Render different buttons based on the currency */}
                {currency === 'AETH' ? (
                    <>
                    <PrimaryButton
                        onClick={() => {
                            handleMintWithEthClicked()
                            ReactGA.event({
                                category: 'User',
                                action: 'buttonClick',
                                label: 'mintNow'
                            });
                        }}
                        className={`w-full h-16 ${ready ? "bg-[#F30919] global-clip-path" : "bg-gray-400 cursor-default !text-[#726F6F]"} text-lg text-white p-2 uppercase font-bold`}
                        isDisabled={!ready || !isValidNetwork(chainId, isDevelopment) || getEthButtonText()[1] || !isConnected}
                        btnText={getEthButtonText()[0]}
                    />
                    </>
                ) : (
                    <PrimaryButton
                        onClick={handleBuyWithXaiClicked}
                        className={`w-full h-16 ${ready ? "bg-[#F30919] global-clip-path" : "bg-gray-400 cursor-default !text-[#726F6F]"} text-lg text-white p-2 uppercase font-bold`}
                        isDisabled={!ready || !isValidNetwork(chainId, isDevelopment) || !userHasTokenBalance || !isConnected}
                        btnText={getTokenButtonText()}
                    />
                )}
                <br />
                {isConnected && isInitialized && <PrimaryButton
                    onClick={() => {
                        ReactGA.event({
                            category: "User",
                            action: "buttonClick",
                            label: "mintCrossmint",
                        });
                        setCreditCardOpen(true)
                        setCurrency("AETH"); // Currency must be AETH for USDC Calculation used in Crossmint
                    }}
                    className={`w-full h-16 ${ready ? "bg-[#F30919] global-clip-path" : "bg-gray-400 cursor-default !text-[#726F6F]"} text-lg text-hornetSting p-2 uppercase font-bold `}
                    isDisabled={!ready || !isConnected}
                    colorStyle="outline-2"
                    btnText={translate("actionSection.mintWithOptions")}
                />}

                {/* Error section for ETH transactions */}
                {mintWithEth.error && (
                    <div>
                        {mintWithEthError && mapWeb3Error(mintWithEthError) === "Insufficient funds" && (
                            <BaseCallout extraClasses={{ calloutWrapper: "md:h-[100px] h-[159px] mt-[12px]", calloutFront: "!justify-start" }} isWarning>
                                <div className="flex md:gap-[21px] gap-[10px]">
                                    <span className="block mt-2"><WarningIcon /></span>
                                    <div>
                                        <span className="block font-bold text-lg">{translate("actionSection.mintWithEthError.insufficientFundsError.title")}</span>
                                        <span className="block font-medium text-lg">{translate("actionSection.mintWithEthError.insufficientFundsError.text")}</span>
                                    </div>
                                </div>
                            </BaseCallout>
                        )}
                        {mapWeb3Error(mintWithEth.error) === "User rejected the request" && (
                            <BaseCallout extraClasses={{ calloutWrapper: "md:h-[85px] h-[109px] mt-[12px]", calloutFront: "!justify-start" }} isWarning>
                                <div className="flex md:gap-[21px] gap-[10px]">
                                    <span className="block mt-2"><WarningIcon /></span>
                                    <div>
                                        <span className="block font-bold text-lg">{translate("actionSection.mintWithEthError.userRejectedRequest.title")}</span>
                                        <span className="block font-medium text-lg">{translate("actionSection.mintWithEthError.userRejectedRequest.title")}</span>
                                    </div>
                                </div>
                            </BaseCallout>
                        )}
                    </div>
                )}

                {/* Error section for Xai/esXai transactions */}
                {mintWithXai.error && (
                    <div>
                        {mapWeb3Error(mintWithXai.error) === "User rejected the request" && (
                            <BaseCallout extraClasses={{ calloutWrapper: "md:h-[85px] h-[109px] mt-[12px]", calloutFront: "!justify-start" }} isWarning>
                                <div className="flex md:gap-[21px] gap-[10px]">
                                    <span className="block mt-2"><WarningIcon /></span>
                                    <div>
                                        <span className="block font-bold text-lg">{translate("actionSection.mintWithXaiError.userRejectedRequest.title")}</span>
                                        <span className="block font-medium text-lg">{translate("actionSection.mintWithXaiError.userRejectedRequest.title")}</span>
                                    </div>
                                </div>
                            </BaseCallout>
                        )}
                    </div>
                )}

                {/* Error section for allowance approval */}
                {approve.error && (
                    <div>
                        {mapWeb3Error(approve.error) === "User rejected the request" && (
                            <BaseCallout extraClasses={{ calloutWrapper: "md:h-[85px] h-[109px] mt-[12px]", calloutFront: "!justify-start" }} isWarning>
                                <div className="flex md:gap-[21px] gap-[10px]">
                                    <span className="block mt-2"><WarningIcon /></span>
                                    <div>
                                        <span className="block font-bold text-lg">{translate("actionSection.approveError.userRejectedRequest.title")}</span>
                                        <span className="block font-medium text-lg">{translate("actionSection.approveError.userRejectedRequest.title")}</span>
                                    </div>
                                </div>
                            </BaseCallout>
                        )}
                    </div>
                )}

                {(mintWithCrossmint.error != "") && (
                    <div>
                        <BaseCallout extraClasses={{ calloutWrapper: "md:h-[85px] h-[109px] mt-[12px]", calloutFront: "!justify-start" }} isWarning>
                            <div className="flex md:gap-[21px] gap-[10px]">
                                <span className="block mt-2"><WarningIcon /></span>
                                <div>
                                    <span className="block font-bold text-lg">Error minting with Credit/Debit Card</span>
                                    {/* We currently have no way of knowing all the possible errors that could come from minting with crossmint, so we should log in the console and display a generic error rather than the error message. */}
                                    <span className="block font-medium text-lg">There was an error processing your credit card payment</span>
                                </div>
                            </div>
                        </BaseCallout>
                    </div>
                )}
            </div>
            <CrossmintModal
                totalPriceInUsdc={discount.applied ? (BigInt(totalPriceInUsdc) * 95n / 100n).toString() : totalPriceInUsdc}
                isOpen={creditCardOpen}
                onClose={() => setCreditCardOpen(false)}
                totalQty={quantity}
                promoCode={promoCode}
            />
        </div>
    );
}
