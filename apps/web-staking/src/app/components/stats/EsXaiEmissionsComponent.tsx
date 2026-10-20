"use client";

import React, { useMemo } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { EsXaiEmissionData } from "@/server/services/Emissions.service";
import { formatCurrencyNoDecimals } from "@/app/utils/formatCurrency";
import {
  AXIS_COLOR, ChartSection, formatDay, formatPeriod, Granularity, GRID_COLOR, Notice, NumbersSection, SectionHeader,
  SERIES_COLOR, StatsPageHeader, StatsPageWrapper, StatTile, SURFACE_COLOR, TooltipBox, useGranularity, xAxisProps, yAxisProps,
} from "./shared";
import { buildSeries, sumSince, thirtyDaysAgo } from "./series";

type EmissionPoint = { period: string; allocatedEsXai: number; cumulativeEsXai: number; challengeCount: number };

const toSeries = (days: EsXaiEmissionData["days"], granularity: Granularity): EmissionPoint[] =>
  buildSeries<EmissionPoint>(days, granularity, ["allocatedEsXai", "challengeCount"], { allocatedEsXai: "cumulativeEsXai" });

const ChartTooltip = ({ active, payload, granularity }: { active?: boolean; payload?: any[]; granularity: Granularity }) => {
  if (!active || !payload || !payload.length) return null;
  const point: EmissionPoint = payload[0].payload;
  return (
    <TooltipBox>
      <div className="text-elementalGrey mb-1">{formatPeriod(point.period, granularity)}</div>
      <div className="text-white font-semibold">{formatCurrencyNoDecimals.format(point.allocatedEsXai)} esXAI allocated</div>
      <div className="text-americanSilver">{formatCurrencyNoDecimals.format(point.cumulativeEsXai)} esXAI cumulative</div>
      <div className="text-elementalGrey">{point.challengeCount} challenges</div>
    </TooltipBox>
  );
};

interface EsXaiEmissionsComponentProps {
  emissions: EsXaiEmissionData;
  loadError: boolean;
}

export const EsXaiEmissionsComponent = ({ emissions, loadError }: EsXaiEmissionsComponentProps) => {
  const { days, lastUpdated } = emissions;
  const [tableGranularity, setTableGranularity] = useGranularity("monthly");

  const months = useMemo(() => toSeries(days, "monthly"), [days]);
  const tableRows = useMemo(() => (tableGranularity === "monthly" ? months : toSeries(days, "daily")), [days, months, tableGranularity]);
  const hasData = days.length > 0;

  const totalAllocated = hasData ? months[months.length - 1].cumulativeEsXai : 0;
  const totalChallenges = days.reduce((acc, d) => acc + d.challengeCount, 0);
  const last30Days = sumSince(days, thirtyDaysAgo(), (d) => d.allocatedEsXai);

  return (
    <StatsPageWrapper>
      <StatsPageHeader title="esXAI emissions">
        esXAI allocated to Sentry Key holders and staking pools by Referee challenges, aggregated per month (UTC) of the
        challenge. Circulating supply figures in the Xai documentation exclude these emissions.
      </StatsPageHeader>

      <section className="w-full mb-8">
        <SectionHeader title="Overview" />
        <div className="flex w-full md:gap-x-20 gap-x-10 gap-y-5 items-center md:px-[25px] px-[17px] flex-wrap py-[17px] bg-dynamicBlack shadow-default">
          <StatTile label="Total esXAI allocated" value={formatCurrencyNoDecimals.format(totalAllocated)} unit="esXAI" />
          <StatTile label="Last 30 days" value={formatCurrencyNoDecimals.format(last30Days)} unit="esXAI" />
          <StatTile label="Challenges" value={formatCurrencyNoDecimals.format(totalChallenges)} />
          <StatTile label="Since" value={hasData ? formatDay(days[0].day) : "-"} />
        </div>
      </section>

      {loadError && <Notice error>The emission data could not be loaded. Please try again later.</Notice>}
      {!loadError && !hasData && <Notice>No emission data has been synced yet.</Notice>}

      {hasData && (
        <>
          <ChartSection title="esXAI allocated per month">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={months} margin={{ top: 8, right: 24, left: 0, bottom: 0 }} barCategoryGap="20%">
                <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray="3 3" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<ChartTooltip granularity="monthly" />} cursor={{ fill: "#ffffff", fillOpacity: 0.06 }} />
                <Bar dataKey="allocatedEsXai" name="esXAI allocated" fill={SERIES_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false} />
              </BarChart>
            </ResponsiveContainer>
          </ChartSection>

          <ChartSection title="Cumulative esXAI allocated">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={months} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray="3 3" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip content={<ChartTooltip granularity="monthly" />} cursor={{ stroke: AXIS_COLOR, strokeDasharray: "3 3" }} />
                <Line type="monotone" dataKey="cumulativeEsXai" name="Cumulative esXAI allocated" stroke={SERIES_COLOR} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: SURFACE_COLOR, strokeWidth: 2 }} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartSection>

          <NumbersSection
            rows={tableRows}
            granularity={tableGranularity}
            onGranularityChange={setTableGranularity}
            csvFileName="xai-esxai-emissions"
            columns={[
              { header: "esXAI allocated", csvKey: "allocated_esxai", value: (r) => r.allocatedEsXai },
              { header: "Cumulative", csvKey: "cumulative_esxai", value: (r) => r.cumulativeEsXai },
              { header: "Challenges", csvKey: "challenges", value: (r) => r.challengeCount },
            ]}
          />
        </>
      )}

      <p className="text-elementalGrey text-sm md:px-[25px] px-[17px]">
        Source: Referee challenges indexed by the Xai subgraph (reward amount for claimers per challenge). The XAI minted
        for the gas subsidy is not included. The current period is still accumulating.
        {lastUpdated && ` Last updated ${new Date(lastUpdated).toUTCString()}.`}
      </p>
    </StatsPageWrapper>
  );
};
