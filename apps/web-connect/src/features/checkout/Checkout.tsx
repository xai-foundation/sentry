import { useEffect, useState } from "react";
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
const { VITE_APP_ENV } = import.meta.env
import { useTranslation } from "react-i18next";

export const stakingPageURL = `https://${VITE_APP_ENV === "development" ? "develop." : ""}app.xai.games/staking?modal=true&page=1&showKeys=true&hideFull=true&sort=tierIndex&sortOrder=-1`;

const LoadingState = () => {
    const { t: translate } = useTranslation("Checkout");
    return <div className="w-full h-[365px] flex flex-col justify-center items-center gap-2">
        <BiLoaderAlt className="animate-spin" color={"#FF0030"} size={32}/>
        <p className="text-base text-white font-semibold">{translate("updatingTotal")}</p>
    </div>
};

export function Checkout() {
    const [stakingTabOpened, setStakingTabOpened] = useState(false);
    const queryString = window.location.search;
    const queryParams = new URLSearchParams(queryString);
    const prefilledPromoCode = queryParams.get("promoCode");
    const {
        isTotalLoading,
        isPriceLoading,
        isExchangeRateLoading,
        promoCode,
        setPromoCode,
        handleApplyPromoCode,
        mintWithEth,
        mintWithXai,
        approve,
        mintWithCrossmint
    } = useWebBuyKeysContext();

    useEffect(() => {
        if (prefilledPromoCode) {
            setPromoCode(prefilledPromoCode);
            handleApplyPromoCode();
        }
    }, [prefilledPromoCode, promoCode, setPromoCode]);

    function returnToClient() {
        window.location.reload();
    }

    useEffect(() => {
        if (!stakingTabOpened && (mintWithEth.isSuccess || mintWithXai.isSuccess || mintWithCrossmint.txHash != "")) {
            setStakingTabOpened(true);
            window.open(stakingPageURL, '_blank');
        }
    }, [mintWithEth.isSuccess, mintWithXai.isSuccess, mintWithCrossmint.txHash]);

    return (
        <div>
            <div className="h-full xl:min-h-screen flex-1 flex flex-col justify-center items-center">
                {mintWithEth.isPending || mintWithXai.isPending || approve.isPending || mintWithCrossmint.isPending ? (
                    <TransactionInProgress />
                ) : mintWithEth.isSuccess || mintWithXai.isSuccess || mintWithCrossmint.txHash != "" ? (
                    <PurchaseSuccessful returnToClient={returnToClient} />
                ) : (
                    <div className="h-auto sm:w-[90%] lg:w-auto flex sm:flex-col lg:flex-row justify-center bg-nulnOil shadow-main md:my-0 my-[24px]">
                        <div className="hidden lg:block">
                            <LogoColumn />
                        </div>
                        <div className="h-auto xl:p-12 sm:px-2 sm:py-10">
                            <ChooseQuantityRow />
                            <div className="min-h-[545px]">
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
                    </div>
                )}
            </div>
        </div>
    );
}
