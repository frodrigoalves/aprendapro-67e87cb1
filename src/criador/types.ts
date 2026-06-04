// Portable types shared by all generators. No external project deps.

export type CriadorMode = "padrao" | "personalizavel";

export type DocPreset = "abnt" | "corporativo" | "juridico";
export type PptStyle = "executivo" | "minimalista" | "moderno";
export type XlsxTemplate = "tabela" | "controle" | "relatorio" | "branco";

export type CuratedFont = "Geist" | "Hanken Grotesk" | "Satoshi" | "General Sans" | "Inter";
export const CURATED_FONTS: CuratedFont[] = [
  "Geist",
  "Hanken Grotesk",
  "Satoshi",
  "General Sans",
  "Inter",
];

export const CURATED_ACCENT_COLORS = [
  { name: "Grafite", hex: "1F2937" },
  { name: "Azul Corporativo", hex: "1E3A8A" },
  { name: "Verde Profundo", hex: "065F46" },
  { name: "Vinho", hex: "7F1D1D" },
  { name: "Bronze", hex: "92400E" },
] as const;

// Future extension flag: pricing / checkout per document.
// R$3 up to 10 pages, R$5 above. Keep disabled.
export const CRIADOR_PRICING_ENABLED = false;

// Future extension flag: AI assistance (Mistral/Ollama via own server). Keep disabled.
export const CRIADOR_AI_ENABLED = false;
