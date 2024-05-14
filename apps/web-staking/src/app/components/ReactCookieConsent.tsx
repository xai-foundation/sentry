'use client';

import CookieConsent from "react-cookie-consent";

export function ReactCookieConsent({ }) {

	return (
		<CookieConsent
			location="bottom"
			cookieName="userConsent"
			buttonText="I agree"
			style={{ background: "black", textAlign: "center", fontFamily: "Supreme" }}
			buttonStyle={{ color: "white", fontSize: "15px", background: "#F30919", fontFamily: "Supreme", borderRadius: 8 }}
			expires={150} // Cookie expiry in days
		>
			<div className="cookie-consent">
				This website uses cookies to enhance the user experience. By staying on this website you agree to our <a target="_blank" href="https://xai.games/generalterms">Terms of Agreement</a> and <a target="_blank" href="https://xai.games/privacypolicy">Privacy Policy</a>
			</div>
		</CookieConsent>
	);
}