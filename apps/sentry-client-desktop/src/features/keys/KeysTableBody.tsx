import { useEffect, useState } from "react";
import { BulkOwnerOrPool } from "@sentry/core";
import { CopyIcon, DefaultPollIcon, KeyIcon, Wallet, WarningIcon } from "@sentry/ui/dist/src/rebrand/icons/IconsComponents";
import { AiFillCheckCircle } from "react-icons/ai";
import { HiOutlineDotsVertical } from "react-icons/hi";
import CustomTooltip from "@sentry/ui/dist/src/rebrand/tooltip/Tooltip";
import { IoTriangleSharp } from "react-icons/io5";
import { useOperatorRuntime } from "@/hooks/useOperatorRuntime";
import { ethers } from "ethers";
import { WalletAssignedMap } from "./Keys";


interface TableBodyProps {
    operatorWalletData: BulkOwnerOrPool[];
    isWalletAssignedMap: WalletAssignedMap;
    startAssignment: (wallet: string) => void
    onRemoveWallet: (wallet: string) => void
}

export const KeysTableBody = ({ operatorWalletData, isWalletAssignedMap, onRemoveWallet, startAssignment }: TableBodyProps) => {
    const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
    const [copiedWallet, setCopiedWallet] = useState("");
    const { sentryRunning } = useOperatorRuntime();

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

    const toggleRemoveWallet = (key: string) => {
        setExpandedRows((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    if (operatorWalletData.length === 0) {
        return (
            <tr className="bg-nulnOil flex px-8 text-lg text-elementalGrey">
                <td colSpan={5} className="w-full text-center">
                    No keys or pools found.
                </td>
            </tr>
        );
    }

    const WalletOrPoolImage = (item: BulkOwnerOrPool) => {
        return item.isPool ? (
            item.logoUri ? (
                <img src={item.logoUri} className="w-[30px] h-[30px] rounded-full object-cover" />
            ) : (
                <DefaultPollIcon />
            )
        ) : (
            <Wallet extraClasses="fill-[#A19F9F] mx-[5px]" />
        );
    };

    const rows = operatorWalletData.map((poolOrWallet: BulkOwnerOrPool) => {

        const key = poolOrWallet.address;

        const isExpanded = expandedRows[key];

        return (
            <tr className="bg-nulnOil flex pl-6 text-lg border-b border-chromaphobicBlack" key={`license-${key}`}>
                <td className={`min-w-[26%] max-w-[25%] pr-2 text-white py-2 flex gap-2 items-center text-[18px]`}>
                    {WalletOrPoolImage(poolOrWallet)}
                    {poolOrWallet.isPool ? poolOrWallet.name : `${poolOrWallet.address.slice(0, 6)}...${poolOrWallet.address.slice(-6)}`}
                    {!poolOrWallet.isPool && <span className="cursor-pointer" onClick={() => copyWallet(poolOrWallet.address)}>
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
                            onClickEvent={() => copyWallet(poolOrWallet.address)}
                        >
                            <CopyIcon />
                        </CustomTooltip>
                    </span>}
                </td>
                <td className="min-w-[15%] px-2 py-2 flex items-center gap-2 text-white">
                    <KeyIcon width={19} height={19} /> {poolOrWallet.keyCount}
                </td>
                <td className="min-w-[27%] px-2 py-2 text-elementalGrey flex items-center">
                    {((isWalletAssignedMap[key] || poolOrWallet.isPool) && sentryRunning) && (
                        <div className="relative flex items-center gap-[5px] text-[18px] text-drunkenDragonFly">
                            <AiFillCheckCircle className="w-[18px] h-[16px] text-drunkenDragonFly" />
                            Claiming rewards
                        </div>
                    )}
                    {(!isWalletAssignedMap[key] && !poolOrWallet.isPool) && <div className="relative flex items-center gap-[7px] font-bold text-bananaBoat">
                        <WarningIcon width={18} height={16} />
                        Wallet not assigned
                        <a
                            onClick={() => startAssignment(poolOrWallet.address)}
                            className="text-[#F30919] cursor-pointer hover:text-white duration-200 ease-in"
                        >
                            Assign
                        </a>
                    </div>}
                </td>
                <td className="min-w-[25%] pl-4 pr-2 py-2 text-right text-xl text-white flex flex-col justify-center">
                    <p>{new Intl.NumberFormat('en').format(Number(ethers.formatEther(poolOrWallet.totalAccruedAssertionRewards || "0")))} esXAI</p>
                </td>
                {!poolOrWallet.isPool && (
                    <td
                        className="min-w-[5%] pl-4 py-2 text-right text-xl text-white flex items-center justify-end relative"
                        onClick={() => toggleRemoveWallet(key)}
                    >
                        <HiOutlineDotsVertical className="size-[25px] cursor-pointer hover:text-hornetSting duration-300" />
                        {isExpanded && (
                            <div key={`expanded-${key}`} className="z-[9999] absolute right-0 top-[40px] bg-dynamicBlack w-[350px] h-[60px] flex items-center pl-4 text-lg">
                                <p onClick={() => onRemoveWallet(poolOrWallet.address)} className="text-white cursor-pointer">Remove wallet</p>
                            </div>
                        )}
                    </td>
                )}
            </tr>
        );
    });

    return <tbody className="relative">{rows}</tbody>;
};