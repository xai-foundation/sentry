enum PoolText {
  GET_STARTED = "Let's get started setting up your pool",
  UNSTAKED_KEYS = "You do not own any unstaked keys that have passed KYC.",
  NOT_OWN = "You do not own any unstaked keys that have passed KYC.",
  OWN_KEYS = "Own at least one unstaked key that has passed KYC?",
  CONNECT_WALLET = "Connect your wallet to create a pool.",
}

interface PoolTextProps {
  address: string | undefined;
  isApproved: boolean;
}

const PoolTextComponent = ({ address, isApproved }: PoolTextProps) => {
  return (
    <div className="mb-7 flex flex-col items-center">
      {address ? (
        <>
          {isApproved ? (
            <span className="text-lightBlackDarkWhite">
              {PoolText.GET_STARTED}
            </span>
          ) : (
            <>
              {" "}
              <span className="text-lightBlackDarkWhite">
                {PoolText.NOT_OWN}
              </span>
            </>
          )}
        </>
      ) : (
        <>
          {" "}
          <span className="text-lightBlackDarkWhite sm:text-center">
            {PoolText.OWN_KEYS}{" "}
            <span className="text-lightBlackDarkWhite sm:inline lg:hidden">
              {PoolText.CONNECT_WALLET}
            </span>
          </span>
          <span className="text-lightBlackDarkWhite sm:hidden lg:block">
            {PoolText.CONNECT_WALLET}
          </span>
        </>
      )}
    </div>
  );
};

export default PoolTextComponent;
