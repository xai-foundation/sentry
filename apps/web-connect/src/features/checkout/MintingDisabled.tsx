import { JSX } from "react";
import { useTranslation } from "react-i18next";

/**
 * MintingDisabled Component
 *
 * Replaces the key purchase flow on the landing route. Sales of new Sentry Node
 * Keys have been turned off, so the checkout is no longer routed to and this
 * notice is shown in its place.
 *
 * Operator functionality is unaffected: the /assign-wallet and /unassign-wallet
 * routes that the desktop client opens continue to work as before.
 *
 * @returns {JSX.Element} The rendered MintingDisabled component
 */
export function MintingDisabled(): JSX.Element {
    const { t: translate } = useTranslation("Checkout");

    return (
        <div className="h-full xl:min-h-screen flex-1 flex flex-col justify-center items-center">
            <div className="h-auto sm:w-[90%] lg:w-auto lg:max-w-[720px] flex flex-col justify-center bg-nulnOil shadow-main md:my-0 my-[24px] xl:p-12 sm:px-4 sm:py-10">
                <h1 className="font-rajdhani text-[32px] font-bold leading-[36px] text-white uppercase">
                    {translate("mintingDisabled.title")}
                </h1>

                <hr className="my-4 border-[#525252]" />

                <p className="font-rajdhani text-[18px] font-medium leading-[26px] text-elementalGrey">
                    {translate("mintingDisabled.description")}
                </p>

                <p className="font-rajdhani text-[18px] font-medium leading-[26px] text-elementalGrey mt-4">
                    {translate("mintingDisabled.existingKeys")}
                </p>
            </div>
        </div>
    );
}
