import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";
import {WarningIcon} from "@sentry/ui/dist/src/rebrand/icons/IconsComponents";
import {PrimaryButton} from "@sentry/ui";

export function AssignKeysSentryNotRunning() {
	const {startRuntime} = useOperatorRuntime();

	return (
		<div className="flex flex-col justify-center items-center gap-4 w-full h-full">
			<WarningIcon width={56} height={56} />
			<p className="text-2xl font-bold text-white">
				Sentry is not running

			</p>
			<p className="text-lg text-americanSilver font-medium">
				Start the sentry to see your assigned keys
			</p>

			<PrimaryButton
				onClick={() => startRuntime!()}
				wrapperClassName="w-max"
				className="flex justify-center items-center text-lg text-white bg-[#F30919] font-semibold mt-2 px-6 py-3 uppercase !h-[48px] hover:text-pelati duration-300 ease-in-out"
				btnText={"Start Sentry"}
			/>
		</div>
	);
}

