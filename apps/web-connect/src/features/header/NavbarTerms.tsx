
const NavbarTerms = () => {
    return (
        <div className="h-full text-white font-bold text-lg uppercase mt-[55px]">
            <div className="flex flex-col gap-3">
                <a
                    className="text-blue-500 cursor-pointer hover:underline whitespace-nowrap"
                    onClick={() => window.open("https://xai.games/sentrynodeagreement/", "_blank", "noopener noreferrer")}
                >
                    Sentry Node Agreement
                </a>
                <a
                    className="text-blue-500 cursor-pointer hover:underline whitespace-nowrap"
                    onClick={() => window.open("https://xai.games/privacypolicy/", "_blank", "noopener noreferrer")}
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
                <a
                    className="text-blue-500 cursor-pointer hover:underline whitespace-nowrap"
                    onClick={() => window.open("https://fullyillustrated.com/", "_blank", "noopener noreferrer")}
                >
                    Site design by fully illustrated
                </a>
            </div>
        </div>
    );
};

export default NavbarTerms;