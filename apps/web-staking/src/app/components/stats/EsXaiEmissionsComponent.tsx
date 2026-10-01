"use client";

import React, { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { EsXaiEmissionData, EsXaiEmissionDay } from "@/server/services/Emissions.service";
import { formatCurrencyCompact, formatCurrencyNoDecimals } from "@/app/utils/formatCurrency";
import { PrimaryButton } from "@/app/components/ui";

type EmissionMonth = {
  /** YYYY-MM */
  month: string;
  allocatedEsXai: number;
  cumulativeEsXai: number;
  challengeCount: number;
};

const SERIES_COLOR = "#FF0030";   // hornetSting
const GRID_COLOR = "#433F3F";     // darkRoom
const AXIS_COLOR = "#A19F9F";     // elementalGrey
const SURFACE_COLOR = "#201C1C";  // dynamicBlack

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const formatMonth = (month: string): string => {
  const [year, m] = month.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${year}`;
};

const formatDay = (day: string): string => {
  const [year, m, d] = day.split("-");
  return `${d} ${MONTH_NAMES[Number(m) - 1]} ${year}`;
};

const buildMonthlySeries = (days: EsXaiEmissionDay[]): EmissionMonth[] => {
  const months: EmissionMonth[] = [];
  let cumulative = 0;

  for (const d of days) {
    const month = d.day.slice(0, 7);
    cumulative += d.allocatedEsXai;
    const last = months[months.length - 1];
    if (last && last.month === month) {
      last.allocatedEsXai += d.allocatedEsXai;
      last.challengeCount += d.challengeCount;
      last.cumulativeEsXai = cumulative;
    } else {
      months.push({ month, allocatedEsXai: d.allocatedEsXai, cumulativeEsXai: cumulative, challengeCount: d.challengeCount });
    }
  }
  return months;
};

const sumSince = (days: EsXaiEmissionDay[], sinceDay: string): number =>
  days.filter((d) => d.day >= sinceDay).reduce((acc, d) => acc + d.allocatedEsXai, 0);

const toCsv = (months: EmissionMonth[]): string => {
  const header = "month,allocated_esxai,cumulative_esxai,challenges";
  const rows = months.map((m) => `${m.month},${m.allocatedEsXai.toFixed(6)},${m.cumulativeEsXai.toFixed(6)},${m.challengeCount}`);
  return [header, ...rows].join("\n");
};

const ChartTooltip = ({ active, payload }: { active?: boolean; payload?: any[] }) => {
  if (!active || !payload || !payload.length) return null;
  const point: EmissionMonth = payload[0].payload;
  return (
    <div className="bg-nulnOil border-1 border-chromaphobicBlack px-4 py-3 text-sm shadow-default">
      <div className="text-elementalGrey mb-1">{formatMonth(point.month)}</div>
      <div className="text-white font-semibold">{formatCurrencyNoDecimals.format(point.allocatedEsXai)} esXAI allocated</div>
      <div className="text-americanSilver">{formatCurrencyNoDecimals.format(point.cumulativeEsXai)} esXAI cumulative</div>
      <div className="text-elementalGrey">{point.challengeCount} challenges</div>
    </div>
  );
};

const StatTile = ({ label, value, unit }: { label: string; value: string; unit?: string }) => (
  <div>
    <span className="block text-lg font-medium text-elementalGrey">{label}</span>
    <span className="block text-white text-2xl font-semibold">
      {value}
      {unit && <span className="ml-1">{unit}</span>}
    </span>
  </div>
);

const SectionHeader = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="flex w-full flex-col items-start md:flex-row md:justify-between md:items-center py-[17px] md:px-[25px] px-[17px] bg-nulnOil/75 border-b-1 border-chromaphobicBlack shadow-default">
    <h3 className="md:text-3xl text-2xl text-white font-bold">{title}</h3>
    {children}
  </div>
);

const axisProps = {
  x: { dataKey: "month", interval: "preserveStartEnd" as const, tickFormatter: formatMonth, tick: { fill: AXIS_COLOR, fontSize: 12 }, axisLine: { stroke: GRID_COLOR }, tickLine: false, minTickGap: 48 },
  y: { tickFormatter: (v: number) => formatCurrencyCompact.format(v), tick: { fill: AXIS_COLOR, fontSize: 12 }, axisLine: false, tickLine: false, width: 64 },
};

interface EsXaiEmissionsComponentProps {
  emissions: EsXaiEmissionData;
  loadError: boolean;
}

export const EsXaiEmissionsComponent = ({ emissions, loadError }: EsXaiEmissionsComponentProps) => {
  const { days, lastUpdated } = emissions;
  const months = useMemo(() => buildMonthlySeries(days), [days]);
  const hasData = days.length > 0;

  const totalAllocated = hasData ? months[months.length - 1].cumulativeEsXai : 0;
  const totalChallenges = days.reduce((acc, d) => acc + d.challengeCount, 0);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const last30Days = sumSince(days, thirtyDaysAgo);

  const downloadCsv = () => {
    const blob = new Blob([toCsv(months)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "xai-esxai-emissions-monthly.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex w-full flex-col items-center lg:px-[36px] px-0 pb-16 lg:pt-[30px] pt-0">
      <div className="w-full max-w-[1400px]">
        <div className="md:px-[25px] px-[17px] py-[24px]">
          <h1 className="text-white md:text-4xl text-3xl font-bold">esXAI emissions</h1>
          <p className="text-elementalGrey text-lg mt-2 max-w-[900px]">
            esXAI allocated to Sentry Key holders and staking pools by Referee challenges, aggregated per month
            (UTC) of the challenge. Circulating supply figures in the Xai documentation exclude these emissions.
          </p>
        </div>

        <section className="w-full mb-8">
          <SectionHeader title="Overview" />
          <div className="flex w-full md:gap-x-20 gap-x-10 gap-y-5 items-center md:px-[25px] px-[17px] flex-wrap py-[17px] bg-dynamicBlack shadow-default">
            <StatTile label="Total esXAI allocated" value={formatCurrencyNoDecimals.format(totalAllocated)} unit="esXAI" />
            <StatTile label="Last 30 days" value={formatCurrencyNoDecimals.format(last30Days)} unit="esXAI" />
            <StatTile label="Challenges" value={formatCurrencyNoDecimals.format(totalChallenges)} />
            <StatTile label="Since" value={hasData ? formatDay(days[0].day) : "-"} />
          </div>
        </section>

        {loadError && (
          <div className="mx-[17px] md:mx-0 mb-8 px-[25px] py-[17px] bg-nulnOil/75 border-1 border-hornetSting text-white shadow-default">
            The emission data could not be loaded. Please try again later.
          </div>
        )}

        {!loadError && !hasData && (
          <div className="mx-[17px] md:mx-0 mb-8 px-[25px] py-[17px] bg-nulnOil/75 border-1 border-chromaphobicBlack text-elementalGrey shadow-default">
            No emission data has been synced yet.
          </div>
        )}

        {hasData && (
          <>
            <section className="w-full mb-8">
              <SectionHeader title="esXAI allocated per month" />
              <div className="w-full md:px-[25px] px-[8px] py-[17px] bg-dynamicBlack shadow-default">
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={months} margin={{ top: 8, right: 24, left: 0, bottom: 0 }} barCategoryGap="20%">
                      <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray="3 3" />
                      <XAxis {...axisProps.x} />
                      <YAxis {...axisProps.y} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: "#ffffff", fillOpacity: 0.06 }} />
                      <Bar dataKey="allocatedEsXai" name="esXAI allocated" fill={SERIES_COLOR} radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={false} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="w-full mb-8">
              <SectionHeader title="Cumulative esXAI allocated" />
              <div className="w-full md:px-[25px] px-[8px] py-[17px] bg-dynamicBlack shadow-default">
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={months} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke={GRID_COLOR} strokeDasharray="3 3" />
                      <XAxis {...axisProps.x} />
                      <YAxis {...axisProps.y} />
                      <Tooltip content={<ChartTooltip />} cursor={{ stroke: AXIS_COLOR, strokeDasharray: "3 3" }} />
                      <Line type="monotone" dataKey="cumulativeEsXai" name="Cumulative esXAI allocated" stroke={SERIES_COLOR} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: SURFACE_COLOR, strokeWidth: 2 }} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </section>

            <section className="w-full mb-8">
              <SectionHeader title="Monthly numbers">
                <div className="mt-3 md:mt-0">
                  <PrimaryButton onClick={downloadCsv} btnText="Download CSV" size="sm" className="!font-semibold" />
                </div>
              </SectionHeader>
              <div className="w-full bg-dynamicBlack shadow-default max-h-[480px] overflow-y-auto">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-nulnOil text-elementalGrey text-sm uppercase">
                    <tr>
                      <th className="py-3 md:px-[25px] px-[17px] font-medium">Month</th>
                      <th className="py-3 px-4 font-medium text-right">esXAI allocated</th>
                      <th className="py-3 px-4 font-medium text-right">Cumulative</th>
                      <th className="py-3 md:px-[25px] px-[17px] font-medium text-right">Challenges</th>
                    </tr>
                  </thead>
                  <tbody className="text-white">
                    {[...months].reverse().map((m) => (
                      <tr key={m.month} className="border-t-1 border-chromaphobicBlack">
                        <td className="py-2 md:px-[25px] px-[17px] whitespace-nowrap">{formatMonth(m.month)}</td>
                        <td className="py-2 px-4 text-right">{formatCurrencyNoDecimals.format(m.allocatedEsXai)}</td>
                        <td className="py-2 px-4 text-right">{formatCurrencyNoDecimals.format(m.cumulativeEsXai)}</td>
                        <td className="py-2 md:px-[25px] px-[17px] text-right">{m.challengeCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        <p className="text-elementalGrey text-sm md:px-[25px] px-[17px]">
          Source: Referee challenges indexed by the Xai subgraph (reward amount for claimers per challenge). The XAI minted
          for the gas subsidy is not included. The current month is still accumulating.
          {lastUpdated && ` Last updated ${new Date(lastUpdated).toUTCString()}.`}
        </p>
      </div>
    </div>
  );
};
