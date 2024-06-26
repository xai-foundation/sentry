import { useEffect, useState } from "react";
import { useGetPriceForQuantity } from "@/features/checkout/hooks/useGetPriceForQuantity";
import { useProvider } from "@/features/checkout/hooks/useProvider";
import { TransactionInProgress } from "./components/TransactionInProgress";
import { PurchaseSuccessful } from "./components/PurchaseSuccessful";
import { ChooseQuantityRow } from "./components/ChooseQuantityRow";
import { LogoColumn } from "./components/LogoColumn";
import { ChooseCurrencyRow } from "./components/ChooseCurrencyRow";
import { useWebBuyKeysOrderTotal } from "./hooks/useWebBuyKeysOrderTotal";
import { PricePerKeyRow } from "./components/PricePerKeyRow";
import { PromoCodeRow } from "./components/PromoCodeRow";
import { TotalCostRow } from "./components/TotalCostRow";
import { AgreementCheckboxes } from "./components/AgreementCheckboxes";
import { BiLoaderAlt } from "react-icons/bi";
import { ActionSection } from "./components/ActionSection";

export function Checkout() {
    // Retrieve query parameters from the URL
    const queryString = window.location.search;
    const queryParams = new URLSearchParams(queryString);
    const prefilledAmount = queryParams.get("quantity");
    const prefilledPromoCode = queryParams.get("promoCode");

    // Declare state for quantity and promoCode
    const [quantity, setQuantity] = useState<number>(1);
    const [promoCode, setPromoCode] = useState<string>("");
    const [discount, setDiscount] = useState<{ applied: boolean, error: boolean }>({ applied: false, error: false });

    // Retrieve price data for the specified quantity
    const { data: getPriceData, isLoading: isPriceLoading } = useGetPriceForQuantity(quantity);

    // Retrieve provider data
    const { data: providerData } = useProvider();

    // Initialize the hook with the current state of getPriceData, quantity, promoCode, and discount
    const hookData = useWebBuyKeysOrderTotal({
        getPriceData,
        discount,
        setDiscount,
        promoCode,
        setPromoCode,
        quantity
    });

    // Set prefilled quantity and promoCode if available
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

    // Function to return to client after successful purchase
    function returnToClient() {
        const hash = hookData.dataMintWithEth?.hash || hookData.dataMintWithXai?.hash;
        window.location.href = `xai-sentry://purchase-successful?txHash=${hash}`;
    }

    // Function to get balance to display based on selected currency
    function getBalanceToDisplay() {
        if (hookData.currency === "AETH") {
            return hookData.ethBalance;
        } else {
            return hookData.tokenBalance;
        }
    }

    return (
        <div>
            <div className="h-full xl:min-h-screen flex-1 flex flex-col justify-center items-center">

                {/* Displayed when the user is waiting for a tx to be confirmed */}
                {(hookData.isLoadingMintWithEth || hookData.isLoadingMintWithXai) && (
                    <TransactionInProgress />
                )}

                {/* Displayed after successful purchase */}
                {(hookData.isSuccessMintWithEth || hookData.isSuccessMintWithXai) && (
                    <PurchaseSuccessful data={hookData.dataMintWithEth || hookData.dataMintWithXai} returnToClient={returnToClient} providerData={providerData} />
                )}

                {/* Checkout Page */}
                {!hookData.isLoadingMintWithEth && !hookData.isSuccessMintWithEth && !hookData.isLoadingMintWithXai && (
                    <div className="h-auto sm:w-[90%] lg:w-auto flex sm:flex-col lg:flex-row justify-center bg-darkLicorice shadow-main md:my-0 my-[24px]">
                        <LogoColumn />

                        <div className="h-auto xl:p-12 sm:px-2 sm:py-10">
                            <ChooseQuantityRow quantity={quantity} setQuantity={setQuantity} />

                            {/* Show Loader if Loading */}
                            {isPriceLoading || hookData.isTotalLoading || hookData.isExchangeRateLoading || !getPriceData ? (
                                <div className="w-full h-[365px] flex flex-col justify-center items-center gap-2">
                                    <BiLoaderAlt className="animate-spin" color={"#FF0030"} size={32} />
                                    <p className="text-base text-white font-semibold">Updating total...</p>
                                </div>
                            ) : (
                                <>
                                    <ChooseCurrencyRow setCurrency={hookData.setCurrency} />
                                    <hr className="my-2 border-[#525252]" />
                                    <PricePerKeyRow
                                        decimalPlaces={hookData.decimalPlaces}
                                        getPriceData={getPriceData}
                                        currency={hookData.currency}
                                        calculateTotalPrice={hookData.calculateTotalPrice}
                                        formatItemPricePer={hookData.formatItemPricePer}
                                    />

                                    <hr className="my-2 border-[#525252]" />

                                    <PromoCodeRow
                                        discount={hookData.discount}
                                        decimalPlaces={hookData.decimalPlaces}
                                        setDiscount={hookData.setDiscount}
                                        promoCode={hookData.promoCode}
                                        setPromoCode={hookData.setPromoCode}
                                        handleSubmit={hookData.handleSubmit}
                                        promo={hookData.promo}
                                        setPromo={hookData.setPromo}
                                        displayPricesMayVary={hookData.displayPricesMayVary}
                                        calculateTotalPrice={hookData.calculateTotalPrice}
                                        getPriceData={getPriceData}
                                        currency={hookData.currency}
                                    />

                                    <hr className="my-2 border-[#525252]" />

                                    <TotalCostRow
                                        calculateTotalPrice={hookData.calculateTotalPrice}
                                        currency={hookData.currency}
                                        decimalPlaces={hookData.decimalPlaces}
                                        balance={getBalanceToDisplay()}
                                    />

                                    <hr className="my-2 border-[#525252]" />

                                    <AgreementCheckboxes
                                        checkboxOne={hookData.checkboxOne}
                                        setCheckboxOne={hookData.setCheckboxOne}
                                        checkboxTwo={hookData.checkboxTwo}
                                        setCheckboxTwo={hookData.setCheckboxTwo}
                                        checkboxThree={hookData.checkboxThree}
                                        setCheckboxThree={hookData.setCheckboxThree}
                                    />

                                    <ActionSection
                                        currency={hookData.currency}
                                        ready={hookData.ready}
                                        chain={hookData.chain}
                                        hasBalance={hookData.userHasTokenBalance}
                                        onClick={hookData.writeMintWithEth}
                                        onClickToken={hookData.writeMintWithXai}
                                        getApproveButtonText={hookData.getApproveButtonText}
                                        txInProgress={hookData.isLoadingApprove || hookData.isLoadingMintWithXai || hookData.isLoadingMintWithEth}
                                        error={hookData.errorMintWithEth}
                                        errorToken={hookData.errorMintWithXai}
                                        errorApprove={hookData.errorApprove}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
