import StakeForPoolComponent from "@/app/components/staking/StakeKeyForPoolComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Summary",
	description: "Xai App Summary"
};

export default function StakePool() {
	return (
		<StakeForPoolComponent />
	);
};
