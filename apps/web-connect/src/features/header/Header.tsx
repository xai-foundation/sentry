import {ReactComponent as XaiLogo} from "../../../../sentry-client-desktop/src/svgs/xai-logo-full.svg";
import {useNavigate} from "react-router-dom";

export function Header() {
	const navigate = useNavigate();
	return (
		<div>
			<div className="fixed flex w-full h-[4rem] justify-between items-center bg-white py-[0.325rem] px-[0.75rem]">
				<div
					className="w-[4.3rem] ml-2"
					onClick={() => navigate("/")}
				>
					<XaiLogo/>
				</div>
				<div>
					<w3m-button/>
				</div>
			</div>
		</div>
	);
}
