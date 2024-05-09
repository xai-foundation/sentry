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
        <div className={`w-screen overflow-hidden min-h-screen bg-bloodThirstyWarlock z-20 absolute top-0 left-0 p-[20px]  ${isOpened ? "block" : "hidden"}`}>
            <div className="flex justify-end mb-4">
                <IoMdClose onClick={closeNavbar} color="white" size={34} />
            </div>
            <div className="flex flex-col justify-between h-full">
                <div className="font-bold text-[24px] uppercase h-full mb-[200px]">
                    <ExternalLink
                        customClass="h-[64px] bg-white flex items-center pl-[21px] global-clip-path mb-2 !text-vividRed no-underline text-[24px] !font-bold"
                        content={"DOCS"} link={""}
                    />

                    <ExternalLink
                        customClass="h-[64px] bg-white flex items-center pl-[21px] global-clip-path mb-2 !text-vividRed no-underline text-[24px] !font-bold"
                        content={"BUILD WITH US"} link={""}
                    />
                </div>
                <NavbarLinks />
                <NavbarTerms/>
                <div className="mt-[35px] text-white font-bold text-lg uppercase">
                    <p>©2024 XAI. All Rights Reserved</p>
                </div>
            </div>
        </div>
    );
};

export default MobileNavbar;