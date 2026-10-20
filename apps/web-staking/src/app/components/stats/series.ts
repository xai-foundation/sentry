import { Granularity } from "./shared";

/**
 * Aggregates daily rows into daily or monthly periods. `sum` lists the numeric fields to add up and
 * `cumulative` maps a summed field to the name of its running total. The caller names the resulting row type.
 */
export function buildSeries<R extends { period: string }>(
  days: Array<{ day: string } & Record<string, unknown>>,
  granularity: Granularity,
  sum: string[],
  cumulative: Record<string, string> = {}
): R[] {
  const points: Array<Record<string, number | string>> = [];
  const running: Record<string, number> = {};

  for (const d of days) {
    const period = granularity === "monthly" ? d.day.slice(0, 7) : d.day;
    let last = points[points.length - 1];
    if (!last || last.period !== period) {
      last = { period };
      for (const k of sum) last[k] = 0;
      points.push(last);
    }
    for (const k of sum) {
      const value = Number(d[k]);
      last[k] = (last[k] as number) + value;
      const cumKey = cumulative[k];
      if (cumKey) {
        running[cumKey] = (running[cumKey] || 0) + value;
        last[cumKey] = running[cumKey];
      }
    }
  }
  return points as unknown as R[];
}

export const sumSince = <T extends { day: string }>(days: T[], sinceDay: string, pick: (d: T) => number): number =>
  days.filter((d) => d.day >= sinceDay).reduce((acc, d) => acc + pick(d), 0);

export const thirtyDaysAgo = (): string => new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
