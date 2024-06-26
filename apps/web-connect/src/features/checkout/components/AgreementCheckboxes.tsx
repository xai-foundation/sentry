
import MainCheckbox from "@sentry/ui/src/rebrand/checkboxes/MainCheckbox";
import { KYCTooltip } from "./KYCTooltip";
interface IAgreementCheckboxes {
    checkboxOne: boolean;
    setCheckboxOne: (value: boolean) => void;
    checkboxTwo: boolean;
    setCheckboxTwo: (value: boolean) => void;
    checkboxThree: boolean;
    setCheckboxThree: (value: boolean) => void;
}


export function AgreementCheckboxes(props: IAgreementCheckboxes){
    const {checkboxOne, setCheckboxOne, checkboxTwo, setCheckboxTwo, checkboxThree, setCheckboxThree} = props;
    
    return (
        <div className="flex w-full flex-col justify-center gap-2">
								<MainCheckbox
									onChange={() => setCheckboxOne(!checkboxOne)}
									isChecked={checkboxOne}
									labelStyle="!items-start"
								>
									<div className="sm:w-[200px] md:w-[300px] lg:w-auto">
									<span className="sm:text-base text-elementalGrey sm:mr-2">I agree with the</span>
									<a
										className="cursor-pointer text-[#F30919] text-base"
										onClick={() => window.open("https://xai.games/sentrynodeagreement/")}>
										Sentry Node Agreement
										</a>
									</div>
								</MainCheckbox>


								<MainCheckbox
									onChange={() => setCheckboxTwo(!checkboxTwo)}
									isChecked={checkboxTwo}
									labelStyle="!items-start"
								>
									<div className="sm:w-[300px] md:w-auto">
										<span className="sm:text-base text-elementalGrey">I understand Sentry Node Keys are not transferable</span>
									</div>
								</MainCheckbox>

								<MainCheckbox
									onChange={() => setCheckboxThree(!checkboxThree)}
									isChecked={checkboxThree}
									labelStyle="!items-start"
								>
									<div className="flex w-full sm:w-[300px] justify-between md:w-auto sm:flex-col lg:flex-row items-start">
									<span className="sm:text-base text-elementalGrey lg:mr-2">I understand that I cannot claim rewards until I pass KYC</span>
									<KYCTooltip
										width={850}
									>
										<p className="text-[#F30919] text-base">(See blocked countries)</p>
									</KYCTooltip>
									</div>
								</MainCheckbox>
							</div>
    )
}