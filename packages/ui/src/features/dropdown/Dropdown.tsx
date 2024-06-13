import {Dispatch, MutableRefObject, ReactNode, SetStateAction, useEffect, useRef} from "react";
import {DropdownArrow} from "../../rebrand/icons/IconsComponents";
interface DropdownProps {
    setIsOpen: (isOpen: boolean) => void;
    isOpen: boolean;
    selectedValue: string | null;
    selectedValueRender: ReactNode;
    setSelectedValue: Dispatch<SetStateAction<string | null>>;
    getDropdownItems: () => JSX.Element[];
    defaultValue?: string;
    extraClasses?: {
        dropdownContainer?: string;
        dropdown?: string;
    }
}

interface DropdownItemProps {
    onClick: () => void;
    extraClasses?: string;
    key: string;
    children: ReactNode;
}

export const DropdownItem = ({onClick, extraClasses, key, children}: DropdownItemProps) => {
    return <p onClick={onClick} className={`flex items-center px-[15px] hover:bg-dropdownItemPrimaryHoverBg cursor-pointer duration-300 ease-in-out text-lg h-[48px] font-medium ${extraClasses}`} key={key}>{children}</p>
}

export const Dropdown = ({setIsOpen, isOpen, setSelectedValue, getDropdownItems, selectedValueRender, extraClasses, defaultValue}: DropdownProps) => {
    const dropdownRef = useRef(null) as unknown as MutableRefObject<HTMLDivElement>;

    useEffect(() => {
        const handleKeyDown = (e: MouseEvent) => {
            if(!dropdownRef.current.contains(e.target as Node)) {
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
                {selectedValueRender}
                <DropdownArrow
                    className={`h-[15px] transform ${isOpen ? "rotate-180 transition-transform ease-in-out duration-300" : "transition-transform ease-in-out duration-300"}`}
                />

            </div>
            <span
                className="bg-foggyLondon transition-bg ease-in-out duration-300 absolute left-[-2px] top-[-2px] z-10 w-[calc(100%+4px)] h-[calc(100%+4px)] dropdown-clip-path dropdown-border"></span>

            {isOpen && (
                <div
                    className="absolute top-[55px] left-[-1px] flex flex-col w-[538px] bg-nulnOil text-americanSilver z-30 text-lg">
                    <p
                        onClick={() => {
                            setSelectedValue(null);
                            setIsOpen(false);
                        }}
                        className="px-[15px] h-[48px] flex items-center cursor-pointer hover:bg-dropdownItemPrimaryHoverBg"
                    >
                        {defaultValue}
                    </p>
                    {getDropdownItems()}
                </div>
            )}
        </div>
    );
};

