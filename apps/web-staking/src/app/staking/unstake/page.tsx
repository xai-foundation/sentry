import StakeV1Component from "@/app/components/stake/StakeV1Component";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Unstake esXAI",
  description: "Xai App Unstake esXAI"
};

const Unstake = () => {
  return (
    <StakeV1Component title="Unstake esXAI" unstake={true} />
  );
};

export default Unstake;
