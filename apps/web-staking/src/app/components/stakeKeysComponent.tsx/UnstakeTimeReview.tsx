import moment from "moment";

function UnstakeTimeReview({ period }: { period: string }) {
  moment.relativeTimeThreshold("d", 1000000);
  return (
    <div className="flex items-center justify-between w-full mb-5 text-md">
      <p>
        Unstaking period
      </p>
      <p className="font-bold">
        {period}
      </p>
    </div>
  )
};

export default UnstakeTimeReview;