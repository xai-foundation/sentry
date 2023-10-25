import {IconLabel} from "../../../../components/IconLabel";
import {SquareCard} from "../../../../components/SquareCard";
import {BiPlay} from "react-icons/bi";
import {IoMdCloseCircle} from "react-icons/io";
import {AiFillCheckCircle} from "react-icons/ai";

export function SentryActiveCard({active, setActive}) {
	return (
		<SquareCard className="bg-[#F5F5F5]">
			{active ? (
				<IconLabel
					icon={AiFillCheckCircle}
					color="#16A34A"
					title="Sentry Wallet active"
				/>
			) : (
				<>
					<IconLabel
						icon={IoMdCloseCircle}
						color="#F59E28"
						title="Sentry Wallet inactive"
					/>

					<p className="text-[15px] text-[#525252] mt-3">
						Sentry must be active 24/7 to accrue esXAI
					</p>

					<button
						onClick={setActive}
						className="w-full flex justify-center items-center gap-1 text-[15px] text-white bg-[#F30919] font-semibold mt-4 px-6 py-2"
					>
						<BiPlay className="w-5 h-5"/>
						Start Sentry
					</button>
				</>
			)}
		</SquareCard>
	);
}
