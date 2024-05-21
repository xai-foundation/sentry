import { XaiLogoFooter } from "@sentry/ui/src/rebrand/icons/IconsComponents";

export function Footer() {
	return (
		<footer className="w-full flex justify-center items-center bg-white py-6 min-h-[152px] relative">
			<div className="w-full max-w-[1400px] flex flex-col gap-5 px-[15px]">

				<div className="flex flex-col-reverse md:flex-row justify-between items-center gap-8">
					<div className="w-full flex flex-col gap-2 items-center justify-center text-vividRed font-medium">
						<XaiLogoFooter svgClassName={"absolute top-[-25px]"} />
						<ul className="w-full flex lg:flex-row flex-col items-center justify-center mt-[70px] uppercase">
							<li>
								<p>©2024 XAI. All Rights Reserved</p>
							</li>

							<li className="flex items-center gap-2">
								<p className="hidden lg:inline ml-2">|</p>
								<a
									className="text-blue-500 cursor-pointer hover:underline"
									onClick={() => window.open("https://xai.games/sentry-node-agreement/", "_blank", "noopener noreferrer")}
								>
									Sentry Node Agreement
								</a>
							</li>
							<li className="flex items-center gap-2">
								<p className="hidden lg:inline ml-2">|</p>
								<a
									className="text-blue-500 cursor-pointer hover:underline"
									onClick={() => window.open("https://xai.games/privacy-policy/", "_blank", "noopener noreferrer")}
								>
									Privacy Policy Agreement
								</a>
							</li>
							<li className="flex items-center gap-2">
								<p className="hidden lg:inline ml-2">|</p>
								<a
									className="text-blue-500 cursor-pointer hover:underline"
									onClick={() => window.open("https://xai.games/generalterms/", "_blank", "noopener noreferrer")}
								>
									General Terms
								</a>
							</li>
							<li className="flex items-center gap-2">
								<p className="hidden lg:inline ml-2">|</p>
								<a
									className="text-blue-500 cursor-pointer hover:underline"
									onClick={() => window.open("https://xai.games/stakingterms/", "_blank", "noopener noreferrer")}
								>
									Staking Terms
								</a>
							</li>
						</ul>
					</div>
				</div>
			</div>
		</footer>
	);
}
