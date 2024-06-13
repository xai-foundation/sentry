import {useSetAtom} from "jotai";
import {drawerStateAtom, DrawerView} from "../drawer/DrawerManager";
import { WarningIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";
import { PrimaryButton } from "@sentry/ui";

export function NoKeys() {
	const setDrawerState = useSetAtom(drawerStateAtom);

	return (
		<div className="w-full h-auto flex flex-col justify-center items-center">
			<div className="absolute top-0 bottom-0 flex flex-col justify-center items-center gap-4">
				<WarningIcon width={64} height={55}/>
				<p className="text-3xl font-bold text-white uppercase">
					You do not own any keys
				</p>
				<p className="text-lg text-americanSilver">
					Purchase a key to be able to begin accruing esXAI
				</p>
                <div className="flex justify-center">
				<PrimaryButton
					onClick={() => setDrawerState(DrawerView.BuyKeys)}
					className="w-[202px] text-[20px] font-bold uppercase !py-1 !global-cta-clip-path text-melanzaneBlack"
					btnText="Purchase keys"
				/>
                </div>
				<p className="text-lg text-americanSilver mt-2">
					Already own a key?

					<a
						onClick={() => setDrawerState(DrawerView.ViewKeys)}
						className="text-hornetSting font-bold hover:text-white ml-1 cursor-pointer duration-200 ease-in"
					>
						Add wallet
					</a>
				</p>
			</div>
		</div>
	)
}
