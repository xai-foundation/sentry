export const POOL_DATA_COLUMS = [
  "Tier",
  "esXAI staking requirement",
  "Reward success multiplier",
];

export type TierInfo = {
  tierName: string,
  nextTierName: string,
  tierBackgroundColor?: string,
  requirment: string,
  gradient?: string,
  minValue: number,
  maxValue: number,
  reward: string,
}

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
    requirment: "0 staked esXAI",
    minValue: TIER_VALUES.BRONZE,
    maxValue: TIER_VALUES.SILVER - 1,
    reward: "1x",
  },
  {
    tierName: "SILVER TIER",
    nextTierName: "Gold Tier",
    tierBackgroundColor: "bg-[#BBBBBB]",
    requirment: "1,000 staked esXAI",
    reward: "2x",
    minValue: TIER_VALUES.SILVER,
    maxValue: TIER_VALUES.GOLD - 1,
  },
  {
    tierName: "GOLD TIER",
    nextTierName: "Platinum Tier",
    tierBackgroundColor: "bg-[#FFBA18]",
    requirment: "10,000 staked esXAI",
    reward: "4x",
    minValue: TIER_VALUES.GOLD,
    maxValue: TIER_VALUES.PLATINUM - 1,
  },
  {
    tierName: "PLATINUM TIER",
    nextTierName: "Diamond Tier",
    gradient: "bg-gradient-to-t from-[#5D6874] to-[#E3E3E3]",
    requirment: "100,000 staked esXAI",
    reward: "8x",
    minValue: TIER_VALUES.PLATINUM,
    maxValue: TIER_VALUES.DIAMOND - 1,
  },
  {
    tierName: "DIAMOND TIER",
    nextTierName: "",
    gradient: "bg-gradient-to-t from-[#99AAF8] to-[#8DFDF9]",
    requirment: "1,000,000 staked esXAI",
    reward: "16x",
    minValue: TIER_VALUES.DIAMOND,
    maxValue: Math.max(),
  },
];

export const binanceLink =
  "https://www.binance.com/en/trade/XAI_USDT?_from=markets&type=spot";

export const learnMoreLink =
  "https://xai-foundation.gitbook.io/xai-network/xai-blockchain/welcome-to-xai";
