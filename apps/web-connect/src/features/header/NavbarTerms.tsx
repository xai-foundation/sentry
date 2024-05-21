
const NavbarTerms = () => {
    return (
        <div className="text-white font-bold text-lg uppercase mb-[40px]">
            <div className="flex flex-col gap-3">
                <a
                    className="text-blue-500 cursor-pointer hover:underline whitespace-nowrap"
                    onClick={() => window.open("https://xai.games/sentry-node-agreement/", "_blank", "noopener noreferrer")}
                >
                    Sentry Node Agreement
                </a>
                <a
                    className="text-blue-500 cursor-pointer hover:underline whitespace-nowrap"
                    onClick={() => window.open("https://xai.games/privacy-policy/", "_blank", "noopener noreferrer")}
                >
                    Privacy Policy Agreement
                </a>
                <a
                    className="text-blue-500 cursor-pointer hover:underline whitespace-nowrap"
                    onClick={() => window.open("https://xai.games/generalterms/", "_blank", "noopener noreferrer")}
                >
                    General Terms
                </a>
                <a
                    className="text-blue-500 cursor-pointer hover:underline whitespace-nowrap"
                    onClick={() => window.open("https://xai.games/stakingterms/", "_blank", "noopener noreferrer")}
                >
                    Staking Terms
                </a>
            </div>
        </div>
    );
};

export default NavbarTerms;