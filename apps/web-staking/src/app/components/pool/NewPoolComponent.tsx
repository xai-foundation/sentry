import PoolButtonComponent from "./PoolButtonComponent";
import PoolTextComponent from "./PoolTextComponent";
import { BorderWrapperComponent } from "../borderWrapper/BorderWrapperComponent";
import { ExternalLinkComponent } from "../links/LinkComponent";
import MainTitle from "../titles/MainTitle";

interface NewPoolProps {
  onOpen: () => void;
  address: string | undefined;
  isApproved: boolean;
}

const NewPoolComponent = ({ onOpen, address, isApproved }: NewPoolProps) => {
  return (
    <BorderWrapperComponent customStyle="!border-0 !shadow-none flex flex-col items-center py-[40px] lg:py-[150px] justify-center w-full sm:mb-[20px] lg:mb-[50px]">
      <div className="flex flex-col items-center">
        <MainTitle
          title="Create a new pool"
          classNames="text-xl font-bold !mb-0"
        />
        <PoolTextComponent address={address} isApproved={isApproved} />
        <PoolButtonComponent
          onOpen={onOpen}
          address={address}
          isApproved={isApproved}
        />
        {(!isApproved || !address) && (
          <>
            <span className="mb-2">
              Don’t own a key?{" "}
              <ExternalLinkComponent
                link="https://sentry.xai.games/"
                content="Purchase a key"
              />
            </span>
          </>
        )}
        {address && !isApproved && (
          <span className="whitespace-nowrap">
            Need to get KYC’d? <ExternalLinkComponent
              link="https://xai.games/sentrynodes/"
              content="Download operator"
            />
          </span>
        )}
      </div>
    </BorderWrapperComponent>
  );
};

export default NewPoolComponent;
