import moment from "moment";

function UnstakeTimeReview({ period }: { period: string }) {
  moment.relativeTimeThreshold("d", 1000000);
  return (
    <div
      className="flex items-center justify-between w-full text-md md:px-[25px] px-[17px] text-lg font-medium text-americanSilver border-t-1 border-chromaphobicBlack py-[30px]">
      <p>
        Unstaking period
      </p>
      <p className="font-semibold text-lg text-white">
        {period}
      </p>
    </div>
  )
};

export default UnstakeTimeReview;