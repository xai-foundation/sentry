import { useEffect, useState } from "react";
import { BulkOwnerOrPool, SentryAddressInformation } from "@sentry/core";
import { CopyIcon, DefaultPollIcon, KeyIcon, Wallet } from "@sentry/ui/dist/src/rebrand/icons/IconsComponents";
import { WarningIcon } from "@sentry/ui/dist/src/rebrand/icons/WarningIcon";
import { AiFillCheckCircle } from "react-icons/ai";
import { HiOutlineDotsVertical } from "react-icons/hi";
import CustomTooltip from "@sentry/ui/dist/src/rebrand/tooltip/Tooltip";
import { IoTriangleSharp } from "react-icons/io5";
import { drawerStateAtom, DrawerView } from "../drawer/DrawerManager";
import { useAtom } from "jotai";


interface SentryWalletTableBodyProps {
    sentryAddressStatusMap: Map<string, SentryAddressInformation>;
    operatorWalletData: BulkOwnerOrPool[],
    operatorAssignedWallets: string[]
}

export const SentryWalletTableBody = ({ sentryAddressStatusMap, operatorWalletData, operatorAssignedWallets }: SentryWalletTableBodyProps) => {
    const [_, setDrawerState] = useAtom(drawerStateAtom);
    const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
    const [copiedWallet, setCopiedWallet] = useState("");

    const copyWallet = (selectedWallet: string) => {
        navigator.clipboard.writeText(selectedWallet)
    }

    useEffect(() => {
        const timerId = setTimeout(() => {
            if (copiedWallet) setCopiedWallet("");
        }, 2000)

        return () => {
            clearTimeout(timerId);
        }

    }, [copiedWallet]);

    const toggleRow = (key: string) => {
        setExpandedRows((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    if (sentryAddressStatusMap.size === 0) {
        return
    }

    const generateImage = (item: BulkOwnerOrPool) => {
        return item.isPool ? (
            item.logoUri ? (
                <img src={item.logoUri} className="w-[30px] h-[30px] rounded-full object-cover" />
            ) : (
                <DefaultPollIcon />
            )
        ) : (
            <Wallet />
        );
    };

    const rows = operatorWalletData.filter(o => operatorAssignedWallets.includes(o.address)).map(walletData => {
        const key = walletData.address;
        const isExpanded = expandedRows[walletData.address];
        const statusInOperator = sentryAddressStatusMap.get(walletData.address.toLowerCase());
        const isAssigned = statusInOperator !== undefined;
        const statusMessage = isAssigned ? statusInOperator?.status : "Wallet not assigned to Sentry";

        return (
            <tr className="bg-nulnOil flex pl-[10px] text-lg border-b border-chromaphobicBlack" key={`walletOrPool-${key}`}>
                <td className={`min-w-[26%] max-w-[25%] pr-2 pl-3 py-2 flex gap-2 items-center text-[18px] ${isAssigned ? "text-white" : "text-darkRoom"}`}>
                    {generateImage(walletData)}
                    {walletData.isPool ? walletData.name : `${walletData.address.slice(0, 6)}...${walletData.address.slice(-6)}`}
                    {!walletData.isPool && <span className="cursor-pointer" onClick={() => copyWallet(walletData.address)}>
                        <CustomTooltip
                            content={"Copied!"}
                            showOnClick={true}
                            delay={3000}
                            extraClasses={{
                                tooltipContainer: "bg-white w-max !left-[-30px] !top-[36px]",
                                arrowStyles: "!top-[20px] !left-[-15px]",
                                tooltipText: "text-black"
                            }}
                            customPyramidIcon={
                                <IoTriangleSharp />
                            }
                            onClickEvent={() => copyWallet(walletData.address)}
                        >
                            <CopyIcon />
                        </CustomTooltip>
                    </span>}
                </td>
                <td className={`min-w-[12%] px-2 pl-4 py-2 flex items-center gap-2 ${isAssigned ? "text-white" : "text-darkRoom"}`}>
                    <KeyIcon width={19} height={19} /> {walletData.keyCount}
                </td>
                <td className={`min-w-[35%] px-4 py-2 text-elementalGrey flex items-center`}>
                    {!isAssigned && (
                        <div className="relative flex items-center gap-[5px] text-sunnySide">
                            <WarningIcon width={18} height={16} fill={"#F9CB14"} />
                            {statusMessage}
                        </div>
                    )}

                    {statusMessage === "Running, esXAI Will Accrue Every Few Days" && (
                        <div className="relative flex items-center gap-[5px] text-[18px] text-drunkenDragonFly">
                            <AiFillCheckCircle className="w-[18px] h-[16px] text-drunkenDragonFly" />
                            Running, esXAI Will Accrue Every Few Days
                        </div>
                    )}
                </td>
                <td
                    className="min-w-[25%] pl-4 py-2 text-right text-xl text-white flex items-center justify-end relative"
                    onClick={() => toggleRow(key)}
                >
                    {!isAssigned ? <a onClick={() => setDrawerState(DrawerView.Whitelist)}
                        className="text-[#F30919] cursor-pointer hover:text-white duration-200 ease-in underline ml-[5px] justify-end"
                    >
                        Assign
                    </a> : <>

                        <HiOutlineDotsVertical className="size-[25px] cursor-pointer hover:text-hornetSting duration-300" />

                        {isExpanded && (
                            <div key={`expanded-${key}`} className="z-[9999] absolute right-0 top-[40px] bg-dynamicBlack w-[350px] h-[60px] flex items-center pl-4 text-lg">
                                <p onClick={() => setDrawerState(DrawerView.Whitelist)} className="text-white cursor-pointer">{walletData.isPool ? "Unassign pool" : "Unassign wallet"}</p>
                            </div>
                        )}
                    </>}

                </td>
            </tr>
        );
    });

    return <>{rows}</>;
};