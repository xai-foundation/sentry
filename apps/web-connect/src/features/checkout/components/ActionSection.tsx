import { PrimaryButton } from "@sentry/ui";
import BaseCallout from "@sentry/ui/src/rebrand/callout/BaseCallout";
import { WarningIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";
import { mapWeb3Error } from "@/utils/errors";
import { Chain } from "wagmi";

interface ActionSectionProps {
    currency: string;
    ready: boolean;
    hasBalance: boolean;
    chain: Chain | undefined;
    onClick: () => void;
    onClickToken: () => void;
    getApproveButtonText: () => string;
    error: Error | null;
    errorToken: Error | null;
    errorApprove: Error | null;
    txInProgress?: boolean;
}

export function ActionSection({
    currency,
    ready,
    chain,
    hasBalance,
    onClick,
    onClickToken, 
    getApproveButtonText,
    error,
    errorToken,
    errorApprove,
    txInProgress
}: ActionSectionProps) {

    function getButtonText():string {
        if(txInProgress) return "WAITING FOR CONFIRMATION";
        if(chain?.id !== 42161) return "Please Switch to Arbitrum One";
        return "BUY NOW";
    }

    function getTokenButtonText():string {
        if(txInProgress) return "WAITING FOR CONFIRMATION";
        if(chain?.id !== 42161) return "Please Switch to Arbitrum One";
        return getApproveButtonText();
    }


    return (
        <div className="flex flex-col justify-center gap-8 mt-8">
            <div>
                {currency === 'AETH' ? (
                    <PrimaryButton
                        onClick={onClick}
                        className={`w-full h-16 ${ready && chain?.id === 42161 ? "bg-[#F30919] global-clip-path" : "bg-gray-400 cursor-default !text-[#726F6F]"} text-lg text-white p-2 uppercase font-bold`}
                        isDisabled={!ready || chain?.id !== 42161}
                        btnText={getButtonText()}
                    />
                ) : (
                    <PrimaryButton
                        onClick={onClickToken}
                        className={`w-full h-16 ${ready && chain?.id === 42161 ? "bg-[#F30919] global-clip-path" : "bg-gray-400 cursor-default !text-[#726F6F]"} text-lg text-white p-2 uppercase font-bold`}
                        isDisabled={!ready || chain?.id !== 42161 || !hasBalance}
                        btnText={getTokenButtonText()}
                    />
                )}

                {/*		Show Section if error with key sale in Eth		*/}
                {(error) && (
                    <div>
                        {mapWeb3Error(error) === "Insufficient funds" && (
                            <div className="flex md:gap-[21px] gap-[10px]">
                                <BaseCallout extraClasses={{ calloutWrapper: "md:h-[100px] h-[159px] mt-[12px]", calloutFront: "!justify-start" }} isWarning>
                                    <div className="flex md:gap-[21px] gap-[10px]">
                                        <span className="block mt-2"><WarningIcon /></span>
                                        <div>
                                            <span className="block font-bold text-lg">Insufficient funds to complete transaction</span>
                                            <span className="block font-medium text-lg">Make sure your wallet has enough AETH and gas to complete the transaction.</span>
                                        </div>
                                    </div>
                                </BaseCallout>
                            </div>
                        )}
                        {mapWeb3Error(error) === "User rejected the request" && (
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

                {/*		Show Section if error with key sale in Xai/esXai		*/}
                {errorToken && (
                    <div>
                        {mapWeb3Error(errorToken) === "User rejected the request" && (
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

                {/*		Show Section if error with allowance approval		*/}
                {errorApprove && (
                    <div>
                        {mapWeb3Error(errorApprove) === "User rejected the request" && (
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
