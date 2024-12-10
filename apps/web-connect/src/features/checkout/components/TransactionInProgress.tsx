import { BiLoaderAlt } from "react-icons/bi";
import { useTranslation } from "react-i18next";


export function TransactionInProgress() {
    const { t: translate } = useTranslation("Checkout");

    return (
        <div className="lg:w-[744px] h-[208px] sm:w-[90%] flex flex-col justify-center bg-darkLicorice m-4">
            <div className="w-full h-[390px] flex flex-col justify-center items-center gap-2">
                <BiLoaderAlt className="animate-spin" color={"#F30919"} size={32}/>
                <p className="text-elementalGrey text-[18px]">{translate("transactionPending")}</p>
            </div>
        </div>
    )
}