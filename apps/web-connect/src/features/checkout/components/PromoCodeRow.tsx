import { useEffect, useState } from 'react';
import { AiFillInfoCircle } from "react-icons/ai";
import { PrimaryButton } from "@sentry/ui";
import BaseCallout from "@sentry/ui/src/rebrand/callout/BaseCallout";
import { WarningIcon } from "@sentry/ui/src/rebrand/icons";
import { formatWeiToEther } from "@sentry/core";
import { useWebBuyKeysContext } from '../contexts/useWebBuyKeysContext';
import { useTranslation } from "react-i18next";

export function PromoCodeRow() {
    const {
        discount,
        setDiscount,
        promoCode,
        setPromoCode,
        handleApplyPromoCode,
        currency,
        decimalPlaces,
        calculateTotalPrice,
        displayPricesMayVary
    } = useWebBuyKeysContext();

    const [promo, setPromo] = useState(false);
    const { t: translate } = useTranslation("Checkout");

    useEffect(() => {
        const queryString = window.location.search;
        const queryParams = new URLSearchParams(queryString);
        const prefilledPromoCode = queryParams.get("promoCode");

        if (prefilledPromoCode) {
            setPromo(true);
        }
    }, []);

    return (
        <div>
            {discount.applied && (
                <>
                    <div className="flex flex-row items-center justify-between text-lg">
                        <div className="flex flex-row items-center gap-2">
                            <span className="text-white">{translate("promoCodeRow.discount.text")}</span>
                            <a
                                onClick={() => setDiscount({ applied: false, error: false })}
                                className="text-[#F30919] ml-1 cursor-pointer"
                            >
                                {translate("promoCodeRow.discount.removeButton")}
                            </a>
                        </div>
                        <div className="flex flex-row items-center gap-1">
                            <span className="text-white font-semibold">
                            {formatWeiToEther(calculateTotalPrice() * BigInt(5) / BigInt(100), decimalPlaces)} {currency}
                            </span>
                        </div>
                    </div>
                    <p className="text-[13px] text-elementalGrey">{promoCode}</p>
                </>
            )}
            {displayPricesMayVary && (
                <div className="w-full flex flex-col bg-bananaBoat/10 px-5 py-4 gap-2 mb-4">
                    <div className="flex items-center gap-2 font-semibold">
                        <AiFillInfoCircle className="w-[20px] h-[20px] text-bananaBoat" />
                        <p className="text-lg text-bananaBoat">{translate("promoCodeRow.pricesMayVary.title")}</p>
                    </div>
                    <p className="text-sm text-bananaBoat">
                        {translate("promoCodeRow.pricesMayVary.text")}
                    </p>
                </div>
            )}
            {!discount.applied && (
                <>
                    {promo ? (
                        <div className="w-full flex flex-col items-center py-2 ">
                            <div className="w-full h-auto flex sm:flex-col lg:flex-row sm:justify-center lg:justify-start items-center text-[15px] text-elementalGrey mt-2 sm:mb-2 lg:mb-0">
                                <div className="w-[300px] h-auto flex flex-row sm:justify-center lg:justify-start items-center text-[15px] text-elementalGrey mt-2 sm:mb-2 lg:mb-0">
                                    <span className="text-[#F30919] text-base">{translate("promoCodeRow.noDiscount.addPromoCode")}</span>
                                    <div
                                        className="cursor-pointer z-10"
                                        onClick={() => {
                                            setPromoCode("");
                                            setPromo(false);
                                        }}
                                    >
                                    </div>
                                </div>
                                <div className="flex w-full items-center sm:justify-center">
                                    <input
                                        type="text"
                                        value={promoCode}
                                        onChange={(e) => {
                                            setPromoCode(e.target.value);
                                            setDiscount({
                                                applied: false,
                                                error: false,
                                            });
                                        }}
                                        className={`text-white lg:w-full border-r-0 p-2 bg-darkLicorice border ${discount.error ? "border-[#AB0914]" : "border-[#525252]"}`}
                                    />
                                    <div className="lg:hidden sm:block">
                                        <PrimaryButton
                                            onClick={() => handleApplyPromoCode()}
                                            btnText={translate("promoCodeRow.noDiscount.applyPromoCodeButton")}
                                            className="text-white text-sm !py-2 max-h-[42.5px]"
                                        />
                                    </div>
                                </div>
                                <div className="lg:block sm:hidden">
                                    <PrimaryButton
                                        onClick={() => handleApplyPromoCode()}
                                        btnText={translate("promoCodeRow.noDiscount.applyPromoCodeButton")}
                                        className="text-white text-sm !py-2 max-h-[42.5px]"
                                    />
                                </div>
                            </div>
                            {discount.error && (
                                <BaseCallout extraClasses={{ calloutWrapper: "h-[50px] w-full mt-2" }} isWarning>
                                    <div className="flex gap-[10px]">
                                        <span className="block"><WarningIcon /></span>
                                        <span className="block">{translate("promoCodeRow.noDiscount.warning")}</span>
                                    </div>
                                </BaseCallout>
                            )}
                        </div>
                    ) : (
                        <p className="flex sm:justify-center lg:justify-start text-[15px] py-2">
                            <a onClick={() => setPromo(true)} className="text-[#F30919] text-base ml-1 cursor-pointer">
                                {translate("promoCodeRow.noDiscount.addPromoCode")}
                            </a>
                        </p>
                    )}
                </>
            )}
        </div>
    );
}
