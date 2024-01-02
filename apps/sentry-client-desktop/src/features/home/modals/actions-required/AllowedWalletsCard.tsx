import {IconLabel} from "@/components/IconLabel";
import {SquareCard} from "@/components/SquareCard";
import {IoMdCloseCircle} from "react-icons/io";
import {AiFillCheckCircle} from "react-icons/ai";
import {useSetAtom} from "jotai";
import {XaiButton} from "@sentry/ui";
import {useStorage} from "@/features/storage";
import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";

export function AllowedWalletsCard() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {data} = useStorage();

	return (
		<SquareCard className="bg-[#F5F5F5]">
			{data && data.whitelistedWallets ? (
				<IconLabel
					icon={AiFillCheckCircle}
					color="#16A34A"
					title="Allowed wallets assigned"
				/>
			) : (
				<>
					<IconLabel
						icon={IoMdCloseCircle}
						color="#F59E28"
						title="Assign allowed wallets"
						tooltip={true}
						header={"lorem ipsum lorem ipsum"}
						body={"lorem ipsum"}
						body2={"The wallet containing the purchased keys will perform a gas transaction to assign the keys to the Sentry."}
						position={"end"}
					/>

					<p className="text-[15px] text-[#525252] mt-3">
						Select the wallets you'd like to enable to run on your Sentry.
					</p>

					<XaiButton
						onClick={() => setDrawerState(DrawerView.Whitelist)}
						width={"100%"}
						fontSize={"15px"}
					>
						Assign allowed wallets
					</XaiButton>
				</>
			)}
		</SquareCard>
	);
}
