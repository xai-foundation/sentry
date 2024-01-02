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
					title="Allowed Wallets assigned"
				/>
			) : (
				<>
					<IconLabel
						icon={IoMdCloseCircle}
						color="#F59E28"
						title="Allowed Wallets not selected"
						tooltip={true}
						header={"Wallets must be allowed to KYC"}
						body={"By allowing a wallet, you are accepting the responsibility of paying the gas fee associated with submitting an assertion and claiming rewards."}
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
