import {ExternalLink} from "@sentry/ui";
import { DiscordIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";

const NavbarLinks = () => {
    return (
        <div className="flex flex-col gap-[16px]">
            <ExternalLink
                content={
                    <span className="flex gap-3 items-center uppercase !font-bold text-lg">
                                <DiscordIcon className={"hover:fill-elementalGrey fill-white duration-200 ease-in"}/>
                                Discord
                            </span>
                }
                link={""}
                customClass={"no-underline !font-bold text-xl "}
            />

            <ExternalLink
                content={
                    <span className="flex gap-3 items-center uppercase !font-bold text-lg">
                                <DiscordIcon className={"hover:fill-elementalGrey fill-white duration-200 ease-in"}/>
                                Discord
                            </span>
                }
                link={""}
                customClass={"no-underline !font-bold text-xl "}
            />

            <ExternalLink
                content={
                    <span className="flex gap-3 items-center uppercase !font-bold text-lg">
                                <DiscordIcon className={"hover:fill-elementalGrey fill-white duration-200 ease-in"}/>
                                Discord
                            </span>
                }
                link={""}
                customClass={"no-underline !font-bold text-xl "}
            />

        </div>

    );
};

export default NavbarLinks;