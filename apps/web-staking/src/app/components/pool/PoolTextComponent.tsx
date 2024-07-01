enum PoolText {
  GET_STARTED = "Let's get started setting up your pool",
  UNSTAKED_KEYS = "You do not own any unstaked keys that have passed KYC.",
  NOT_OWN = "You do not own any unstaked keys that have passed KYC. Download the operator to pass KYC before creating a pool.",
  OWN_KEYS = "Own at least one unstaked key that has passed KYC?",
  CONNECT_WALLET = "Connect your wallet to create a pool.",
}

interface PoolTextProps {
  address: string | undefined;
  isApproved: boolean;
}

const PoolTextComponent = ({ address, isApproved }: PoolTextProps) => {
  return (
    <div className="flex flex-col items-center text-americanSilver text-lg">
      {address ? (
        <>
          {isApproved ? (
            <span>
              {PoolText.GET_STARTED}
            </span>
          ) : (
            <>
              {" "}
              <span className="w-full max-w-[456px] text-center">
                {PoolText.NOT_OWN}
              </span>
            </>
          )}
        </>
      ) : (
        <>
          {" "}
          <span className="sm:text-center">
            {PoolText.OWN_KEYS}{" "}
            <span className="sm:inline lg:hidden">
              {PoolText.CONNECT_WALLET}
            </span>
          </span>
          <span className="sm:hidden lg:block">
            {PoolText.CONNECT_WALLET}
          </span>
        </>
      )}
    </div>
  );
};

export default PoolTextComponent;
