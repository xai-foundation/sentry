import {ExternalLink} from "@sentry/ui";
import {DiscordIcon, TelegramIcon, XIcon} from "@sentry/ui/src/rebrand/icons/IconsComponents";
import { useTranslation } from "react-i18next";

const NavbarLinks = () => {
    const { t: translate } = useTranslation("Nav");
    return (
        <div className="flex flex-col gap-[16px] mb-[40px]">
            <ExternalLink
                content={
                    <span className="flex gap-3 items-center uppercase !font-bold text-lg whitespace-nowrap">
                                <TelegramIcon
                                    className={"hover:fill-elementalGrey fill-white duration-200 ease-in min-w-[26px] h-[20px]"}/>
                                {translate("telegram")}
                            </span>
                }
                link={"https://t.me/XaiSentryNodes"}
                externalTab
                customClass={"no-underline !font-bold text-xl "}
            />

            <ExternalLink
                content={
                    <span className="flex gap-3 items-center uppercase !font-bold text-lg whitespace-nowrap">
                                <DiscordIcon className={"hover:fill-elementalGrey fill-white duration-200 ease-in min-w-[26px] h-[20px]"}/>
                                {translate("discord")}
                            </span>
                }
                link={"https://discord.com/invite/xaigames"}
                externalTab
                customClass={"no-underline !font-bold text-xl "}
            />

            <ExternalLink
                content={
                    <span className="flex gap-3 items-center uppercase !font-bold text-lg whitespace-nowrap">
                                <XIcon className={"hover:fill-elementalGrey fill-white duration-200 ease-in min-w-[26px] h-[20px]"}/>
                                {translate("twitter")}
                            </span>
                }
                link={"https://twitter.com/xai_games"}
                externalTab
                customClass={"no-underline !font-bold text-xl "}
            />

        </div>

    );
};

export default NavbarLinks;