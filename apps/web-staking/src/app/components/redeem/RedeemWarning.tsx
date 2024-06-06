import { WarningIcon } from "../icons/IconsComponent";
import { BaseCallout } from "@/app/components/ui";
import { ExternalLinkComponent } from "@/app/components/ui/links/ExternalLink";

function RedeemWarning() {
  return (
    <BaseCallout extraClasses={{ calloutWrapper: "w-full max-w-[456px] h-[113px]" }} isWarning>
      <div className="flex md:gap-[20px] gap-[10px]">
								<span
                  className="block mt-2">{WarningIcon({})}
								</span>
        <div className="">
									<span
                    className="block text-lg font-bold">Please note that esXAI has waiting periods to redeem for XAI.
									</span>
          <span className="block">More information can be found {" "}
            <ExternalLinkComponent
              link={"https://xai-foundation.gitbook.io/xai-network/xai-blockchain/xai-tokenomics/the-redemption-process"}
              content={"here."}
              customClass="!text-bananaBoat text-lg"
            />
          </span>
          {/* todo add link to here.	*/}
        </div>
      </div>
    </BaseCallout>
  );
}

export default RedeemWarning;