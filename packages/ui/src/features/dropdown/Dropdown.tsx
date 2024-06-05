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
    return <p onClick={onClick} className={`hover:bg-dropdownItemPrimaryHoverBg cursor-pointer duration-300 ease-in-out text-lg h-[48px] font-medium ${extraClasses}`} key={key}>{children}</p>
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
                className={`relative h-[48px] px-[15px] group z-[20] text-lg font-medium text-primaryText transition-bg duration-300 ease-in-out ${isOpen ? "bg-dropdownSecondaryBg" : "bg-dropdownPrimaryBg"} flex items-center justify-between w-[538px] dropdown-clip-path dropdown ${extraClasses?.dropdown}`}
            >
                {selectedValueRender}
                {/*todo change arrow whe it will be available*/}
                <DropdownArrow
                    className={`h-[15px] transform ${isOpen ? "rotate-180 transition-transform ease-in-out duration-300" : "transition-transform ease-in-out duration-300"}`}
                />

            </div>
            <span
                className="bg-secondaryBorderColor transition-bg ease-in-out duration-300 absolute left-[-1px] top-[-1px] z-10 w-[calc(100%+2px)] h-[calc(100%+2px)] dropdown-clip-path dropdown-border"></span>

            {isOpen && (
                <div
                    className="absolute top-[55px] left-[-1px] flex flex-col w-[538px] bg-dropdownPrimaryBg text-primaryText z-30">
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

