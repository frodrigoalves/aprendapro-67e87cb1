// PowerPoint (.pptx) generator using pptxgenjs
import pptxgen from "pptxgenjs";
import type { PptStyle, CriadorMode } from "./types";

export type SlideLayout =
  | "capa"
  | "titulo_conteudo"
  | "dois_conteudos"
  | "imagem_texto"
  | "citacao"
  | "encerramento";

export interface PptSlide {
  layout: SlideLayout;
  title?: string;
  text?: string;
  text2?: string;
  imageDataUrl?: string;
  author?: string;
}

export interface PptInput {
  style: PptStyle;
  mode: CriadorMode;
  title: string;
  author: string;
  slides: PptSlide[];
  fontFamily?: string;
  accentHex?: string;
}

interface Theme {
  bg: string;
  fg: string;
  muted: string;
  accent: string;
  font: string;
  titleSize: number;
  bodySize: number;
}

function themeFor(style: PptStyle, override?: { font?: string; accent?: string }): Theme {
  const accent = (override?.accent || "").replace("#", "");
  switch (style) {
    case "executivo":
      return { bg: "0B1B3A", fg: "FFFFFF", muted: "B7C2DA", accent: accent || "C9A227",
        font: override?.font || "Hanken Grotesk", titleSize: 36, bodySize: 18 };
    case "minimalista":
      return { bg: "FFFFFF", fg: "111827", muted: "6B7280", accent: accent || "1F2937",
        font: override?.font || "Geist", titleSize: 40, bodySize: 18 };
    case "moderno":
    default:
      return { bg: "F8FAFC", fg: "0F172A", muted: "475569", accent: accent || "1E3A8A",
        font: override?.font || "Satoshi", titleSize: 38, bodySize: 18 };
  }
}

export async function generatePpt(input: PptInput): Promise<void> {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE"; // 13.333 x 7.5
  pptx.title = input.title;
  pptx.author = input.author;

  const t = themeFor(input.style, { font: input.fontFamily, accent: input.accentHex });

  const addBg = (s: pptxgen.Slide) => {
    s.background = { color: t.bg };
  };
  const addAccentBar = (s: pptxgen.Slide) => {
    s.addShape("rect", { x: 0, y: 0, w: 13.333, h: 0.1, fill: { color: t.accent } });
  };

  input.slides.forEach((sl) => {
    const s = pptx.addSlide();
    addBg(s);
    addAccentBar(s);

    switch (sl.layout) {
      case "capa": {
        s.addText(sl.title || input.title, {
          x: 0.8, y: 2.6, w: 11.7, h: 1.4,
          fontFace: t.font, fontSize: 48, bold: true, color: t.fg,
        });
        s.addText(sl.text || input.author || "", {
          x: 0.8, y: 4.1, w: 11.7, h: 0.6,
          fontFace: t.font, fontSize: 20, color: t.muted,
        });
        break;
      }
      case "titulo_conteudo": {
        s.addText(sl.title || "", {
          x: 0.7, y: 0.6, w: 12, h: 0.9,
          fontFace: t.font, fontSize: t.titleSize, bold: true, color: t.fg,
        });
        s.addText(sl.text || "", {
          x: 0.7, y: 1.8, w: 12, h: 5,
          fontFace: t.font, fontSize: t.bodySize, color: t.fg, valign: "top",
        });
        break;
      }
      case "dois_conteudos": {
        s.addText(sl.title || "", {
          x: 0.7, y: 0.6, w: 12, h: 0.9,
          fontFace: t.font, fontSize: t.titleSize, bold: true, color: t.fg,
        });
        s.addText(sl.text || "", {
          x: 0.7, y: 1.8, w: 5.9, h: 5,
          fontFace: t.font, fontSize: t.bodySize, color: t.fg, valign: "top",
        });
        s.addText(sl.text2 || "", {
          x: 6.8, y: 1.8, w: 5.9, h: 5,
          fontFace: t.font, fontSize: t.bodySize, color: t.fg, valign: "top",
        });
        break;
      }
      case "imagem_texto": {
        s.addText(sl.title || "", {
          x: 0.7, y: 0.6, w: 12, h: 0.9,
          fontFace: t.font, fontSize: t.titleSize, bold: true, color: t.fg,
        });
        if (sl.imageDataUrl) {
          s.addImage({ data: sl.imageDataUrl, x: 0.7, y: 1.8, w: 5.9, h: 5, sizing: { type: "contain", w: 5.9, h: 5 } });
        }
        s.addText(sl.text || "", {
          x: 6.8, y: 1.8, w: 5.9, h: 5,
          fontFace: t.font, fontSize: t.bodySize, color: t.fg, valign: "top",
        });
        break;
      }
      case "citacao": {
        s.addText(`“${sl.text || ""}”`, {
          x: 1.5, y: 2.4, w: 10.3, h: 2.4,
          fontFace: t.font, fontSize: 32, italic: true, color: t.fg, align: "center",
        });
        s.addText(sl.author ? `— ${sl.author}` : "", {
          x: 1.5, y: 4.8, w: 10.3, h: 0.6,
          fontFace: t.font, fontSize: 18, color: t.muted, align: "center",
        });
        break;
      }
      case "encerramento": {
        s.addText(sl.title || "Obrigado", {
          x: 0.8, y: 3.0, w: 11.7, h: 1.2,
          fontFace: t.font, fontSize: 48, bold: true, color: t.fg, align: "center",
        });
        s.addText(sl.text || input.author || "", {
          x: 0.8, y: 4.3, w: 11.7, h: 0.6,
          fontFace: t.font, fontSize: 18, color: t.muted, align: "center",
        });
        break;
      }
    }
  });

  const safe = (input.title || "apresentacao").replace(/[^\p{L}\p{N}\-_ ]+/gu, "").trim() || "apresentacao";
  await pptx.writeFile({ fileName: `${safe}.pptx` });
}
