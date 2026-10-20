"use client";

import React, { useState } from "react";
import { PrimaryButton } from "@/app/components/ui";
import { formatCurrencyCompact, formatCurrencyNoDecimals } from "@/app/utils/formatCurrency";

export type Granularity = "daily" | "monthly";

export const SERIES_COLOR = "#FF0030";   // hornetSting
export const GRID_COLOR = "#433F3F";     // darkRoom
export const AXIS_COLOR = "#A19F9F";     // elementalGrey
export const SURFACE_COLOR = "#201C1C";  // dynamicBlack

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** YYYY-MM -> "Jan 2024" */
export const formatMonth = (month: string): string => {
  const [year, m] = month.split("-");
  return `${MONTH_NAMES[Number(m) - 1]} ${year}`;
};

/** YYYY-MM-DD -> "05 Dec 2023" */
export const formatDay = (day: string): string => {
  const [year, m, d] = day.split("-");
  return `${d} ${MONTH_NAMES[Number(m) - 1]} ${year}`;
};

export const formatPeriod = (period: string, granularity: Granularity): string =>
  granularity === "monthly" ? formatMonth(period) : formatDay(period);

/** Shared axis props so every stats chart looks the same. */
export const xAxisProps = {
  dataKey: "period",
  interval: "preserveStartEnd" as const,
  tickFormatter: formatMonth,
  tick: { fill: AXIS_COLOR, fontSize: 12 },
  axisLine: { stroke: GRID_COLOR },
  tickLine: false,
  minTickGap: 48,
};

export const yAxisProps = {
  tickFormatter: (v: number) => formatCurrencyCompact.format(v),
  tick: { fill: AXIS_COLOR, fontSize: 12 },
  axisLine: false,
  tickLine: false,
  width: 64,
};

export const StatTile = ({ label, value, unit }: { label: string; value: string; unit?: string }) => (
  <div>
    <span className="block text-lg font-medium text-elementalGrey">{label}</span>
    <span className="block text-white text-2xl font-semibold">
      {value}
      {unit && <span className="ml-1">{unit}</span>}
    </span>
  </div>
);

export const SectionHeader = ({ title, children }: { title: string; children?: React.ReactNode }) => (
  <div className="flex w-full flex-col items-start md:flex-row md:justify-between md:items-center py-[17px] md:px-[25px] px-[17px] bg-nulnOil/75 border-b-1 border-chromaphobicBlack shadow-default">
    <h3 className="md:text-3xl text-2xl text-white font-bold">{title}</h3>
    {children}
  </div>
);

export const StatsPageHeader = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="md:px-[25px] px-[17px] py-[24px]">
    <h1 className="text-white md:text-4xl text-3xl font-bold">{title}</h1>
    <p className="text-elementalGrey text-lg mt-2 max-w-[900px]">{children}</p>
  </div>
);

export const StatsPageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="flex w-full flex-col items-center lg:px-[36px] px-0 pb-16 lg:pt-[30px] pt-0">
    <div className="w-full max-w-[1400px]">{children}</div>
  </div>
);

export const ChartSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="w-full mb-8">
    <SectionHeader title={title} />
    <div className="w-full md:px-[25px] px-[8px] py-[17px] bg-dynamicBlack shadow-default">
      <div className="h-[320px] w-full">{children}</div>
    </div>
  </section>
);

export const TooltipBox = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-nulnOil border-1 border-chromaphobicBlack px-4 py-3 text-sm shadow-default">{children}</div>
);

export const Notice = ({ children, error }: { children: React.ReactNode; error?: boolean }) => (
  <div className={`mx-[17px] md:mx-0 mb-8 px-[25px] py-[17px] bg-nulnOil/75 border-1 shadow-default ${error ? "border-hornetSting text-white" : "border-chromaphobicBlack text-elementalGrey"}`}>
    {children}
  </div>
);

const toggleClass = (active: boolean) => `!font-semibold ${!active ? "!bg-[#272123] !hover:bg-[#272123] !text-americanSilver" : ""}`;

export const GranularityToggle = ({ value, onChange }: { value: Granularity; onChange: (g: Granularity) => void }) => (
  <div className="flex gap-0.5 p-1 bg-[#272123] global-clip-path">
    <PrimaryButton onClick={() => onChange("monthly")} btnText="Monthly" size="sm" className={toggleClass(value === "monthly")} />
    <PrimaryButton onClick={() => onChange("daily")} btnText="Daily" size="sm" className={toggleClass(value === "daily")} />
  </div>
);

export type NumbersColumn<T> = {
  header: string;
  /** Column key used in the CSV header */
  csvKey: string;
  value: (row: T) => number;
  /** Optional display override, defaults to a thousands separated integer */
  format?: (row: T) => string;
};

interface NumbersSectionProps<T extends { period: string }> {
  /** Rows for the selected granularity, oldest first */
  rows: T[];
  granularity: Granularity;
  onGranularityChange: (g: Granularity) => void;
  columns: NumbersColumn<T>[];
  /** File name without extension and granularity suffix */
  csvFileName: string;
  /** Optional indicator row rendered directly below the row of the given period (newest rows are listed first) */
  marker?: { period: string; label: string };
}

/**
 * The "numbers" table at the bottom of a stats page: monthly/daily toggle, newest row first, CSV download of the same rows.
 */
export function NumbersSection<T extends { period: string }>({ rows, granularity, onGranularityChange, columns, csvFileName, marker }: NumbersSectionProps<T>) {
  const periodHeader = granularity === "monthly" ? "Month" : "Day";

  const downloadCsv = () => {
    const header = [granularity === "monthly" ? "month" : "day", ...columns.map((c) => c.csvKey)].join(",");
    const lines = rows.map((r) => [r.period, ...columns.map((c) => String(c.value(r)))].join(","));
    const blob = new Blob([[header, ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${csvFileName}-${granularity}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="w-full mb-8">
      <SectionHeader title={granularity === "monthly" ? "Monthly numbers" : "Daily numbers"}>
        <div className="flex flex-wrap items-center gap-3 mt-3 md:mt-0">
          <GranularityToggle value={granularity} onChange={onGranularityChange} />
          <PrimaryButton onClick={downloadCsv} btnText="Download CSV" size="sm" className="!font-semibold" />
        </div>
      </SectionHeader>
      <div className="w-full bg-dynamicBlack shadow-default max-h-[480px] overflow-y-auto">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-nulnOil text-elementalGrey text-sm uppercase">
            <tr>
              <th className="py-3 md:px-[25px] px-[17px] font-medium">{periodHeader}</th>
              {columns.map((c, i) => (
                <th key={c.csvKey} className={`py-3 font-medium text-right ${i === columns.length - 1 ? "md:px-[25px] px-[17px]" : "px-4"}`}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-white">
            {[...rows].reverse().map((r) => (
              <React.Fragment key={r.period}>
                <tr className="border-t-1 border-chromaphobicBlack">
                  <td className="py-2 md:px-[25px] px-[17px] whitespace-nowrap">{formatPeriod(r.period, granularity)}</td>
                  {columns.map((c, i) => (
                    <td key={c.csvKey} className={`py-2 text-right ${i === columns.length - 1 ? "md:px-[25px] px-[17px]" : "px-4"}`}>
                      {c.format ? c.format(r) : formatCurrencyNoDecimals.format(c.value(r))}
                    </td>
                  ))}
                </tr>
                {marker && marker.period === r.period && (
                  <tr className="border-t-1 border-dashed border-pinkAndSleek">
                    <td colSpan={columns.length + 1} className="py-1.5 md:px-[25px] px-[17px] text-pinkAndSleek text-sm font-semibold">
                      {marker.label}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

/** Keeps the granularity of the numbers table in state; separate hook so pages stay small. */
export const useGranularity = (initial: Granularity = "monthly") => useState<Granularity>(initial);
