import { Metadata } from "next";
import RedeemComponent from "../components/redeem/RedeemComponent";

export const metadata: Metadata = {
  title: "Redeem",
  description: "Xai App Redeem"
};

export default function Redeem() {

  return (
    <RedeemComponent />
  );
}
