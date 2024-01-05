import {SentryNodeStatusCard} from "@/features/home/dashboard/SentryNodeStatusCard";
import {KeysCard} from "@/features/home/dashboard/KeysCard";
import {WalletsCard} from "@/features/home/dashboard/WalletsCard";
import {NetworkRewardsCard} from "@/features/home/dashboard/NetworkRewardsCard";

export function Dashboard() {
	return (
		<div className="w-full h-screen flex flex-row gap-4 p-4 bg-[#F5F5F5]">
			<div className="flex flex-col gap-4">
				<SentryNodeStatusCard/>

				<div className="flex gap-4">
					<KeysCard/>
					<WalletsCard/>
				</div>
			</div>

			<NetworkRewardsCard/>
		</div>
	)
}
