import React, { useEffect, useState } from "react";
import ExternalLinkIcon from "../../../../../../packages/ui/src/rebrand/icons/ExternalLinkIcon";
import { CloseIcon } from "../../../../../../packages/ui/src/rebrand/icons/CloseIcon";

interface IAnnouncementBanner {
    title: string;
    text: string;
    href: string;
}

const AnnouncementBanner = ({ title, text, href }: IAnnouncementBanner) => {
    const [isShow, setIsShow] = useState<any>(Number(sessionStorage.getItem("announcement_banner")));

    useEffect(() => {
        const value = sessionStorage.getItem("announcement_banner") || "1";
        setIsShow(+value);
        // return () => {
        //   sessionStorage.removeItem("announcement_banner");
        // };
    }, []);

    const closeBanner = (e: any) => {
        e.preventDefault();
        setIsShow(0);
        sessionStorage.setItem("announcement_banner", "0");
    };

    return (
        <>
            {isShow && <div
                className="w-full announcementBannerGradient flex flex-col md:flex-row md:justify-center md:items-center justify-start items-start h-[132px] md:h-[54px] text-lg relative">
                <div
                    className="flex flex-col md:flex-row md:justify-center md:items-center justify-start items-start md:gap-[5px] gap-0 text-lg mt-[14px] ml-[17px] md:my-0 md:mx-0">
                    <span className="block font-bold text-nulnOil">{title}</span>
                    <span className="block text-nulnOil">{text}</span>
                    <span className="block font-bold text-nulnOil md:mt-0 mt-[10px]">
                <a className="underline flex items-center gap-[7px]" href={href} target={"_blank"}>
                    Learn more
                    <ExternalLinkIcon extraClasses={{ svgClasses: "mt-[-4px]" }} />
                </a>
            </span>
                </div>
                <span onClick={closeBanner}
                      className="block cursor-pointer absolute right-[23px] md:top-1/2 top-[20px] md:-translate-y-[50%]"><CloseIcon
                    fill={"#181818"} height={13} width={13} /></span>
            </div>}
        </>);
};

export default AnnouncementBanner;