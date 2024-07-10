import {SentryNodeStatusCard} from "@/features/home/dashboard/SentryNodeStatusCard";
import {KeysCard} from "@/features/home/dashboard/KeysCard";
import {WalletsCard} from "@/features/home/dashboard/WalletsCard";
import {NetworkRewardsCard} from "@/features/home/dashboard/NetworkRewardsCard";

export function Dashboard() {
	return (
		<div className="w-full h-screen flex flex-row gap-4 p-4 !pr-0 bg-transparent">
			<div className="flex flex-col gap-6">
				<SentryNodeStatusCard/>

				<div className="flex gap-3">
					<KeysCard/>
					<WalletsCard/>
				</div>
			</div>

			<NetworkRewardsCard/>
		</div>
	)
}
