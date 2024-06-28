import { useEffect } from "react";
import { TransactionInProgress } from "./components/TransactionInProgress";
import { ChooseQuantityRow } from "./components/ChooseQuantityRow";
import { LogoColumn } from "./components/LogoColumn";
import { ChooseCurrencyRow } from "./components/ChooseCurrencyRow";
import { PricePerKeyRow } from "./components/PricePerKeyRow";
import { PromoCodeRow } from "./components/PromoCodeRow";
import { TotalCostRow } from "./components/TotalCostRow";
import { AgreementCheckboxes } from "./components/AgreementCheckboxes";
import { ActionSection } from "./components/ActionSection";
import { BiLoaderAlt } from "react-icons/bi";
import PurchaseSuccessful from "./components/PurchaseSuccessful";
import { useWebBuyKeysContext } from './contexts/useWebBuyKeysContext';

const LoadingState = () => (
    <div className="w-full h-[365px] flex flex-col justify-center items-center gap-2">
        <BiLoaderAlt className="animate-spin" color={"#FF0030"} size={32} />
        <p className="text-base text-white font-semibold">Updating total...</p>
    </div>
);

export function Checkout() {
    const queryString = window.location.search;
    const queryParams = new URLSearchParams(queryString);
    const prefilledPromoCode = queryParams.get("promoCode");
    const {
        isTotalLoading,
        isPriceLoading,
        isExchangeRateLoading,
        setPromoCode,
        mintWithEth,
        mintWithXai,
        approve,
    } = useWebBuyKeysContext();

    useEffect(() => {
        if (prefilledPromoCode) {
            setPromoCode(prefilledPromoCode);
        }
    }, [prefilledPromoCode, setPromoCode]);

    function returnToClient() {
        const hash = mintWithEth.data?.hash ?? mintWithXai.data?.hash;
        window.location = `xai-sentry://purchase-successful?txHash=${hash}` as unknown as Location;
    }

    return (
        <div>
            <div className="h-full xl:min-h-screen flex-1 flex flex-col justify-center items-center">
                {mintWithEth.isLoading || mintWithXai.isLoading || approve.isLoading ? (
                    <TransactionInProgress />
                ) : mintWithEth.isSuccess || mintWithXai.isSuccess ? (
                    <PurchaseSuccessful returnToClient={returnToClient} />
                ) : (
                    <div className="h-auto sm:w-[90%] lg:w-auto flex sm:flex-col lg:flex-row justify-center bg-darkLicorice shadow-main md:my-0 my-[24px]">
                        <LogoColumn />
                        <div className="h-auto xl:p-12 sm:px-2 sm:py-10">
                            <ChooseQuantityRow />
                            {isTotalLoading || isExchangeRateLoading || isPriceLoading ? (
                                <LoadingState />
                            ) : (
                                <>
                                    <ChooseCurrencyRow />
                                    <hr className="my-2 border-[#525252]" />
                                    <PricePerKeyRow />
                                    <hr className="my-2 border-[#525252]" />
                                    <PromoCodeRow />
                                    <hr className="my-2 border-[#525252]" />
                                    <TotalCostRow />
                                    <hr className="my-2 border-[#525252]" />
                                    <AgreementCheckboxes />
                                    <ActionSection />
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}