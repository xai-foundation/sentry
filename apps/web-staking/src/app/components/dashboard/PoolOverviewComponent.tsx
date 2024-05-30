import MainTitle from "../titles/MainTitle";
import PoolWrapper from "./PoolWrapper";
import TableComponent from "./TableComponent";
import { learnMoreLink, learnMoreTiers } from "./constants/constants";
import { ExternalLinkComponent } from "@/app/components/ui/links/ExternalLink";

const PoolOverviewComponent = () => {
  return (
    <PoolWrapper>
      <div
        className="flex items-end py-[17px] md:px-[23px] px-[17px] bg-nulnOil/75 border-b-1 border-chromaphobicBlack">
        <MainTitle
          title="Pool staking tiers"
          classNames="font-bold !normal-case md:!text-3xl !text-2xl mr-4 !mb-0"
        />
        <ExternalLinkComponent
          externalTab link={learnMoreLink}
          content={"Learn more"}
          customClass="no-underline !text-pelati !text-lg !font-semibold md:hidden inline"
        />
        <ExternalLinkComponent
          externalTab link={learnMoreTiers}
          content={"Learn more about tiers"}
          colorRed
          customClass="no-underline !text-lg !font-semibold md:inline hidden hover:text-white"
        />
      </div>
      <TableComponent />
    </PoolWrapper>
  );
};

export default PoolOverviewComponent;
