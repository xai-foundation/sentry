"use client";

import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { SentryKeySaleData, SentryKeySaleDay } from "@/server/services/KeySales.service";
import { formatCurrencyNoDecimals } from "@/app/utils/formatCurrency";
import {
  AXIS_COLOR, ChartSection, formatDay, formatMonth, formatPeriod, Granularity, GRID_COLOR, Notice, NumbersSection, SectionHeader,
  SERIES_COLOR, StatsPageHeader, StatsPageWrapper, StatTile, SURFACE_COLOR, TooltipBox, useGranularity, xAxisProps, yAxisProps,
} from "./shared";

type SalesPoint = { period: string; soldKeys: number; cumulativeKeys: number };
/** Cumulative series in pre-split key units: sales after the split are divided by the split factor so the line has no jump. */
type CumulativePoint = { period: string; cumulativeKeys: number };

const SPLIT_LINE_COLOR = "#FFC3C7"; // pinkAndSleek

/**
 * Keys sold per period in the key units of that period. The running total is multiplied by the split factor on the
 * split day, so the cumulative line shows the jump from old keys to today's keys instead of rescaling history.
 */
const toSeries = (days: SentryKeySaleDay[], granularity: Granularity, splitDay: string | null, keyMultiplier: number): SalesPoint[] => {
  const points: SalesPoint[] = [];
  let cumulative = 0;

  for (const d of days) {
    if (splitDay && d.day === splitDay) {
      cumulative *= keyMultiplier;
    }
    cumulative += d.soldKeys;
    const period = granularity === "monthly" ? d.day.slice(0, 7) : d.day;
    const last = points[points.length - 1];
    if (last && last.period === period) {
      last.soldKeys += d.soldKeys;
      last.cumulativeKeys = cumulative;
    } else {
      points.push({ period, soldKeys: d.soldKeys, cumulativeKeys: cumulative });
    }
  }
  return points;
};

/** YYYY-MM of the month before the given one. */
const previousMonth = (month: string): string => {
  const [year, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(year, m - 2, 1));
  return d.toISOString().slice(0, 7);
};

const toCumulativeSeries = (days: SentryKeySaleDay[], keyMultiplier: number): CumulativePoint[] => {
  if (!days.length) return [];
  // Start one month before the first sale at zero so the line visibly begins at the origin.
  const points: CumulativePoint[] = [{ period: previousMonth(days[0].day.slice(0, 7)), cumulativeKeys: 0 }];
  let cumulative = 0;

  for (const d of days) {
    cumulative += d.keyMultiplier === 1 && keyMultiplier > 1 ? d.soldKeys / keyMultiplier : d.soldKeys;
    const period = d.day.slice(0, 7);
    const last = points[points.length - 1];
    if (last.period === period) {
      last.cumulativeKeys = cumulative;
    } else {
      points.push({ period, cumulativeKeys: cumulative });
    }
  }
  return points;
};

const formatKeys = new Intl.NumberFormat("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

const CumulativeTooltip = ({ active, payload, keyMultiplier }: { active?: boolean; payload?: any[]; keyMultiplier: number }) => {
  if (!active || !payload || !payload.length) return null;
  const point: CumulativePoint = payload[0].payload;
  return (
    <TooltipBox>
      <div className="text-elementalGrey mb-1">{formatMonth(point.period)}</div>
      <div className="text-white font-semibold">{formatKeys.format(point.cumulativeKeys)} keys cumulative{keyMultiplier > 1 && " (pre-split units)"}</div>
    </TooltipBox>
  );
};

const ChartTooltip = ({ active, payload, granularity }: { active?: boolean; payload?: any[]; granularity: Granularity }) => {
  if (!active || !payload || !payload.length) return null;
  const point: SalesPoint = payload[0].payload;
  return (
    <TooltipBox>
      <div className="text-elementalGrey mb-1">{formatPeriod(point.period, granularity)}</div>
      <div className="text-white font-semibold">{formatCurrencyNoDecimals.format(point.soldKeys)} keys sold</div>
      <div className="text-americanSilver">{formatCurrencyNoDecimals.format(point.cumulativeKeys)} keys cumulative</div>
    </TooltipBox>
  );
};

interface KeySalesComponentProps {
  sales: SentryKeySaleData;
  loadError: boolean;
}

export const KeySalesComponent = ({ sales, loadError }: KeySalesComponentProps) => {
  const { days, splitDay, keyMultiplier, lastUpdated } = sales;
  const [tableGranularity, setTableGranularity] = useGranularity("monthly");

  const hasSplit = splitDay !== null && keyMultiplier > 1;
  const months = useMemo(() => toSeries(days, "monthly", splitDay, keyMultiplier), [days, splitDay, keyMultiplier]);
  const cumulativeMonths = useMemo(() => toCumulativeSeries(days, keyMultiplier), [days, keyMultiplier]);
  const tableRows = useMemo(
    () => (tableGranularity === "monthly" ? months : toSeries(days, "daily", splitDay, keyMultiplier)),
    [days, months, tableGranularity, splitDay, keyMultiplier]
  );
  const hasData = days.length > 0;

  const totalSold = hasData ? months[months.length - 1].cumulativeKeys : 0;
  const preSplitSold = days.filter((d) => d.keyMultiplier > 1).reduce((acc, d) => acc + d.soldKeys, 0);
  const postSplitSold = days.filter((d) => d.keyMultiplier === 1).reduce((acc, d) => acc + d.soldKeys, 0);
  const splitMonth = splitDay ? splitDay.slice(0, 7) : null;

  const splitLine = (label: string) => hasSplit && splitMonth ? (
    <ReferenceLine x={splitMonth} stroke={SPLIT_LINE_COLOR} strokeDasharray="4 4" label={{ value: label, position: "insideTopLeft", fill: SPLIT_LINE_COLOR, fontSize: 12 }} />
  ) : null;

  return (
    <StatsPageWrapper>
      <StatsPageHeader title="Sentry Key sales">
        Sentry Keys sold per month (UTC), counted from NodeLicense mints. Keys minted by the tiny keys airdrop are not sales
        and are excluded.
        {hasSplit && splitDay && ` Keys completed a 1:${keyMultiplier} split starting ${formatDay(splitDay)}: every key became ${keyMultiplier} keys. Monthly sales and the table are in the key units of their time; the cumulative line is in pre-split units, with sales after the split divided by ${keyMultiplier}.`}
      </StatsPageHeader>

      <section className="w-full mb-8">
        <SectionHeader title="Overview" />
        <div className="flex w-full md:gap-x-20 gap-x-10 gap-y-5 items-center md:px-[25px] px-[17px] flex-wrap py-[17px] bg-dynamicBlack shadow-default">
          <StatTile label="Total keys sold" value={formatCurrencyNoDecimals.format(totalSold)} unit="keys" />
          {hasSplit && <StatTile label="Sold before the split" value={formatCurrencyNoDecimals.format(preSplitSold)} unit="keys" />}
          {hasSplit && <StatTile label="Sold since the split" value={formatCurrencyNoDecimals.format(postSplitSold)} unit="keys" />}
          <StatTile label="Since" value={hasData ? formatDay(days[0].day) : "-"} />
        </div>
      </section>

      {loadError && <Notice error>The key sale data could not be loaded. Please try again later.</Notice>}
      {!loadError && !hasData && <Notice>No key sale data has been synced yet.</Notice>}

      {hasData && (
        <>
          <ChartSection title="Keys sold per month">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months} margin={{ top: 8, right: 24, left: 0, bottom: 0 }} barCategoryGap="20%">
                <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray="3 3" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<ChartTooltip granularity="monthly" />} cursor={{ fill: "#ffffff", fillOpacity: 0.06 }} />
                {splitLine(`1:${keyMultiplier} key split (x${keyMultiplier})`)}
                <Bar dataKey="soldKeys" name="Keys sold" fill={SERIES_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </ChartSection>

          <ChartSection title={hasSplit ? "Cumulative keys sold (pre-split units)" : "Cumulative keys sold"}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeMonths} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray="3 3" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<CumulativeTooltip keyMultiplier={keyMultiplier} />} cursor={{ stroke: AXIS_COLOR, strokeDasharray: "3 3" }} />
                {splitLine(`1:${keyMultiplier} key split (sales after it /${keyMultiplier})`)}
                <Line type="monotone" dataKey="cumulativeKeys" name="Cumulative keys sold" stroke={SERIES_COLOR} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: SURFACE_COLOR, strokeWidth: 2 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartSection>

          <NumbersSection
            rows={tableRows}
            granularity={tableGranularity}
            onGranularityChange={setTableGranularity}
            csvFileName="xai-sentry-key-sales"
            marker={hasSplit && splitDay && splitMonth ? { period: tableGranularity === "monthly" ? splitMonth : splitDay, label: `1:${keyMultiplier} key split (x${keyMultiplier})` } : undefined}
            columns={[
              { header: "Keys sold", csvKey: "keys_sold", value: (r) => r.soldKeys },
              { header: "Cumulative", csvKey: "cumulative_keys", value: (r) => r.cumulativeKeys },
            ]}
          />
        </>
      )}

      <p className="text-elementalGrey text-sm md:px-[25px] px-[17px]">
        Source: NodeLicense mints indexed by the Xai subgraph, excluding the keys minted by the tiny keys airdrop
        {hasSplit && splitMonth && ` in ${formatMonth(splitMonth)}`}. The current period is still accumulating.
        {lastUpdated && ` Last updated ${new Date(lastUpdated).toUTCString()}.`}
      </p>
    </StatsPageWrapper>
  );
};
