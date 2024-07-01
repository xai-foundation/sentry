import { ErrorCircle } from "../icons/IconsComponent";

function Warning({ warning }: { warning: string }) {
	return (
		<div className="flex relative flex-col mb-4 bg-[#FFF9ED] text-left px-[40px] py-[15px] w-full p-3 rounded-xl text-[14px]">
			<div className="absolute top-4 left-3">
				<ErrorCircle width={20} height={20} />
			</div>
			<span className="text-[#C36522]">
				{warning}
			</span>
		</div>
	)
};

export default Warning;