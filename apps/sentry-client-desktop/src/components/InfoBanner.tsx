import { PropsWithChildren } from "react";
import BaseCallout from "@sentry/ui/src/rebrand/callout/BaseCallout";
import { AiOutlineClose } from "react-icons/ai";
import { atom, useAtom } from "jotai";

interface InfoBannerProps extends PropsWithChildren {
	heading: string,
	description: string,
	externalLink: string
}

export const infoBannerStateAtom = atom<{ visible: boolean }>({ visible: true });

// use these inside of a flex-column!!
export function InfoBanner({ heading, description, externalLink }: InfoBannerProps) {
	const [infoBannerState, setInfoBannerState] = useAtom(infoBannerStateAtom);

	return (infoBannerState.visible && <BaseCallout extraClasses={{
		calloutWrapper: "w-full bg-potBlack",
		calloutFront: "!items-start flex-col bg-potBlack"
	}}>
		<div className="flex justify-between items-center w-full">
			<p className="font-semibold text-cascadingWhite">
				{heading}
			</p>
			<span onClick={() => {
				setInfoBannerState({ visible: false })
				console.log("Hello test", infoBannerState);
			}
			} className="cursor-pointer">
				<AiOutlineClose color="white" className={"hover:!text-hornetSting duration-300 size-[22px] ease-in"} />
			</span>
		</div>
		<div>
			<p className="text-elementalGrey">
				{description}
				<a
					onClick={() => window.electron.openExternal(externalLink)}
					className={`cursor-pointer underline text-cascadingWhite hover:text-hornetSting duration-300`}
				>
					Learn more
				</a>
			</p>
		</div>
	</BaseCallout>)
}