import {IconLabel} from "@/components/IconLabel";
import {SquareCard} from "@/components/SquareCard";
import {IoMdCloseCircle} from "react-icons/io";
import {AiFillCheckCircle} from "react-icons/ai";
import {useSetAtom} from "jotai";
import {PrimaryButton} from "@sentry/ui";
import {useStorage} from "@/features/storage";
import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";

export function AllowedWalletsCard() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {data} = useStorage();

	return (
		<SquareCard className="bg-secondaryBgColor global-cta-clip-path">
			{data && data.whitelistedWallets ? (
				<IconLabel
					icon={AiFillCheckCircle}
					color="#3DD68C"
					title="Allowed Wallets assigned"
					titleStyles="text-lg text-white"
				/>
			) : (
				<>
					<IconLabel
						icon={IoMdCloseCircle}
						color="#FFC53D"
						title="Allowed Wallets not selected"
						tooltip={true}
						header={"Wallets must be allowed to KYC"}
						body={"By allowing a wallet, you are accepting the responsibility of paying the gas fee associated with submitting an assertion and claiming rewards."}
						position={"end"}
						titleStyles="text-lg text-white"
						extraClasses={{
							tooltipContainer: "!left-[-263px] !w-[350px]",
							tooltipHeader: "",
							tooltipText: "",
						}}
					/>

					<p className="text-lg text-primaryText mt-1 px-6">
						Select the wallets you'd like to enable to run on your Sentry.
					</p>
                    <div className="pl-7 mt-2">
					<PrimaryButton
						onClick={() => setDrawerState(DrawerView.Whitelist)}
						btnText="ASSIGN ALLOWED WALLETS"
						colorStyle="primary"
						size="sm"
						className="w-[280px] text-lg uppercase bg-btnPrimaryBgColor text-white hover:text-btnPrimaryBgColor !py-1 !px-1 font-bold"
					/>
					</div>
				</>
			)}
		</SquareCard>
	);
}
