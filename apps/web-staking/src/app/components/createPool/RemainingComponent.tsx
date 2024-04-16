const RemainingComponent = ({ sum }: { sum: number }) => {
  const percentageRemaining = 100;

  return (
    <>
      <span className="text-graphiteGray text-base font-normal">
        All three percentages must add up to 100%
      </span>
      <div className="flex flex-col px-6 py-5 bg-crystalWhite mt-3 rounded-xl">
        <span
          className={`${
            sum > 100 ? "text-red" : ""
          } text-base text-graphiteGray mb-2`}
        >
          Percentage remaining
        </span>
        <span className={`${sum > 100 ? "text-red" : ""} text-2xl font-medium`}>
          {sum === 100 || sum === 0
            ? `${(percentageRemaining - sum).toFixed(0)}%`
            : `${(percentageRemaining - sum).toFixed(2)}%`}
        </span>
      </div>
    </>
  );
};

export default RemainingComponent;
