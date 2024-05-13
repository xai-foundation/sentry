import MainTitle from "../titles/MainTitle";
import PoolWrapper from "./PoolWrapper";
import TableComponent from "./TableComponent";
import { ExternalLinkComponent } from "../links/LinkComponent";
import { learnMoreLink } from "./constants/constants";

const PoolOverviewComponent = () => {
  return (
    <PoolWrapper>
      <div className="flex justify-start items-baseline">
        <MainTitle
          title="Pool staking tiers"
          classNames="text-xl font-bold mr-4"
        />
        <ExternalLinkComponent externalTab link={learnMoreLink} content={"Learn more"} />
      </div>
      <TableComponent />
    </PoolWrapper>
  );
};

export default PoolOverviewComponent;
