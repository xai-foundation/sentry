import { WarningIcon } from "@sentry/ui/src/rebrand/icons/IconsComponents";
import CookieConsent from "react-cookie-consent";

export function ReactCookieConsent({ }) {

	return (
		<CookieConsent
			cookieName="userConsent"
			buttonClasses="hover-button"
			buttonText="I AGREE"
			contentClasses="!m-0 px-4 sm:flex-col lg:flex-row justify-center items-center"
			containerClasses="cookie-consent-container"
			style={{ backgroundColor:" rgba(24, 20, 21, 0.70)", textAlign: "center", fontFamily: "Rajdhani, sans-serif", margin: "0", fontWeight: "600", padding: "0", justifyContent: "center", alignItems: "center", clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)", minHeight: "50px", maxWidth: "100%" }}
			buttonStyle={{ color: "black", fontSize: "20px", background: "#F30919", fontFamily: "Rajdhani, sans-serif", padding: "10px 40px", clipPath: "polygon(15px 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%, 0 15px)", fontWeight: "700", margin: "0" }}
			expires={150} // Cookie expiry in days
		>
			<div className="cookie-consent flex items-center justify-start text-white/[0.9] md:text-lg sm:text-sm opacity-70 !m-0">
				<div className="min-w-[30px] mr-2"><WarningIcon fill="#FF0030" width={30} height={25}/></div>
				<div className="sm:mb-4 md:mb-0 lg:mb-0">This website uses cookies to enhance the user experience. By staying on this website you agree to our <a target="_blank" className="mx-1 hover:text-white duration-200 ease-in font-bold" href="https://xai.games/generalterms">Terms of Agreement</a> and <a target="_blank" className="ml-1 hover:text-white duration-200 ease-in font-bold" href="https://xai.games/privacypolicy">Privacy Policy</a></div>
			</div>
		</CookieConsent>
	);
}