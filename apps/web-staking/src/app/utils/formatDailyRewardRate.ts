

export const formatDailyRewardRate = (dailyRewardRate: number | undefined, decimals: number): number => {
    if(dailyRewardRate === undefined) return 0;
    const annualRate = (dailyRewardRate * 365);
    return Number(annualRate.toFixed(decimals));
}
export const formatDailyRewardRatePercentage = (dailyRewardRate: number| undefined, decimals: number): number => {
    if(dailyRewardRate === undefined) return 0;
    const annualRate = (dailyRewardRate * 365) * 100;
    return Number(annualRate.toFixed(decimals));
}