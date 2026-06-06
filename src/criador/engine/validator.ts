import type { XlsxColumn } from "../xlsx";

export interface ValidationIssue {
  level: "error" | "warning";
  message: string;
  column?: number;
  row?: number;
}

export function validate(
  columns: XlsxColumn[],
  rows: (string | number | Date | null)[][],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  if (!columns.length) {
    issues.push({ level: "error", message: "Adicione pelo menos uma coluna." });
    return issues;
  }
  const seen = new Set<string>();
  columns.forEach((c, i) => {
    if (!c.header.trim()) issues.push({ level: "error", message: `Coluna ${i + 1} sem nome.`, column: i });
    const key = c.header.trim().toLowerCase();
    if (key && seen.has(key)) issues.push({ level: "warning", message: `Coluna "${c.header}" está duplicada.`, column: i });
    seen.add(key);
    if (c.type === "lista" && (!c.list || c.list.length === 0))
      issues.push({ level: "warning", message: `Coluna "${c.header}" é lista mas sem opções.`, column: i });
  });
  if (!rows.length) issues.push({ level: "warning", message: "Nenhuma linha de dados — a planilha será gerada vazia." });
  rows.forEach((r, ri) => {
    columns.forEach((c, ci) => {
      const v = r[ci];
      if (v == null || v === "") return;
      if ((c.type === "numero" || c.type === "moeda" || c.type === "percentual") && typeof v !== "number") {
        issues.push({ level: "warning", message: `Linha ${ri + 1}, "${c.header}": valor não numérico ("${String(v)}").`, row: ri, column: ci });
      }
    });
  });
  columns.forEach((c, i) => {
    if (!rows.length) return;
    const allEmpty = rows.every((r) => r[i] == null || r[i] === "");
    if (allEmpty) issues.push({ level: "warning", message: `Coluna "${c.header}" está sem dados.`, column: i });
  });
  return issues;
}
