import PoolTextComponent from "./PoolTextComponent";
import { ExternalLinkComponent } from "@/app/components/ui/links/ExternalLink";
import { ConnectButton } from "@/app/components/ui/buttons";
import UserVerificationKYC from "./UserVerificationKYC";

interface PoolPanelProps {
  onOpen: () => void;
  address: string | undefined;
  isApproved: boolean;
}

const PoolPanelComponent = ({ onOpen, address, isApproved }: PoolPanelProps) => {
  return (
    <div
      className="h-[438px] w-full flex flex-col items-center justify-center gap-[15px] shadow-default bg-nulnOil/75">
      <h3
        className="font-bold !mb-0 md:text-3xl text-2xl text-white"
      > Create a new pool
      </h3>
        <PoolTextComponent address={address} isApproved={isApproved} />
      {!address &&
        <ConnectButton onOpen={onOpen} address={address} size="md" extraClasses="!global-double-clip-path-15px" />
      }
      {address && !isApproved && (
        <UserVerificationKYC/>
      )}
        {(!isApproved || !address) && (
          <>
            <span className="mb-2 text-americanSilver text-lg font-medium">
              Don’t own a key?{" "}
              <ExternalLinkComponent
                link="https://sentry.xai.games/"
                content="Purchase a key"
                customClass="no-underline !text-hornetSting !text-lg !font-bold hover:!text-white"
              />
            </span>
          </>
        )}

    </div>
  );
};

export default PoolPanelComponent;
