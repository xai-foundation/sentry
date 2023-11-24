import {AiFillWarning} from "react-icons/ai";
import {BiPlay} from "react-icons/bi";
import {useOperatorRuntime} from "@/hooks/useOperatorRuntime";

export function AssignKeysSentryNotRunning() {
	const {startRuntime} = useOperatorRuntime();

	return (
		<div className="flex flex-col justify-center items-center gap-4">
			<AiFillWarning className="w-16 h-16 text-[#F59E28]"/>
			<p className="text-2xl font-semibold">
				Sentry is not running

			</p>
			<p className="text-lg text-[#525252]">
				Start the sentry to see your assigned keys
			</p>

			<button
				onClick={startRuntime}
				className="flex justify-center items-center text-[15px] text-white bg-[#F30919] font-semibold mt-2 px-6 py-3"
			>
				<BiPlay className="w-6 h-6"/>
				Start Sentry
			</button>
		</div>
	);
}

