import { BronzeTriangle, DiamondTriangle, GoldTriangle, PlatinumTriangle, SilverTriangle } from "../../icons/IconsComponent";

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


export type TierInfo = {
  tierName: string;
  nextTierName: string;
  tierBackgroundColor?: string;
  icon?: iconType;
  iconText?: string;
  requirement: string;
  gradient?: string;
  minValue: number;
  reward: string;
  index: number;
};

export enum TIER_VALUES {
  BRONZE = 0,
  SILVER = 1000,
  GOLD = 10000,
  PLATINUM = 100000,
  DIAMOND = 1000000
}

export const POOL_DATA_ROWS: TierInfo[] = [
  {
    tierName: "BRONZE TIER",
    nextTierName: "Silver Tier",
    tierBackgroundColor: "bg-[#C36522]",
    icon: BronzeTriangle,
    iconText: "Bronze",
    requirement: "0 staked esXAI",
    minValue: TIER_VALUES.BRONZE,
    reward: "1x",
    index: 0,
  },
  {
    tierName: "SILVER TIER",
    nextTierName: "Gold Tier",
    tierBackgroundColor: "bg-[#BBBBBB]",
    icon: SilverTriangle,
    iconText: "Silver",
    requirement: "1,000 staked esXAI",
    reward: "1.25x",
    minValue: TIER_VALUES.SILVER,
    index: 1,
  },
  {
    tierName: "GOLD TIER",
    nextTierName: "Platinum Tier",
    tierBackgroundColor: "bg-[#FFBA18]",
    icon: GoldTriangle,
    iconText: "Gold",
    requirement: "10,000 staked esXAI",
    reward: "1.5x",
    minValue: TIER_VALUES.GOLD,
    index: 2,
  },
  {
    tierName: "PLATINUM TIER",
    nextTierName: "Diamond Tier",
    gradient: "bg-gradient-to-t from-[#5D6874] to-[#E3E3E3]",
    icon: PlatinumTriangle,
    iconText: "Platinum",
    requirement: "100,000 staked esXAI",
    reward: "1.75x",
    minValue: TIER_VALUES.PLATINUM,
    index: 3,
  },
  {
    tierName: "DIAMOND TIER",
    nextTierName: "",
    gradient: "bg-gradient-to-t from-[#99AAF8] to-[#8DFDF9]",
    icon: DiamondTriangle,
    iconText: "Diamond",
    requirement: "1,000,000 staked esXAI",
    reward: "2x",
    minValue: TIER_VALUES.DIAMOND,
    index: 4,
  },
];

export const binanceLink =
  "https://www.binance.com/en/trade/XAI_USDT?_from=markets&type=spot";

export const learnMoreLink =
  "https://xai-foundation.gitbook.io/xai-network/xai-blockchain/welcome-to-xai";
