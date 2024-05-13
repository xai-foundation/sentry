import { TierInfo } from "@/types/Pool";
import {
  BronzeTriangle,
  DiamondTriangle,
  GoldTriangle,
  PlatinumTriangle,
  SilverTriangle,
} from "../../icons/IconsComponent";

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

//TODO don't initialize with hardcoded values, don't show the tier if the values don't load or show the database
export enum TIER_VALUES {
  BRONZE = 0,
  SILVER = 10000,
  GOLD = 100000,
  PLATINUM = 500000,
  DIAMOND = 5500000
}

// TODO rename and move to actual constants
export const POOL_DATA_ROWS: Array<TierInfo & { icon?: iconType }> = [
  {
    tierName: "BRONZE TIER",
    nextTierName: "Silver Tier",
    tierBackgroundColor: "text-[#C36522]",
    icon: BronzeTriangle,
    iconText: "Bronze",
    requirement: "- staked esXAI",
    reward: "-",
    minValue: TIER_VALUES.BRONZE,
    index: 0,
  },
  {
    tierName: "SILVER TIER",
    nextTierName: "Gold Tier",
    tierBackgroundColor: "text-[#BBBBBB]",
    icon: SilverTriangle,
    iconText: "Silver",
    requirement: "- staked esXAI",
    reward: "-",
    minValue: TIER_VALUES.SILVER,
    index: 1,
  },
  {
    tierName: "GOLD TIER",
    nextTierName: "Platinum Tier",
    tierBackgroundColor: "text-[#FFBA18]",
    icon: GoldTriangle,
    iconText: "Gold",
    requirement: "- staked esXAI",
    reward: "-",
    minValue: TIER_VALUES.GOLD,
    index: 2,
  },
  {
    tierName: "PLATINUM TIER",
    nextTierName: "Diamond Tier",
    gradient: "bg-gradient-to-t from-[#5D6874] to-[#E3E3E3]",
    icon: PlatinumTriangle,
    iconText: "Platinum",
    requirement: "- staked esXAI",
    reward: "-",
    minValue: TIER_VALUES.PLATINUM,
    index: 3,
  },
  {
    tierName: "DIAMOND TIER",
    nextTierName: "",
    gradient: "bg-gradient-to-t from-[#99AAF8] to-[#8DFDF9]",
    icon: DiamondTriangle,
    iconText: "Diamond",
    requirement: "- staked esXAI",
    reward: "-",
    minValue: TIER_VALUES.DIAMOND,
    index: 4,
  },
];

export const binanceLink =
  "https://www.binance.com/en/trade/XAI_USDT?_from=markets&type=spot";

export const learnMoreLink =
  "https://xai-foundation.gitbook.io/xai-network/xai-blockchain/welcome-to-xai";
