import { PropsWithChildren } from "react";
import BaseCallout from "@sentry/ui/src/rebrand/callout/BaseCallout";
import {PrimaryButton} from "@sentry/ui";

interface ClaimBannerProps extends PropsWithChildren {
    heading: string,
    description: string,
    showModal: () => void
}

export function ClaimBanner({ heading, description, showModal }: ClaimBannerProps) {

    return <BaseCallout extraClasses={{
        calloutWrapper: "w-full bg-potBlack mb-4",
        calloutFront: "!items-start flex-col bg-potBlack"
    }}>
        <div className="flex justify-between items-center w-full">
            <div>
                <p className="font-semibold text-cascadingWhite">
                    {heading}
                </p>

                <p className="text-elementalGrey">
                    {description}

                </p>
            </div>
            <PrimaryButton onClick={showModal} btnText={"CLAIM"} wrapperClassName={"w-max !keys-cta-button-clip-path"} className={"!py-[6px] h-max !keys-cta-button-clip-path"} colorStyle={"outline"} />
        </div>
    </BaseCallout>
}