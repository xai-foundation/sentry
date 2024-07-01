import EditRewardsComponent from "@/app/components/editRewards/EditRewardsComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Rewards",
  description: "Xai App Edit Rewards"
};

const EditRewards = () => {
  return (
    <div className="flex flex-col items-center">
      <EditRewardsComponent />
    </div>
  );
};

export default EditRewards;
