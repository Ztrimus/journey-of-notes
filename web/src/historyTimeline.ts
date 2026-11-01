import type { SessionRecord } from "./history.ts";

export function groupHistoryDays(records: SessionRecord[]) {
  const groups = new Map<string, { date: Date; records: SessionRecord[] }>();
  for (const record of records) {
    const date = new Date(record.startedAt);
    // Group by the visitor's local calendar day, not UTC midnight.
    const key = [date.getFullYear(), date.getMonth(), date.getDate()].join("-");
    const group = groups.get(key);
    if (group) group.records.push(record);
    else groups.set(key, { date, records: [record] });
  }
  return [...groups.entries()].map(([key, group]) => ({ key, ...group }));
}
