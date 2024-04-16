
const PurchaseComponent = () => {
  return (
    <div
      className={
        "flex flex-col sm:mr-0 sm:min-w-[270px] lg:min-w-[0px] lg:mb-0 py-1"
      }
    >
      <span className="text-lightBlackDarkWhite lg:text-lg sm:text-md font-medium mb-1">
        Want to stake more? Redeem XAI for more esXAI
      </span>
      <div className="flex sm:flex-col lg:flex-row items-baseline">
        <span className="text-graphiteGray lg:text-md sm:text-md mt-1 mr-2">
          Purchased XAI can also be redeemed for esXAI
        </span>
      </div>
    </div>
  );
};

export default PurchaseComponent;
