import { ErrorCircle } from "../icons/IconsComponent";
import { ExternalLinkComponent } from "@/app/components/links/LinkComponent";

function RedeemWarning() {
  return (
    <div className="px-3 w-full max-w-[540px]">
      <div
        className={`w-full pl-[40px] flex relative flex-col mb-4 bg-[#FFF9ED] text-[#C36522] text-left py-[15px] rounded-xl text-[14px]`}>
        <div className="absolute top-4 left-3">
          <ErrorCircle width={20} height={20} />
        </div>
        <span className="block text-base font-bold">
        Please note that esXAI has waiting periods to redeem for XAI.
      </span>
        <span className="block ">More information can be found
        <ExternalLinkComponent
          link={"https://xai-foundation.gitbook.io/xai-network/xai-blockchain/xai-tokenomics/the-redemption-process"}
          content={" here."}
          externalTab
        />
			</span>
      </div>
    </div>
  );
}

export default RedeemWarning;