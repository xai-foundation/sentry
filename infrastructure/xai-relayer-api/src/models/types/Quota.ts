export type Quota = {
    balanceWei: string;
    nextRefillTimestamp: number;
    nextRefillAmountWei: string;
    lastRefillTimestamp: number;
}