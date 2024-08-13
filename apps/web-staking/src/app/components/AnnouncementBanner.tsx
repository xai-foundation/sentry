import React, { useEffect, useState } from "react";
import ExternalLinkIcon from "../../../../../packages/ui/src/rebrand/icons/ExternalLinkIcon";
import { CloseIcon } from "./icons/IconsComponent";

interface IAnnouncementBanner {
    activateBanner: boolean; // Externally control if the banner should be shown at all. Set to false if no banner should be displayed in a release
    bannerVersion: string; // Banner version for session storage. Used to enable setting a new announcement banner even if it previously has been closed
    title: string;
    text: string;
    href: string;
}

const AnnouncementBanner = ({ title, text, href, activateBanner, bannerVersion }: IAnnouncementBanner) => {

    const sessionKey = `announcement_banner_${bannerVersion}`

    const [isShow, setIsShow] = useState<number>(Number(sessionStorage.getItem(sessionKey)));

    useEffect(() => {
        const value = sessionStorage.getItem(sessionKey) || Number(activateBanner);
        setIsShow(Number(value));
    }, []);

    const closeBanner = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        setIsShow(0);
        sessionStorage.setItem(sessionKey, "0");
    };

    return (
        <>
            {(activateBanner && isShow) && <div
                className="w-full announcementBannerGradient flex flex-col md:flex-row md:justify-center md:items-center justify-start items-start h-[132px] md:h-[54px] text-lg relative">
                <div
                    className="flex flex-col md:flex-row md:justify-center md:items-center justify-start items-start md:gap-[5px] gap-0 text-lg mt-[14px] ml-[17px] md:my-0 md:mx-0">
                    <span className="block font-bold text-nulnOil">{title}</span>
                    <span className="block text-nulnOil max-w-[80%]">{text}</span>
                    <span className="block font-bold text-nulnOil md:mt-0 mtb-[10px]">
                        <a className="underline flex items-center gap-[7px]" href={href} target={"_blank"}>
                            Learn more
                            <ExternalLinkIcon extraClasses={{ svgClasses: "mt-[-4px]" }} />
                        </a>
                    </span>
                </div>
                <span onClick={closeBanner}
                    className="block cursor-pointer absolute right-[23px] md:top-1/2 top-[20px] md:-translate-y-[50%]">
                    <CloseIcon fill={"#181818"} height={13} width={13} />
                </span>
            </div>}
        </>);
};

export default AnnouncementBanner;