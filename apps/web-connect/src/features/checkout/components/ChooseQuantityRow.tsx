import { WarningIcon } from "@sentry/ui/src/rebrand/icons";
import { Tooltip, XaiNumberInput, InfoPointRed, RedSentryIcon } from "@sentry/ui";
import { useWebBuyKeysContext } from '../contexts/useWebBuyKeysContext';
import BaseCallout from "@sentry/ui/src/rebrand/callout/BaseCallout";
import { useTranslation } from "react-i18next";

/**
 * ChooseQuantityRow Component
 * 
 * This component renders the section for choosing the quantity of XAI Sentry Keys to purchase.
 * It displays information about the keys and provides an input for selecting the quantity.
 * 
 * @returns {JSX.Element} The rendered ChooseQuantityRow component
 */
export function ChooseQuantityRow(): JSX.Element {

    const MAX_PER_PURCHASE = 99999;

    // Destructure necessary values from the WebBuyKeysContext
    const { quantity, setQuantity, maxSupply } = useWebBuyKeysContext();
    const { t: translate } = useTranslation("Checkout");

    function calculateMaxPurchase():number {
        if(maxSupply >= MAX_PER_PURCHASE) {
            return MAX_PER_PURCHASE;
        }else{
            return maxSupply;
        }
    }

    return (
        <div>
        <div className="flex sm:flex-col lg:flex-row justify-between lg:items-start sm:items-center">
            {/* Information section */}
            <div className="flex flex-col sm:items-center lg:items-start gap-2">
                {/* Title and icon section */}
                <div className="flex flex-row sm:w-full sm:justify-center lg:justify-start items-center gap-1">
                    <RedSentryIcon width={32} height={32} />
                    <p className="sm:text-2xl lg:text-3xl text-white font-bold">
                        {translate("chooseQuantity.title")}
                    </p>
                    {/* Tooltip for additional information */}
                    <span className="h-full flex items-center ml-2">
                        <Tooltip
                            header={translate("chooseQuantity.toolTip.title")}
                            body={translate("chooseQuantity.toolTip.text")}
                            width={452}
                        >
                            <InfoPointRed />
                        </Tooltip>
                    </span>
                </div>
                {/* Mobile-only div */}
                <div className="block lg:hidden w-full text-center text-white mb-4">
                    <div className="md:px-[25px] px-[12px]">
                        <div className="bg-dynamicBlack relative z-[20] w-full xl:max-w-[358px] px-[12px] py-[12px] global-cta-clip-path h-auto flex flex-col justify-center">
                            <div className="px-1">
                                <p className="font-rajdhani text-[24px] font-bold leading-[28px] text-center decoration-skip-ink-none">
                                    {translate("logoColumn.networkRewardsAmount")}
                                    <span className="font-rajdhani text-[24px] font-medium leading-[28px] text-center decoration-skip-ink-none text-[#F7F6F6]">
                                        {translate("logoColumn.networkRewardsText")}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Description of Sentry Key functionality */}
                <p className="sm:w-full lg:w-[330px] sm:text-center sm:px-8 lg:px-0 lg:text-left text-[18px] text-elementalGrey font-medium">
                    {translate("chooseQuantity.description")}
                </p>     
            </div>
            {/* Quantity input section */}
            <div className="flex w-full justify-end flex-row items-start gap-4 sm:mt-4 lg:mt-10">
                <div className="flex sm:w-full lg:w-[200px] sm:px-2 lg:px-0">
                    {/* Custom number input component for selecting quantity */}
                    <XaiNumberInput
                        quantity={quantity}
                        setQuantity={setQuantity}
                        maxSupply={calculateMaxPurchase()}
                    />
                </div>
            </div>
        </div>        
        { quantity > MAX_PER_PURCHASE && <BaseCallout extraClasses={{ calloutWrapper: "md:h-[100px] h-[159px] mt-[12px]", calloutFront: "!justify-start" }} isWarning>
                    <div className="flex md:gap-[21px] gap-[10px]">
                        <span className="block mt-2"><WarningIcon /></span>
                        <div>
                            <span className="block font-bold text-lg">{translate("chooseQuantity.maximumPerTransaction", { count: MAX_PER_PURCHASE })}</span>
                            <span className="block font-medium text-lg">{translate("chooseQuantity.maximumNodeLicenses", { max: MAX_PER_PURCHASE })}</span>
                        </div>
                    </div>
                </BaseCallout>}
        </div>
    );
}