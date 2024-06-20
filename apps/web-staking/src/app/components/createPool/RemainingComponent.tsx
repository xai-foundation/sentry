const RemainingComponent = ({ sum }: { sum: number }) => {
  const percentageRemaining = 100;

  return (
    <>
      <div className="w-full bg-nulnOilBackground px-6 py-4 shadow-default">
        <span className="text-americanSilver text-lg font-normal">
          All three percentages must add up to 100%
        </span>
      </div>
      <div className="flex flex-col px-6 py-5 bg-dynamicBlack shadow-default">
        <span
          className={`${
            sum > 100 ? "text-red" : ""
          } text-lg text-elementalGrey mb-2`}
        >
          Percentage remaining
        </span>
        <span className={`${sum > 100 ? "text-red" : "text-white"} text-4xl font-medium`}>
          {sum === 100 || sum === 0
            ? `${(percentageRemaining - sum).toFixed(0)}%`
            : `${(percentageRemaining - sum).toFixed(2)}%`}
        </span>
      </div>
    </>
  );
};

export default RemainingComponent;
