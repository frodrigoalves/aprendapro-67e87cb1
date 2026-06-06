// Excel (.xlsx) generator using exceljs
import ExcelJS from "exceljs";
import FileSaver from "file-saver";
const { saveAs } = FileSaver;
import type { XlsxTemplate, CriadorMode } from "./types";

export type ColType = "texto" | "numero" | "percentual" | "moeda" | "data" | "lista";

export interface XlsxColumn {
  header: string;
  type: ColType;
  list?: string[]; // for type "lista"
}

export interface XlsxInput {
  template: XlsxTemplate;
  mode: CriadorMode;
  title: string;
  columns: XlsxColumn[];
  rows: (string | number | Date | null)[][];
  accentHex?: string;
  /** When provided, an extra "Resumo" sheet is appended with KPIs and a grouping table. */
  bi?: {
    measure: string;
    dimension?: string;
    fmt: "num" | "money" | "pct";
    kpis: { label: string; value: number; fmt: "num" | "money" | "pct" }[];
    groupBy?: { name: string; value: number }[];
    timeSeries?: { name: string; value: number }[];
  };
}

function numFmtFor(t: ColType): string | undefined {
  switch (t) {
    case "numero": return "#,##0.00";
    case "percentual": return "0.0%";
    case "moeda": return '"R$" #,##0.00';
    case "data": return "dd/mm/yyyy";
    default: return undefined;
  }
}

export async function generateXlsx(input: XlsxInput): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Aprenda Pro — Criador";
  wb.created = new Date();

  const ws = wb.addWorksheet(input.title || "Planilha", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  const accent = (input.accentHex || "1F2937").replace("#", "");
  const headerFill: ExcelJS.Fill = {
    type: "pattern", pattern: "solid", fgColor: { argb: "FF" + accent },
  };

  ws.columns = input.columns.map((c) => ({
    header: c.header,
    key: c.header,
    width: Math.max(14, Math.min(40, c.header.length + 6)),
    style: { numFmt: numFmtFor(c.type) },
  }));

  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
  headerRow.fill = headerFill;
  headerRow.alignment = { vertical: "middle", horizontal: "left" };
  headerRow.height = 22;

  input.rows.forEach((r) => ws.addRow(r));

  // Auto-filter on header
  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: input.columns.length },
  };

  // Data validation for lista
  input.columns.forEach((c, idx) => {
    if (c.type === "lista" && c.list?.length) {
      for (let r = 2; r <= Math.max(2, input.rows.length + 1) + 50; r++) {
        ws.getCell(r, idx + 1).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${c.list.join(",")}"`],
        };
      }
    }
  });

  // Totals for "relatorio"
  if (input.template === "relatorio") {
    const totalRowIdx = input.rows.length + 2;
    const totalRow = ws.getRow(totalRowIdx);
    totalRow.getCell(1).value = "Total";
    totalRow.getCell(1).font = { bold: true };
    input.columns.forEach((c, idx) => {
      if (idx === 0) return;
      if (c.type === "numero" || c.type === "moeda" || c.type === "percentual") {
        const colLetter = ws.getColumn(idx + 1).letter;
        totalRow.getCell(idx + 1).value = {
          formula: `SUM(${colLetter}2:${colLetter}${input.rows.length + 1})`,
        };
        totalRow.getCell(idx + 1).numFmt = numFmtFor(c.type) || "";
        totalRow.getCell(idx + 1).font = { bold: true };
      }
    });
    totalRow.fill = {
      type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" },
    };
  }

  // Light borders on data range
  const lastRow = input.rows.length + 1;
  for (let r = 1; r <= lastRow; r++) {
    for (let c = 1; c <= input.columns.length; c++) {
      ws.getCell(r, c).border = {
        top: { style: "thin", color: { argb: "FFE5E7EB" } },
        left: { style: "thin", color: { argb: "FFE5E7EB" } },
        bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
        right: { style: "thin", color: { argb: "FFE5E7EB" } },
      };
    }
  }

  const buf = await wb.xlsx.writeBuffer();
  const blob = new Blob([buf], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const safe = (input.title || "planilha").replace(/[^\p{L}\p{N}\-_ ]+/gu, "").trim() || "planilha";
  saveAs(blob, `${safe}.xlsx`);
}
