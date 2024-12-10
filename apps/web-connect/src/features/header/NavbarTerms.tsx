import { useTranslation } from "react-i18next";

const NavbarTerms = () => {
    const { t: translate } = useTranslation("Nav");
    return (
        <div className="text-white font-bold text-lg uppercase mb-[40px]">
            <div className="flex flex-col gap-3">
                <a
                    className="text-blue-500 cursor-pointer hover:underline whitespace-nowrap"
                    onClick={() => window.open("https://xai.games/sentry-node-agreement/", "_blank", "noopener noreferrer")}
                >
                    {translate("sentryNodeAgreement")}
                </a>
                <a
                    className="text-blue-500 cursor-pointer hover:underline whitespace-nowrap"
                    onClick={() => window.open("https://xai.games/privacy-policy/", "_blank", "noopener noreferrer")}
                >
                    {translate("privacyPolicy")}
                </a>
                <a
                    className="text-blue-500 cursor-pointer hover:underline whitespace-nowrap"
                    onClick={() => window.open("https://xai.games/generalterms/", "_blank", "noopener noreferrer")}
                >
                    {translate("generalTerms")}
                </a>
                <a
                    className="text-blue-500 cursor-pointer hover:underline whitespace-nowrap"
                    onClick={() => window.open("https://xai.games/stakingterms/", "_blank", "noopener noreferrer")}
                >
                    {translate("stakingTerms")}
                </a>
            </div>
        </div>
    );
};

export default NavbarTerms;