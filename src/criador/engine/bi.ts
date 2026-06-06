// Client-side BI/KPI computation. Output drives both the in-browser preview
// (Recharts) and the "Resumo" sheet embedded in the .xlsx.
import type { XlsxColumn } from "../xlsx";

export type Fmt = "num" | "money" | "pct";

export interface BiOpts {
  dimension?: string;
  measure?: string;
  date?: string;
}

export interface BiResult {
  measure: string;
  dimension?: string;
  fmt: Fmt;
  kpis: { label: string; value: number; fmt: Fmt }[];
  groupBy?: { name: string; value: number }[];
  timeSeries?: { name: string; value: number }[];
}

const monthKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;

export function autoPickBiOpts(columns: XlsxColumn[]): BiOpts {
  const measureCol = columns.find((c) => c.type === "moeda")
    ?? columns.find((c) => c.type === "numero")
    ?? columns.find((c) => c.type === "percentual");
  const dimCol = columns.find((c) => c.type === "lista")
    ?? columns.find((c) => c.type === "texto");
  const dateCol = columns.find((c) => c.type === "data");
  return {
    measure: measureCol?.header,
    dimension: dimCol?.header,
    date: dateCol?.header,
  };
}

export function computeBi(
  columns: XlsxColumn[],
  rows: (string | number | Date | null)[][],
  opts?: BiOpts,
): BiResult | null {
  if (!columns.length) return null;
  const o = { ...autoPickBiOpts(columns), ...(opts || {}) };
  const idx = (name?: string) => (name ? columns.findIndex((c) => c.header === name) : -1);
  const mi = idx(o.measure);
  if (mi < 0) return null;
  const mc = columns[mi];
  const fmt: Fmt = mc.type === "moeda" ? "money" : mc.type === "percentual" ? "pct" : "num";

  const nums = rows.map((r) => Number(r[mi])).filter((n) => Number.isFinite(n));
  const total = nums.reduce((a, b) => a + b, 0);
  const avg = nums.length ? total / nums.length : 0;
  const max = nums.length ? Math.max(...nums) : 0;
  const min = nums.length ? Math.min(...nums) : 0;

  const kpis: BiResult["kpis"] = [
    { label: `Total · ${mc.header}`, value: total, fmt },
    { label: `Média · ${mc.header}`, value: avg, fmt },
    { label: `Máximo · ${mc.header}`, value: max, fmt },
    { label: `Mínimo · ${mc.header}`, value: min, fmt },
  ];

  let groupBy: BiResult["groupBy"];
  const di = idx(o.dimension);
  if (di >= 0) {
    const m = new Map<string, number>();
    rows.forEach((r) => {
      const key = String(r[di] ?? "—").trim() || "—";
      m.set(key, (m.get(key) || 0) + (Number(r[mi]) || 0));
    });
    groupBy = [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }

  let timeSeries: BiResult["timeSeries"];
  const dti = idx(o.date);
  if (dti >= 0) {
    const m = new Map<string, number>();
    rows.forEach((r) => {
      const v = r[dti];
      let d: Date | null = null;
      if (v instanceof Date) d = v;
      else if (typeof v === "string" && v) {
        const x = new Date(v);
        if (Number.isFinite(x.getTime())) d = x;
      }
      if (!d) return;
      const k = monthKey(d);
      m.set(k, (m.get(k) || 0) + (Number(r[mi]) || 0));
    });
    timeSeries = [...m.entries()].sort().map(([name, value]) => ({ name, value }));
  }

  return {
    measure: mc.header,
    dimension: di >= 0 ? columns[di].header : undefined,
    fmt,
    kpis,
    groupBy,
    timeSeries,
  };
}

export function formatValue(v: number, fmt: Fmt): string {
  if (fmt === "money") return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  if (fmt === "pct") return (v * 100).toFixed(1) + "%";
  return v.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
}
