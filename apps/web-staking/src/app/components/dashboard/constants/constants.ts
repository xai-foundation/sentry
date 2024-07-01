import { TierInfo } from "@/types/Pool";
import {
  BronzeTierRebrand,
  DiamondTierRebrand,
  GoldTierRebrand,
  PlatinumTierRebrand,
  SilverTierRebrand,
} from "../../icons/IconsComponent";
import BronzeTierFull from "../../icons/TierList/BronzeTierFull.png";
import SilverTierFull from "../../icons/TierList/SilverTierFull.png";
import GoldTierFull from "../../icons/TierList/GoldTierFull.png";
import PlatinumTierFull from "../../icons/TierList/PlatinumTierFull.png";
import DiamondTierFull from "../../icons/TierList/DiamondTierFull.png";

export const POOL_DATA_COLUMS = [
  "Tier",
  "esXAI staking requirement",
  "Reward success multiplier",
];

export type iconType = ({
  width,
  height,
}: {
  width?: number | undefined;
  height?: number | undefined;
  fill?: string | undefined;
}) => React.JSX.Element;


// TODO rename and move to actual constants
export const POOL_DATA_ROWS: Array<TierInfo & { icon?: iconType }> = [
  {
    tierName: "BRONZE TIER",
    nextTierName: "Silver Tier",
    tierBackgroundColor: "text-[#C36522]",
    icon: BronzeTierRebrand,
    iconText: "Bronze",
    requirement: "- staked esXAI",
    reward: "-",
    minValue: 9999999999,
    index: 0,
    label: BronzeTierFull,
  },
  {
    tierName: "SILVER TIER",
    nextTierName: "Gold Tier",
    tierBackgroundColor: "text-[#BBBBBB]",
    icon: SilverTierRebrand,
    iconText: "Silver",
    requirement: "- staked esXAI",
    reward: "-",
    minValue: 9999999999,
    index: 1,
    label: SilverTierFull,
  },
  {
    tierName: "GOLD TIER",
    nextTierName: "Platinum Tier",
    tierBackgroundColor: "text-[#FFBA18]",
    icon: GoldTierRebrand,
    iconText: "Gold",
    requirement: "- staked esXAI",
    reward: "-",
    minValue: 9999999999,
    index: 2,
    label: GoldTierFull,
  },
  {
    tierName: "PLATINUM TIER",
    nextTierName: "Diamond Tier",
    gradient: "bg-gradient-to-t from-[#5D6874] to-[#E3E3E3]",
    icon: PlatinumTierRebrand,
    iconText: "Platinum",
    requirement: "- staked esXAI",
    reward: "-",
    minValue: 9999999999,
    index: 3,
    label: PlatinumTierFull,
  },
  {
    tierName: "DIAMOND TIER",
    nextTierName: "",
    gradient: "bg-gradient-to-t from-[#99AAF8] to-[#8DFDF9]",
    icon: DiamondTierRebrand,
    iconText: "Diamond",
    requirement: "- staked esXAI",
    reward: "-",
    minValue: 9999999999,
    index: 4,
    label: DiamondTierFull,
  },
];

export const binanceLink =
  "https://www.binance.com/en/trade/XAI_USDT?_from=markets&type=spot";

export const learnMoreLink =
  "https://xai-foundation.gitbook.io/xai-network/xai-blockchain/welcome-to-xai";

export const learnMoreTiers =
  "https://xai-foundation.gitbook.io/xai-network/xai-blockchain/staking-explained/staking-rewards-and-tiers"
