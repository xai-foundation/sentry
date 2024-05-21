import {ExternalLink} from "@sentry/ui";
import {DiscordIcon, TelegramIcon, XIcon} from "@sentry/ui/src/rebrand/icons/IconsComponents";

const NavbarLinks = () => {
    return (
        <div className="flex flex-col gap-[16px] mb-[40px]">
            <ExternalLink
                content={
                    <span className="flex gap-3 items-center uppercase !font-bold text-lg whitespace-nowrap">
                                <TelegramIcon
                                    className={"hover:fill-elementalGrey fill-white duration-200 ease-in min-w-[26px] h-[20px]"}/>
                                Telegram
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
                                Discord
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
                                X
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