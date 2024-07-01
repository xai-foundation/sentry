import { IoMdClose } from "react-icons/io";
import {ExternalLink} from "@sentry/ui";
import NavbarTerms from "@/features/header/NavbarTerms";
import NavbarLinks from "@/features/header/NavbarLinks";

interface MobileNavbarProps {
    isOpened: boolean
    closeNavbar: () => void;
}

const MobileNavbar = ({isOpened = false, closeNavbar}: MobileNavbarProps) => {
    return (
        <div className={`w-screen ${isOpened ? "animate-navbar-appear block px-[15px]" : "animate-navbar-disappear hidden"} py-[20px] overflow-hidden min-h-screen bg-bloodThirstyWarlock z-20 absolute top-0 left-0`}>
            <div className="flex justify-end mb-4">
                <IoMdClose onClick={closeNavbar} color="white" size={34} />
            </div>
            <div className="flex flex-col pl-[21px] justify-between h-[calc(100vh-100px)]">
                <div className="font-bold text-[24px] uppercase !text-nowrap">
                    <ExternalLink
                        customClass="h-[44px] flex items-center global-clip-path mb-2 no-underline !text-[24px] !font-bold "
                        content={"DOCS"}
                        externalTab
                        link={"https://xai-foundation.gitbook.io/xai-network/xai-blockchain/sentry-node-purchase-and-setup"}
                    />

                </div>

                <div className="text-white font-bold text-lg uppercase whitespace-nowrap">
                    <NavbarLinks />
                    <NavbarTerms/>
                    <p>©2024 XAI. All Rights Reserved</p>
                </div>
            </div>
        </div>
    );
};

export default MobileNavbar;