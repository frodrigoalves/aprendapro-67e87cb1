// Heuristic column-type inference for pasted/imported tabular data.
import type { ColType } from "../xlsx";

const BR_DATE = /^\d{1,2}\/\d{1,2}\/\d{2,4}$/;
const ISO_DATE = /^\d{4}-\d{1,2}-\d{1,2}$/;
const PERCENT = /^-?\d+([.,]\d+)?\s?%$/;
const NUMBER_BR = /^-?\d{1,3}(\.\d{3})*(,\d+)?$|^-?\d+([.,]\d+)?$/;
const CURRENCY = /^R\$\s?-?\d/;

function ratio(values: string[], re: RegExp): number {
  if (!values.length) return 0;
  return values.filter((v) => re.test(v)).length / values.length;
}

export function inferColumnType(values: string[]): ColType {
  const samples = values.map((v) => String(v ?? "").trim()).filter(Boolean).slice(0, 80);
  if (!samples.length) return "texto";
  if (ratio(samples, PERCENT) > 0.7) return "percentual";
  if (samples.some((v) => CURRENCY.test(v)) && ratio(samples, /R\$|\d/) > 0.7) return "moeda";
  if (ratio(samples, BR_DATE) > 0.7 || ratio(samples, ISO_DATE) > 0.7) return "data";
  if (ratio(samples, NUMBER_BR) > 0.8) return "numero";
  const uniq = new Set(samples.map((s) => s.toLowerCase()));
  if (samples.length >= 5 && uniq.size >= 2 && uniq.size <= 12) return "lista";
  return "texto";
}

export function inferColumns(
  headers: string[],
  rows: string[][],
): { header: string; type: ColType; list?: string[] }[] {
  return headers.map((h, i) => {
    const col = rows.map((r) => String(r[i] ?? ""));
    const type = inferColumnType(col);
    const list =
      type === "lista"
        ? Array.from(new Set(col.map((v) => v.trim()).filter(Boolean))).slice(0, 20)
        : undefined;
    return { header: (h || `Coluna ${i + 1}`).trim(), type, list };
  });
}

export function coerceValue(raw: unknown, type: ColType): string | number | Date | null {
  const v = String(raw ?? "").trim();
  if (!v) return null;
  if (type === "numero" || type === "moeda") {
    const n = Number(v.replace(/R\$\s?/g, "").replace(/\./g, "").replace(",", "."));
    return Number.isFinite(n) ? n : v;
  }
  if (type === "percentual") {
    const n = Number(v.replace("%", "").replace(",", "."));
    return Number.isFinite(n) ? n / 100 : v;
  }
  if (type === "data") {
    const m = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (m) {
      const y = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
      const d = new Date(y, Number(m[2]) - 1, Number(m[1]));
      return Number.isFinite(d.getTime()) ? d : v;
    }
    const d = new Date(v);
    return Number.isFinite(d.getTime()) ? d : v;
  }
  return v;
}

export function coerceRows(
  rows: unknown[][],
  types: ColType[],
): (string | number | Date | null)[][] {
  return rows.map((r) => r.map((cell, i) => coerceValue(cell, types[i] || "texto")));
}
