import {Dispatch, MutableRefObject, ReactNode, SetStateAction, useEffect, useRef} from "react";
import {DropdownArrow, WarningIcon} from "../../rebrand/icons/IconsComponents";

const DROPDOWN_ITEMS_WITHOUT_SCROLL = 11;
interface DropdownProps {
    setIsOpen: (isOpen: boolean) => void;
    isOpen: boolean;
    selectedValue: string | null;
    selectedValueRender: ReactNode;
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

export const DropdownItem = ({onClick, extraClasses, key, dropdownOptionsCount, children}: DropdownItemProps) => {
    return <p onClick={onClick} className={`flex items-center px-[15px] hover:bg-abaddonBlack bg-black cursor-pointer duration-300 ease-in-out text-lg min-h-[48px] font-medium ${dropdownOptionsCount > DROPDOWN_ITEMS_WITHOUT_SCROLL && "mr-[2px]"} ${extraClasses}`} key={key}>{children}</p>
}

export const Dropdown = ({setIsOpen, isOpen, isInvalid, dropdownOptionsCount, setSelectedValue, getPreferableItems, getDropdownItems, selectedValueRender, extraClasses, defaultValue}: DropdownProps) => {
    const dropdownRef = useRef(null) as unknown as MutableRefObject<HTMLDivElement>;
    const scrollbarRef = useRef(null) as unknown as MutableRefObject<HTMLDivElement>;

    useEffect(() => {
        const handleKeyDown = (e: MouseEvent) => {
            if(!dropdownRef.current.contains(e.target as Node) && !scrollbarRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleKeyDown);

        return () => {
            document.removeEventListener("mousedown", handleKeyDown);
        };
    }, []);

    return (
        <div className="relative z-30" ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className={`relative h-[48px] px-[15px] group z-[20] text-lg font-medium text-americanSilver transition-bg duration-300 ease-in-out ${isOpen ? "bg-velvetBlack" : "bg-nulnOil"} flex items-center justify-between w-[538px] dropdown-clip-path dropdown ${extraClasses?.dropdown}`}
            >
                <div className="flex items-center gap-[10px]">
                    {isInvalid && <WarningIcon width={18} height={16} fill={"#F76808"}/>}
                    {selectedValueRender}
                </div>
                <DropdownArrow
                    className={`h-[15px] transform ${isOpen ? "rotate-180 transition-transform ease-in-out duration-300" : "transition-transform ease-in-out duration-300"}`}
                />

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

