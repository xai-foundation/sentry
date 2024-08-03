import { useCallback } from 'react';
import { PrimaryButton } from "@sentry/ui";
import BaseCallout from "@sentry/ui/src/rebrand/callout/BaseCallout";
import { WarningIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";
import { mapWeb3Error } from "@/utils/errors";
import { useWebBuyKeysContext } from '../contexts/useWebBuyKeysContext';

/**
 * ActionSection Component
 * 
 * This component renders the main action button for buying Sentry Node Keys
 * and displays relevant error messages. It uses the WebBuyKeysContext to
 * access shared state and functions.
 * 
 * @returns {JSX.Element} The rendered ActionSection component
 */
export function ActionSection(): JSX.Element {
    // Destructure values and functions from the context
    const {
        currency,
        ready,
        chain,
        userHasTokenBalance,
        mintWithEth,
        mintWithXai,
        mintWithEthError,
        approve,
        getApproveButtonText,
        handleApproveClicked,
        handleMintWithEthClicked,
        handleMintWithXaiClicked,
    } = useWebBuyKeysContext();

    /**
     * Determines the text to display on the main action button for ETH transactions
     * 
     * @returns {string} The button text
     */
    const getButtonText = useCallback(() => {
        if (mintWithEth.isPending || mintWithXai.isPending) return "WAITING FOR CONFIRMATION"; 
        // if (chain?.id !== 42161) return "Please Switch to Arbitrum One";

        return "BUY NOW";
    }, [mintWithEth.isPending, mintWithXai.isPending, chain]);

    /**
     * Determines the text to display on the main action button for token transactions
     * 
     * @returns {string} The button text
     */
    const getTokenButtonText = useCallback(() => {
        if (mintWithEth.isPending || mintWithXai.isPending || approve.isPending) return "WAITING FOR CONFIRMATION.."; 
        // if (chain?.id !== 42161) return "Please Switch to Arbitrum One";

        return getApproveButtonText();
    }, [mintWithEth.isPending, mintWithXai.isPending, approve.isPending, chain, getApproveButtonText]);

    const handleBuyWithXaiClicked = async () => { 
        if (getTokenButtonText().startsWith("Approve")) {
            handleApproveClicked();
        } else {
            handleMintWithXaiClicked();
        }
    };

    return (
        <div className="flex flex-col justify-center gap-8 mt-8">
            <div>
                {/* Render different buttons based on the currency */}
                {currency === 'AETH' ? (
                    <PrimaryButton
                        onClick={() => handleMintWithEthClicked()}
                        className={`w-full h-16 ${ready ? "bg-[#F30919] global-clip-path" : "bg-gray-400 cursor-default !text-[#726F6F]"} text-lg text-white p-2 uppercase font-bold`}
                        isDisabled={!ready}
                        btnText={getButtonText()}
                    />
                ) : (
                    <PrimaryButton
                        onClick={handleBuyWithXaiClicked}
                        className={`w-full h-16 ${ready ? "bg-[#F30919] global-clip-path" : "bg-gray-400 cursor-default !text-[#726F6F]"} text-lg text-white p-2 uppercase font-bold`}
                        isDisabled={!ready || !userHasTokenBalance}
                        btnText={getTokenButtonText()}
                    />
                )}

                {/* Error section for ETH transactions */}
                {mintWithEth.error && (
                    <div>
                        {mintWithEthError && mapWeb3Error(mintWithEthError) === "Insufficient funds" && (
                            <BaseCallout extraClasses={{ calloutWrapper: "md:h-[100px] h-[159px] mt-[12px]", calloutFront: "!justify-start" }} isWarning>
                                <div className="flex md:gap-[21px] gap-[10px]">
                                    <span className="block mt-2"><WarningIcon /></span>
                                    <div>
                                        <span className="block font-bold text-lg">Insufficient funds to complete transaction</span>
                                        <span className="block font-medium text-lg">Make sure your wallet has enough AETH and gas to complete the transaction.</span>
                                    </div>
                                </div>
                            </BaseCallout>
                        )}
                        {mapWeb3Error(mintWithEth.error) === "User rejected the request" && (
                            <BaseCallout extraClasses={{ calloutWrapper: "md:h-[85px] h-[109px] mt-[12px]", calloutFront: "!justify-start" }} isWarning>
                                <div className="flex md:gap-[21px] gap-[10px]">
                                    <span className="block mt-2"><WarningIcon /></span>
                                    <div>
                                        <span className="block font-bold text-lg">Transaction was cancelled</span>
                                        <span className="block font-medium text-lg">You have cancelled the transaction in your wallet.</span>
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
                                        <span className="block font-bold text-lg">Transaction was cancelled</span>
                                        <span className="block font-medium text-lg">You have cancelled the transaction in your wallet.</span>
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
                                        <span className="block font-bold text-lg">Transaction was cancelled</span>
                                        <span className="block font-medium text-lg">You have cancelled the transaction in your wallet.</span>
                                    </div>
                                </div>
                            </BaseCallout>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
