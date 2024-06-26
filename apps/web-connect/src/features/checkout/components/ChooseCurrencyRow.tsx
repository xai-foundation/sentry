import { Dispatch, SetStateAction } from "react";

interface ChooseCurrencyRowProps {
    setCurrency: Dispatch<SetStateAction<string>>;
}

export function ChooseCurrencyRow({
    setCurrency,
}: ChooseCurrencyRowProps) {
    return (
        <div className="w-full flex flex-col gap-4">
            <div className="mt-4">
                <hr className="my-2 border-[#525252]" />
                <div className="flex sm:flex-col lg:flex-row items-center justify-between py-2">
                    <div className="flex flex-row items-center gap-2 sm:text-xl lg:text-2xl">
                        <span className="text-[18px] text-elementalGrey font-medium">Choose payment currency</span>
                    </div>
                    <div className="flex flex-row items-center gap-1 bg-black">
                        <span className="text-white font-bold text-3xl bg-black">
                            <form onSubmit={(e) => e.preventDefault()}>
                                <select
                                    id="currency"
                                    name="currency"
                                    onChange={(e) => setCurrency(e.target.value)}
                                >
                                    <option value="AETH">AETH</option>
                                    <option value="XAI">XAI</option>
                                    <option value="ESXAI">ESXAI</option>
                                </select>
                            </form>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
