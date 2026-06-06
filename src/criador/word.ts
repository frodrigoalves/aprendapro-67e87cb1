// Word (.docx) generator using "docx" + "file-saver"
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  PageNumber,
  Header,
  Footer,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ShadingType,
  LevelFormat,
  convertInchesToTwip,
  convertMillimetersToTwip,
} from "docx";
import FileSaver from "file-saver";
const { saveAs } = FileSaver;
import type { DocPreset, CriadorMode } from "./types";

export interface DocSection {
  title: string;
  body: string;
}
export interface DocTable {
  caption?: string;
  rows: string[][]; // first row = header
}
export interface DocImage {
  dataUrl: string; // data:image/png;base64,...
  caption?: string;
  widthPx?: number;
  heightPx?: number;
}

export interface DocInput {
  preset: DocPreset;
  mode: CriadorMode;
  title: string;
  author: string;
  company?: string;
  logo?: DocImage;
  sections: DocSection[];
  tables?: DocTable[];
  images?: DocImage[];
  // personalizable-only
  fontFamily?: string;
  accentHex?: string;
}

const LEGAL_NOTICE =
  "AVISO: Este é um MODELO de documento gerado automaticamente. Antes de qualquer uso oficial, recomenda-se revisão por um profissional habilitado (advogado).";

function dataUrlToUint8(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] ?? "";
  const bin = atob(base64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return arr;
}

function imageType(dataUrl: string): "png" | "jpg" | "gif" | "bmp" {
  if (dataUrl.startsWith("data:image/png")) return "png";
  if (dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg")) return "jpg";
  if (dataUrl.startsWith("data:image/gif")) return "gif";
  if (dataUrl.startsWith("data:image/bmp")) return "bmp";
  return "png";
}

function buildImageRun(img: DocImage) {
  const w = img.widthPx ?? 400;
  const h = img.heightPx ?? 240;
  return new ImageRun({
    type: imageType(img.dataUrl),
    data: dataUrlToUint8(img.dataUrl),
    transformation: { width: w, height: h },
  } as any);
}

function buildTable(t: DocTable, accent: string): Table {
  const border = { style: BorderStyle.SINGLE, size: 6, color: "CCCCCC" };
  const borders = { top: border, bottom: border, left: border, right: border };
  return new Table({
    width: { size: 9026, type: WidthType.DXA },
    rows: t.rows.map((row, ri) => new TableRow({
      children: row.map((cell) => new TableCell({
        width: { size: Math.floor(9026 / row.length), type: WidthType.DXA },
        borders,
        shading: ri === 0
          ? { fill: accent, type: ShadingType.CLEAR, color: "auto" }
          : { fill: "FFFFFF", type: ShadingType.CLEAR, color: "auto" },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          children: [new TextRun({
            text: cell,
            bold: ri === 0,
            color: ri === 0 ? "FFFFFF" : "000000",
            size: 22,
          })],
        })],
      })),
    })),
  });
}

export async function generateDoc(input: DocInput): Promise<void> {
  const accent = (input.accentHex || "1F2937").replace("#", "");
  const fontFamily = input.preset === "abnt"
    ? "Times New Roman"
    : (input.fontFamily || "Hanken Grotesk");
  const isABNT = input.preset === "abnt";
  const isJuridico = input.preset === "juridico";

  const children: Paragraph[] = [];

  if (isJuridico) {
    children.push(new Paragraph({
      spacing: { after: 240 },
      children: [new TextRun({ text: LEGAL_NOTICE, bold: true, color: "7F1D1D", size: 20 })],
    }));
  }

  // Cover / title
  if (input.logo) {
    children.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [buildImageRun({ ...input.logo, widthPx: 160, heightPx: 160 })],
    }));
  }
  children.push(new Paragraph({
    alignment: isABNT ? AlignmentType.CENTER : AlignmentType.LEFT,
    spacing: { before: isABNT ? 1200 : 0, after: 240 },
    children: [new TextRun({ text: input.title, bold: true, size: isABNT ? 32 : 36 })],
  }));
  if (input.author || input.company) {
    children.push(new Paragraph({
      alignment: isABNT ? AlignmentType.CENTER : AlignmentType.LEFT,
      spacing: { after: 360 },
      children: [new TextRun({
        text: [input.author, input.company].filter(Boolean).join(" — "),
        size: 22,
        color: "555555",
      })],
    }));
  }

  // Sections
  input.sections.forEach((s, idx) => {
    children.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      numbering: isJuridico ? { reference: "clauses", level: 0 } : undefined,
      spacing: { before: 360, after: 180 },
      children: [new TextRun({
        text: isABNT ? `${idx + 1} ${s.title}` : s.title,
        bold: true,
        size: 28,
        color: accent,
      })],
    }));
    const paragraphs = s.body.split(/\n\n+/);
    paragraphs.forEach((p) => {
      children.push(new Paragraph({
        alignment: isABNT ? AlignmentType.JUSTIFIED : AlignmentType.LEFT,
        indent: isABNT ? { firstLine: convertMillimetersToTwip(12.5) } : undefined,
        spacing: { line: isABNT ? 360 : 300, after: 120 },
        children: [new TextRun({ text: p, size: 24 })],
      }));
    });
  });

  // Tables
  const tableBlocks: (Paragraph | Table)[] = [];
  (input.tables ?? []).forEach((t) => {
    if (t.caption) {
      tableBlocks.push(new Paragraph({
        spacing: { before: 240, after: 80 },
        children: [new TextRun({ text: t.caption, italics: true, size: 20, color: "555555" })],
      }));
    }
    tableBlocks.push(buildTable(t, accent));
  });

  // Images
  const imageBlocks: Paragraph[] = [];
  (input.images ?? []).forEach((img) => {
    imageBlocks.push(new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 80 },
      children: [buildImageRun(img)],
    }));
    if (img.caption) {
      imageBlocks.push(new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 160 },
        children: [new TextRun({ text: img.caption, italics: true, size: 20, color: "555555" })],
      }));
    }
  });

  // Juridical: signature block
  const tail: Paragraph[] = [];
  if (isJuridico) {
    tail.push(new Paragraph({ spacing: { before: 600 }, children: [new TextRun({ text: "_______________________________________", size: 22 })] }));
    tail.push(new Paragraph({ children: [new TextRun({ text: `${input.author || "Parte"}${input.company ? " — " + input.company : ""}`, size: 22 })] }));
  }

  const doc = new Document({
    creator: input.author || "Aprenda Pro",
    title: input.title,
    styles: {
      default: { document: { run: { font: fontFamily, size: 24 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { size: 28, bold: true, font: fontFamily, color: accent },
          paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 0 } },
      ],
    },
    numbering: {
      config: [
        { reference: "clauses",
          levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "Cláusula %1ª —", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 0 } } } }] },
      ],
    },
    sections: [{
      properties: {
        page: {
          margin: isABNT
            ? { top: convertMillimetersToTwip(30), left: convertMillimetersToTwip(30),
                bottom: convertMillimetersToTwip(20), right: convertMillimetersToTwip(20) }
            : { top: convertInchesToTwip(1), left: convertInchesToTwip(1),
                bottom: convertInchesToTwip(1), right: convertInchesToTwip(1) },
        },
      },
      headers: input.company || input.author ? {
        default: new Header({ children: [new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new TextRun({ text: input.company || input.author || "", size: 18, color: "888888" })],
        })] }),
      } : undefined,
      footers: {
        default: new Footer({ children: [new Paragraph({
          alignment: isABNT ? AlignmentType.RIGHT : AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Página ", size: 18, color: "888888" }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "888888" }),
            new TextRun({ text: " de ", size: 18, color: "888888" }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: "888888" }),
          ],
        })] }),
      },
      children: [...children, ...tableBlocks, ...imageBlocks, ...tail],
    }],
  });

  const blob = await Packer.toBlob(doc);
  const safe = (input.title || "documento").replace(/[^\p{L}\p{N}\-_ ]+/gu, "").trim() || "documento";
  saveAs(blob, `${safe}.docx`);
}
