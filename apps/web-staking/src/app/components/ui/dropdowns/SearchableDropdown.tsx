import { Dispatch, MutableRefObject, ReactNode, SetStateAction, useEffect, useRef } from "react";

export const DropdownArrow = ({ width = 10, height = 3, className = "" }) => {
    return <svg
        width={width} height={height} className={className}
        fill="#fff"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 4.8117635 3.2432653" version="1.1" id="svg1" >
        <defs id="defs1" />
        <g id="layer1"
            transform="translate(-0.23995138,-1.0242006)"><path d="M 2.6458332,2.6458333 V -2.3262066 8.1888758" id="path1" />
            <g id="g2" transform="translate(-4.1599448,-4.385214)"><rect id="rect2" width="1.2605684" height="3.478761" x="9.7083769" y="-2.1346393" ry="0.13058987" transform="rotate(45)" />
                <rect id="rect2-2" width="1.2605684"
                    height="3.478761" x="0.083553314" y="7.4901848" ry="0.13058987"
                    transform="matrix(-0.70710678,0.70710678,0.70710678,0.70710678,0,0)" /></g></g></svg>
}

export const WarningIcon = ({ width = 24, height = 24, className, fill = "#ffc53d" }: { width?: number, height?: number, fill?: string, className?: string }) => {

    return (
        <svg style={{ width: width, height: height }} className={className} xmlns="http://www.w3.org/2000/svg" width="27.789" height="24" viewBox="0 0 27.789 24">
            <path id="warning_FILL1_wght400_GRAD0_opsz24_4_" data-name="warning_FILL1_wght400_GRAD0_opsz24 (4)" d="M40-856l13.895-24,13.895,24Zm13.895-3.789a1.222,1.222,0,0,0,.9-.363,1.222,1.222,0,0,0,.363-.9,1.222,1.222,0,0,0-.363-.9,1.222,1.222,0,0,0-.9-.363,1.222,1.222,0,0,0-.9.363,1.222,1.222,0,0,0-.363.9,1.222,1.222,0,0,0,.363.9A1.222,1.222,0,0,0,53.895-859.789Zm-1.263-3.789h2.526v-6.316H52.632Z" transform="translate(-40 880)" fill={fill} />
        </svg>
    )
};
const DROPDOWN_ITEMS_WITHOUT_SCROLL = 11;
interface DropdownProps {
    setIsOpen: (isOpen: boolean) => void;
    isOpen: boolean;
    selectedValue: string | null;
    selectedValueRender: string | null;
    setSelectedValue: Dispatch<SetStateAction<string | null>>;
    getPreferableItems?: () => JSX.Element[];
    getDropdownItems: () => JSX.Element[];
    dropdownOptionsCount: number; // just put here arr.length
    isInvalid?: boolean;
    defaultValue?: string;
    extraClasses?: {
        dropdownContainer?: string;
        dropdown?: string;
        dropdownOptions?: string;
    }
}

interface DropdownItemProps {
    onClick: () => void;
    extraClasses?: string;
    dropdownOptionsCount: number; // just put here arr.length
    key: string;
    children: ReactNode;
}

export const SearchableDropdownItem = ({ onClick, extraClasses, key, dropdownOptionsCount, children }: DropdownItemProps) => {
    return <p onClick={onClick} className={`flex items-center px-[15px] hover:bg-abaddonBlack bg-black cursor-pointer duration-300 ease-in-out text-lg min-h-[48px] font-medium ${dropdownOptionsCount > DROPDOWN_ITEMS_WITHOUT_SCROLL && "mr-[2px]"} ${extraClasses}`} key={key}>{children}</p>
}

export const SearchableDropdown = ({ setIsOpen, isOpen, isInvalid, dropdownOptionsCount, setSelectedValue, getPreferableItems, getDropdownItems, selectedValueRender, extraClasses, defaultValue }: DropdownProps) => {
    const dropdownRef = useRef(null) as unknown as MutableRefObject<HTMLDivElement>;
    const scrollbarRef = useRef(null) as unknown as MutableRefObject<HTMLDivElement>;

    useEffect(() => {
        const handleKeyDown = (e: MouseEvent) => {
            if (!dropdownRef.current.contains(e.target as Node) && !scrollbarRef?.current?.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleKeyDown);
        };
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedValue(e.target.value);
    }

    return (
        <div className="relative z-30" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`relative h-[48px] px-[15px] group z-[20] text-lg font-medium text-americanSilver transition-bg duration-300 ease-in-out ${isOpen ? "bg-velvetBlack" : "bg-nulnOil"} flex items-center justify-between w-[538px] dropdown-clip-path dropdown ${extraClasses?.dropdown}`}
            >
                <div className="flex items-center gap-[10px] flex-grow">
                    {isInvalid && <WarningIcon width={18} height={16} fill={"#F76808"} />}
                    <input
                        type="text"
                        placeholder="Select your country"
                        className={`w-full ${isOpen ? "bg-velvetBlack" : "bg-nulnOil"} transition-bg duration-300 ease-in-out outline-none placeholder-americanSilver`}
                        value={selectedValueRender!}
                        onChange={handleInput}
                    />
                </div>
                <div className="cursor-pointer p-2">
                    <DropdownArrow
                        className={`h-[15px] transform ${isOpen ? "rotate-180 transition-transform ease-in-out duration-300" : "transition-transform ease-in-out duration-300"}`}
                    />
                </div>
            </div>
            <span
                className={`bg-foggyLondon transition-bg ease-in-out duration-300 absolute left-[-2px] top-[-2px] z-10 w-[calc(100%+4px)] h-[calc(100%+4px)] ${isInvalid && "!bg-blazeOrange hover:!bg-blazeOrange"} dropdown-clip-path dropdown-border`}></span>

            {isOpen && (
                <>
                    <div
                        className={`absolute top-[55px] left-[-1px] flex flex-col w-[538px] bg-black text-americanSilver z-30 text-lg max-h-[528px] ${extraClasses?.dropdownOptions} ${dropdownOptionsCount > DROPDOWN_ITEMS_WITHOUT_SCROLL && "overflow-y-scroll overflow-x-hidden"} dropdown-options`}>
                        {defaultValue && <p
                            onClick={() => {
                                setSelectedValue(null);
                                setIsOpen(false);
                            }}
                            className={`px-[15px] min-h-[48px] flex items-center cursor-pointer bg-black ${dropdownOptionsCount > DROPDOWN_ITEMS_WITHOUT_SCROLL && "mr-[2px]"} hover:bg-abaddonBlack`}
                        >
                            {defaultValue}
                        </p>}
                        {getPreferableItems && <div className="relative mb-[12px]">
                            {getPreferableItems()}
                            <span
                                className="w-[calc(100%-30px)] h-[1px] bg-foggyLondon absolute bottom-[-7px] left-[15px]"></span>
                        </div>}
                        {getDropdownItems()}
                        {dropdownOptionsCount > DROPDOWN_ITEMS_WITHOUT_SCROLL && <div
                            className="h-full min-h-[48px] max-h-[528px] w-[10px] absolute top-0 right-[-10px] bg-white z-[60]"
                            ref={scrollbarRef}></div>
                        }
                    </div>
                </>
            )}
        </div>
    );
};