import { ErrorCircle } from "../icons/IconsComponent";

interface WarningProps {
	title: string;
	description: string;
	checkboxText?: string;
	onAcceptTerms: () => void;
	includeYouMustAgreeMessage?: boolean;
	checkbox: boolean;
	setCheckbox: React.Dispatch<React.SetStateAction<boolean>>;
	includeCheckbox?: boolean;
}

//The final key you unstake from this pool will take 60 days to unstake.
//All other keys you unstake will take 30 days to unstake.
//I understand the unstake periods for my keys
const WarningComponent = ({
	title,
	description,
	checkboxText,
	onAcceptTerms,
	includeYouMustAgreeMessage,
	checkbox,
	setCheckbox: setCh,
	includeCheckbox = true
}: WarningProps) => {
	return (
		<>
			<div className="flex relative flex-col mb-4 bg-[#FFF9ED] text-left px-[40px] py-[25px] w-full p-3 rounded-xl">
				<div className="absolute top-7 left-3">
					<ErrorCircle width={20} height={20} />
				</div>
				<span className="text-[#C36522] font-bold">
					{title}
				</span>
				<span className="text-[#C36522]">
					{description}
				</span>
			</div>

			{includeYouMustAgreeMessage && (
				<div className="mb-3">
					<span className="text-graphiteGray">
						You must agree to the following before continuing
					</span>
				</div>
			)}

			{includeCheckbox && (
				<div className="flex pl-[10px] pr-[50px] mb-[50px]">
					<div className="py-[2px] mr-[10px]">
						<input
							checked={checkbox}
							onClick={onAcceptTerms}
							className="accent-red w-4 h-3.5 border-0 rounded-md focus:ring-0"
							type="checkbox"
							onChange={() => setCh(!checkbox)}
						/>
					</div>

					<div>
						<span className="text-graphiteGray">
							{checkboxText}
						</span>
					</div>

				</div>
			)}
		</>
	);
};

export default WarningComponent;
