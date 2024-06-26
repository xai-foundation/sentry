import {IconLabel} from "@/components/IconLabel";
import {SquareCard} from "@/components/SquareCard";
import {IoMdCloseCircle} from "react-icons/io";
import {AiFillCheckCircle} from "react-icons/ai";
import {useSetAtom} from "jotai";
import {PrimaryButton, SideBarTooltip} from "@sentry/ui";
import {useStorage} from "@/features/storage";
import {drawerStateAtom, DrawerView} from "@/features/drawer/DrawerManager";
import { HelpIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";

export function AllowedWalletsCard() {
	const setDrawerState = useSetAtom(drawerStateAtom);
	const {data} = useStorage();

	return (
		<div className="relative">
		<div className="bg-chromaphobicBlack global-cta-clip-path p-[1px]">
		<SquareCard className="bg-dynamicBlack global-cta-clip-path">
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
						header={"Wallets must be allowed to KYC"}
						body={"By allowing a wallet, you are accepting the responsibility of paying the gas fee associated with submitting an assertion and claiming rewards."}
						position={"end"}
						titleStyles="text-lg text-white"
					/>

					<p className="text-lg text-americanSilver mt-1 px-6">
						Select the wallets you'd like to enable to run on your Sentry.
					</p>
                    <div className="pl-7 mt-2">
					<PrimaryButton
						onClick={() => setDrawerState(DrawerView.Whitelist)}
						btnText="ASSIGN ALLOWED WALLETS"
						colorStyle="primary"
						size="sm"
						className="w-[280px] text-lg uppercase !py-1 !px-1 font-bold"
					/>
					</div>
				</>
			)}
		</SquareCard>
		</div>
			{!data?.whitelistedWallets && <div className="absolute top-[18px] left-[265px]">
				<SideBarTooltip
					header={"Wallets must be allowed to KYC"}
					body={"By allowing a wallet, you are accepting the responsibility of paying the gas fee associated with submitting an assertion and claiming rewards."}
					position={"end"}
					sideOffset={32}
					width={630}
					height={50}
					avoidCollisions={false}
				>
					<HelpIcon width={14} height={14} />
				</SideBarTooltip>
			</div>}
		</div>
	);
}
