import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { FileText, Presentation, Sheet, ChevronLeft, ChevronRight, Plus, Trash2, Download, Upload, Loader2, Sparkles, ClipboardPaste, FileUp, LayoutTemplate, AlertTriangle, BarChart3 } from "lucide-react";
import { CriadorButton, CriadorCard, CriadorField, CriadorInput, CriadorProgress, CriadorSelect, CriadorTextarea } from "./ui";
import { CURATED_ACCENT_COLORS, CURATED_FONTS, type CriadorMode, type DocPreset, type PptStyle, type XlsxTemplate } from "./types";
import { generateDoc, type DocSection, type DocTable } from "./word";
import { generatePpt, type PptSlide, type SlideLayout } from "./pptx";
import { generateXlsx, type ColType, type XlsxColumn } from "./xlsx";
import { BLUEPRINTS } from "./engine/templates";
import { fromPasted } from "./engine/csvImport";
import { inferColumns, coerceRows } from "./engine/typeInfer";
import { validate, type ValidationIssue } from "./engine/validator";
import { computeBi, autoPickBiOpts } from "./engine/bi";
import { BiPreview } from "./preview/BiPreview";
import { suggestSpreadsheetFromText } from "@/lib/criador-ai.functions";

type Tool = "home" | "word" | "ppt" | "xlsx";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// Future: hook for page-count + checkout (R$3 até 10p, R$5 acima).
// const useCheckoutGate = () => { /* disabled — see CRIADOR_PRICING_ENABLED */ };
// Future: hook for AI assistance (Mistral/Ollama on own VPS).
// const useAIAssistant = () => { /* disabled — see CRIADOR_AI_ENABLED */ };

export function CriadorApp() {
  const [tool, setTool] = useState<Tool>("home");

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900" style={{ fontFamily: "'Hanken Grotesk', 'Geist', system-ui, sans-serif" }}>
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
          <button onClick={() => setTool("home")} className="text-sm font-semibold tracking-tight">
            Criador
          </button>
          {tool !== "home" && (
            <button onClick={() => setTool("home")} className="text-xs text-neutral-500 hover:text-neutral-900">
              ← Voltar ao início
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-10 sm:py-14">
        {tool === "home" && <Home onPick={setTool} />}
        {tool === "word" && <WordWizard />}
        {tool === "ppt" && <PptWizard />}
        {tool === "xlsx" && <XlsxWizard />}
      </main>

      <footer className="border-t border-neutral-200 py-8">
        <p className="mx-auto max-w-6xl px-6 text-center text-xs text-neutral-500">
          Geração 100% no seu navegador. Nenhum dado é enviado a servidores.
        </p>
      </footer>
    </div>
  );
}

function Home({ onPick }: { onPick: (t: Tool) => void }) {
  const cards = [
    { id: "word" as Tool, icon: FileText, title: "Documento", desc: "Word (.docx) com presets ABNT, Corporativo e Jurídico." },
    { id: "ppt" as Tool, icon: Presentation, title: "Apresentação", desc: "PowerPoint (.pptx) — Executivo, Minimalista e Moderno." },
    { id: "xlsx" as Tool, icon: Sheet, title: "Planilha", desc: "Excel (.xlsx) — Tabela, Controle e Relatório com Totais." },
  ];
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="mb-12 max-w-2xl">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight" style={{ fontFamily: "'Geist', 'Hanken Grotesk', sans-serif" }}>
          Crie arquivos profissionais em minutos.
        </h1>
        <p className="mt-4 text-base text-neutral-600">
          Preencha um formulário guiado, escolha um modelo e baixe pronto. Sem login, sem cadastro.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => onPick(c.id)}
              className="group flex flex-col items-start rounded-xl border border-neutral-200 bg-white p-7 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md hover:border-neutral-900"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-neutral-200 bg-neutral-50">
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold">{c.title}</h3>
              <p className="mt-1.5 text-sm text-neutral-600">{c.desc}</p>
              <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-neutral-900">
                Começar <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ===================== WORD WIZARD ===================== */

function WordWizard() {
  const [step, setStep] = useState(1);
  const total = 4;
  const [preset, setPreset] = useState<DocPreset>("corporativo");
  const [mode, setMode] = useState<CriadorMode>("padrao");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [company, setCompany] = useState("");
  const [logo, setLogo] = useState<string | undefined>(undefined);
  const [sections, setSections] = useState<DocSection[]>([{ title: "Introdução", body: "" }]);
  const [tables, setTables] = useState<DocTable[]>([]);
  const [fontFamily, setFontFamily] = useState<string>(CURATED_FONTS[1]);
  const [accentHex, setAccentHex] = useState<string>(CURATED_ACCENT_COLORS[0].hex);
  const [busy, setBusy] = useState(false);

  const canNext =
    (step === 1 && !!preset) ||
    (step === 2 && title.trim().length > 0) ||
    (step === 3 && sections.every((s) => s.title.trim().length > 0)) ||
    step === 4;

  async function handleDownload() {
    setBusy(true);
    try {
      await generateDoc({
        preset, mode, title, author, company, logo: logo ? { dataUrl: logo } : undefined,
        sections, tables,
        fontFamily: mode === "personalizavel" ? fontFamily : undefined,
        accentHex: mode === "personalizavel" ? accentHex : undefined,
      });
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <CriadorProgress step={step} total={total} />
      </div>

      {step === 1 && (
        <CriadorCard>
          <h2 className="mb-1 text-xl font-semibold">Escolha o modelo</h2>
          <p className="mb-6 text-sm text-neutral-600">Cada modelo tem um padrão profissional travado.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              { id: "abnt", title: "ABNT (NBR 14724)", desc: "Trabalhos acadêmicos." },
              { id: "corporativo", title: "Corporativo", desc: "Relatórios e propostas." },
              { id: "juridico", title: "Jurídico / Termos", desc: "Contratos e cláusulas." },
            ] as { id: DocPreset; title: string; desc: string }[]).map((p) => (
              <button key={p.id} onClick={() => setPreset(p.id)}
                className={`rounded-lg border p-4 text-left transition ${preset === p.id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"}`}>
                <div className="text-sm font-semibold">{p.title}</div>
                <div className="mt-1 text-xs text-neutral-600">{p.desc}</div>
              </button>
            ))}
          </div>

          <h3 className="mt-8 mb-3 text-sm font-semibold">Modo</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <ModePicker mode={mode} setMode={setMode} />
          </div>
        </CriadorCard>
      )}

      {step === 2 && (
        <CriadorCard>
          <h2 className="mb-1 text-xl font-semibold">Informações básicas</h2>
          <p className="mb-6 text-sm text-neutral-600">Esses dados aparecem na capa, cabeçalho e rodapé.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <CriadorField label="Título do documento">
              <CriadorInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Relatório Anual 2026" />
            </CriadorField>
            <CriadorField label="Autor">
              <CriadorInput value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Seu nome" />
            </CriadorField>
            <CriadorField label="Empresa (opcional)">
              <CriadorInput value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Nome da empresa" />
            </CriadorField>
            <CriadorField label="Logotipo (opcional)">
              <LogoUpload value={logo} onChange={setLogo} />
            </CriadorField>
          </div>
        </CriadorCard>
      )}

      {step === 3 && (
        <CriadorCard>
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Conteúdo</h2>
              <p className="text-sm text-neutral-600">Adicione seções e, opcionalmente, tabelas.</p>
            </div>
          </div>

          <div className="space-y-4">
            {sections.map((s, i) => (
              <div key={i} className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500">Seção {i + 1}</span>
                  {sections.length > 1 && (
                    <button onClick={() => setSections(sections.filter((_, k) => k !== i))} className="text-neutral-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
                <CriadorField label="Título da seção">
                  <CriadorInput value={s.title} onChange={(e) => {
                    const next = [...sections]; next[i] = { ...next[i], title: e.target.value }; setSections(next);
                  }} />
                </CriadorField>
                <div className="mt-3">
                  <CriadorField label="Texto">
                    <CriadorTextarea value={s.body} onChange={(e) => {
                      const next = [...sections]; next[i] = { ...next[i], body: e.target.value }; setSections(next);
                    }} placeholder="Escreva o conteúdo. Parágrafos separados por linha em branco." />
                  </CriadorField>
                </div>
              </div>
            ))}
            <CriadorButton variant="outline" onClick={() => setSections([...sections, { title: "", body: "" }])}>
              <Plus className="h-4 w-4" strokeWidth={1.5} /> Adicionar seção
            </CriadorButton>
          </div>

          <div className="mt-8">
            <h3 className="mb-3 text-sm font-semibold">Tabelas (opcional)</h3>
            {tables.map((t, ti) => (
              <div key={ti} className="mb-3 rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500">Tabela {ti + 1}</span>
                  <button onClick={() => setTables(tables.filter((_, k) => k !== ti))} className="text-neutral-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
                <TableEditor table={t} onChange={(nt) => { const a = [...tables]; a[ti] = nt; setTables(a); }} />
              </div>
            ))}
            <CriadorButton variant="outline" onClick={() => setTables([...tables, { caption: "", rows: [["Coluna A", "Coluna B"], ["", ""]] }])}>
              <Plus className="h-4 w-4" strokeWidth={1.5} /> Adicionar tabela
            </CriadorButton>
          </div>

          {mode === "personalizavel" && (
            <CustomizationBlock
              fontFamily={fontFamily} setFontFamily={setFontFamily}
              accentHex={accentHex} setAccentHex={setAccentHex}
            />
          )}
        </CriadorCard>
      )}

      {step === 4 && (
        <CriadorCard>
          <h2 className="mb-1 text-xl font-semibold">Pré-visualização</h2>
          <p className="mb-6 text-sm text-neutral-600">Confira a estrutura. Clique em "Baixar" para gerar o arquivo.</p>
          <PreviewBlock>
            <div className="text-xs uppercase tracking-wider text-neutral-500">
              {preset === "abnt" ? "ABNT NBR 14724" : preset === "juridico" ? "Jurídico / Termos" : "Corporativo"}
            </div>
            <h3 className="mt-1 text-2xl font-bold">{title || "Sem título"}</h3>
            <p className="mt-1 text-sm text-neutral-600">{[author, company].filter(Boolean).join(" — ")}</p>
            <div className="mt-6 space-y-4">
              {sections.map((s, i) => (
                <div key={i}>
                  <div className="text-sm font-semibold" style={{ color: `#${accentHex}` }}>{s.title}</div>
                  <p className="mt-1 line-clamp-3 text-xs text-neutral-600">{s.body || "(sem conteúdo)"}</p>
                </div>
              ))}
            </div>
            {tables.length > 0 && <div className="mt-6 text-xs text-neutral-500">{tables.length} tabela(s)</div>}
            {preset === "juridico" && (
              <div className="mt-6 rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
                Este é um modelo. Recomenda-se revisão por profissional habilitado.
              </div>
            )}
          </PreviewBlock>

          <div className="mt-6 flex justify-end">
            <CriadorButton onClick={handleDownload} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <Download className="h-4 w-4" strokeWidth={1.5} />}
              Baixar .docx
            </CriadorButton>
          </div>
        </CriadorCard>
      )}

      <WizardNav step={step} total={total} setStep={setStep} canNext={canNext} />
    </div>
  );
}

/* ===================== PPT WIZARD ===================== */

const PPT_LAYOUTS: { id: SlideLayout; label: string }[] = [
  { id: "capa", label: "Capa" },
  { id: "titulo_conteudo", label: "Título + Conteúdo" },
  { id: "dois_conteudos", label: "Dois Conteúdos" },
  { id: "imagem_texto", label: "Imagem + Texto" },
  { id: "citacao", label: "Citação" },
  { id: "encerramento", label: "Encerramento" },
];

function PptWizard() {
  const [step, setStep] = useState(1);
  const total = 4;
  const [style, setStyle] = useState<PptStyle>("executivo");
  const [mode, setMode] = useState<CriadorMode>("padrao");
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [slides, setSlides] = useState<PptSlide[]>([{ layout: "capa", title: "" }]);
  const [fontFamily, setFontFamily] = useState<string>(CURATED_FONTS[0]);
  const [accentHex, setAccentHex] = useState<string>(CURATED_ACCENT_COLORS[1].hex);
  const [busy, setBusy] = useState(false);

  const canNext =
    (step === 1 && !!style) ||
    (step === 2 && title.trim().length > 0) ||
    (step === 3 && slides.length > 0) ||
    step === 4;

  async function handleDownload() {
    setBusy(true);
    try {
      await generatePpt({
        style, mode, title, author, slides,
        fontFamily: mode === "personalizavel" ? fontFamily : undefined,
        accentHex: mode === "personalizavel" ? accentHex : undefined,
      });
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8"><CriadorProgress step={step} total={total} /></div>

      {step === 1 && (
        <CriadorCard>
          <h2 className="mb-1 text-xl font-semibold">Estilo da apresentação</h2>
          <p className="mb-6 text-sm text-neutral-600">Formato 16:9. Grid, tipografia e paleta travados.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {([
              { id: "executivo", title: "Executivo", desc: "Fundo escuro, sofisticado." },
              { id: "minimalista", title: "Minimalista", desc: "Branco, foco no conteúdo." },
              { id: "moderno", title: "Moderno", desc: "Claro com azul corporativo." },
            ] as { id: PptStyle; title: string; desc: string }[]).map((p) => (
              <button key={p.id} onClick={() => setStyle(p.id)}
                className={`rounded-lg border p-4 text-left transition ${style === p.id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"}`}>
                <div className="text-sm font-semibold">{p.title}</div>
                <div className="mt-1 text-xs text-neutral-600">{p.desc}</div>
              </button>
            ))}
          </div>
          <h3 className="mt-8 mb-3 text-sm font-semibold">Modo</h3>
          <div className="grid gap-3 sm:grid-cols-2"><ModePicker mode={mode} setMode={setMode} /></div>
        </CriadorCard>
      )}

      {step === 2 && (
        <CriadorCard>
          <h2 className="mb-1 text-xl font-semibold">Informações básicas</h2>
          <p className="mb-6 text-sm text-neutral-600">Usadas na capa e no encerramento.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <CriadorField label="Título"><CriadorInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Plano Estratégico 2026" /></CriadorField>
            <CriadorField label="Autor / Apresentador"><CriadorInput value={author} onChange={(e) => setAuthor(e.target.value)} /></CriadorField>
          </div>
        </CriadorCard>
      )}

      {step === 3 && (
        <CriadorCard>
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Slides</h2>
            <p className="text-sm text-neutral-600">Adicione, escolha layout e preencha cada slide.</p>
          </div>

          <div className="space-y-4">
            {slides.map((sl, i) => (
              <div key={i} className="rounded-lg border border-neutral-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-neutral-500">Slide {i + 1}</span>
                  {slides.length > 1 && (
                    <button onClick={() => setSlides(slides.filter((_, k) => k !== i))} className="text-neutral-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                    </button>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <CriadorField label="Layout">
                    <CriadorSelect value={sl.layout} onChange={(e) => {
                      const a = [...slides]; a[i] = { ...a[i], layout: e.target.value as SlideLayout }; setSlides(a);
                    }}>
                      {PPT_LAYOUTS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                    </CriadorSelect>
                  </CriadorField>
                  {sl.layout !== "citacao" && sl.layout !== "encerramento" && (
                    <CriadorField label="Título"><CriadorInput value={sl.title || ""} onChange={(e) => { const a = [...slides]; a[i] = { ...a[i], title: e.target.value }; setSlides(a); }} /></CriadorField>
                  )}
                </div>
                {(sl.layout === "titulo_conteudo" || sl.layout === "dois_conteudos" || sl.layout === "imagem_texto" || sl.layout === "capa" || sl.layout === "encerramento") && (
                  <div className="mt-3"><CriadorField label={sl.layout === "dois_conteudos" ? "Coluna esquerda" : "Texto"}>
                    <CriadorTextarea value={sl.text || ""} onChange={(e) => { const a = [...slides]; a[i] = { ...a[i], text: e.target.value }; setSlides(a); }} />
                  </CriadorField></div>
                )}
                {sl.layout === "dois_conteudos" && (
                  <div className="mt-3"><CriadorField label="Coluna direita">
                    <CriadorTextarea value={sl.text2 || ""} onChange={(e) => { const a = [...slides]; a[i] = { ...a[i], text2: e.target.value }; setSlides(a); }} />
                  </CriadorField></div>
                )}
                {sl.layout === "imagem_texto" && (
                  <div className="mt-3"><CriadorField label="Imagem">
                    <LogoUpload value={sl.imageDataUrl} onChange={(v) => { const a = [...slides]; a[i] = { ...a[i], imageDataUrl: v }; setSlides(a); }} />
                  </CriadorField></div>
                )}
                {sl.layout === "citacao" && (
                  <>
                    <div className="mt-3"><CriadorField label="Citação">
                      <CriadorTextarea value={sl.text || ""} onChange={(e) => { const a = [...slides]; a[i] = { ...a[i], text: e.target.value }; setSlides(a); }} />
                    </CriadorField></div>
                    <div className="mt-3"><CriadorField label="Autor da citação">
                      <CriadorInput value={sl.author || ""} onChange={(e) => { const a = [...slides]; a[i] = { ...a[i], author: e.target.value }; setSlides(a); }} />
                    </CriadorField></div>
                  </>
                )}
              </div>
            ))}
            <CriadorButton variant="outline" onClick={() => setSlides([...slides, { layout: "titulo_conteudo", title: "", text: "" }])}>
              <Plus className="h-4 w-4" strokeWidth={1.5} /> Adicionar slide
            </CriadorButton>
          </div>

          {mode === "personalizavel" && (
            <CustomizationBlock fontFamily={fontFamily} setFontFamily={setFontFamily} accentHex={accentHex} setAccentHex={setAccentHex} />
          )}
        </CriadorCard>
      )}

      {step === 4 && (
        <CriadorCard>
          <h2 className="mb-1 text-xl font-semibold">Pré-visualização</h2>
          <p className="mb-6 text-sm text-neutral-600">Resumo da apresentação.</p>
          <PreviewBlock>
            <div className="text-xs uppercase tracking-wider text-neutral-500">{style}</div>
            <h3 className="mt-1 text-2xl font-bold">{title || "Sem título"}</h3>
            <p className="mt-1 text-sm text-neutral-600">{author}</p>
            <div className="mt-4 text-xs text-neutral-500">{slides.length} slide(s)</div>
            <ul className="mt-3 space-y-1 text-xs text-neutral-700">
              {slides.map((s, i) => <li key={i}>{i + 1}. {PPT_LAYOUTS.find((l) => l.id === s.layout)?.label} — {s.title || s.text?.slice(0, 50) || "(vazio)"}</li>)}
            </ul>
          </PreviewBlock>
          <div className="mt-6 flex justify-end">
            <CriadorButton onClick={handleDownload} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <Download className="h-4 w-4" strokeWidth={1.5} />}
              Baixar .pptx
            </CriadorButton>
          </div>
        </CriadorCard>
      )}

      <WizardNav step={step} total={total} setStep={setStep} canNext={canNext} />
    </div>
  );
}

/* ===================== XLSX WIZARD ===================== */

type DataSource = "ai" | "paste" | "csv" | "template" | "manual";

function XlsxWizard() {
  const [step, setStep] = useState(1);
  const total = 4;
  const [template, setTemplate] = useState<XlsxTemplate>("tabela");
  const [mode, setMode] = useState<CriadorMode>("padrao");
  const [title, setTitle] = useState("");
  const [columns, setColumns] = useState<XlsxColumn[]>([
    { header: "Item", type: "texto" },
    { header: "Quantidade", type: "numero" },
    { header: "Valor", type: "moeda" },
  ]);
  const [rows, setRows] = useState<(string | number | Date | null)[][]>([["Exemplo", 1, 100]]);
  const [accentHex, setAccentHex] = useState<string>(CURATED_ACCENT_COLORS[0].hex);
  const [busy, setBusy] = useState(false);
  const [source, setSource] = useState<DataSource>("template");
  const [aiDesc, setAiDesc] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [pasted, setPasted] = useState("");
  const [includeBi, setIncludeBi] = useState(true);
  const [biMeasure, setBiMeasure] = useState<string | undefined>();
  const [biDimension, setBiDimension] = useState<string | undefined>();
  const [biDate, setBiDate] = useState<string | undefined>();

  const callAi = useServerFn(suggestSpreadsheetFromText);

  const biOpts = useMemo(() => {
    const auto = autoPickBiOpts(columns);
    return {
      measure: biMeasure ?? auto.measure,
      dimension: biDimension ?? auto.dimension,
      date: biDate ?? auto.date,
    };
  }, [columns, biMeasure, biDimension, biDate]);

  const bi = useMemo(() => computeBi(columns, rows, biOpts), [columns, rows, biOpts]);
  const issues: ValidationIssue[] = useMemo(() => validate(columns, rows), [columns, rows]);
  const errors = issues.filter((i) => i.level === "error");

  function applyHeadersAndRows(headers: string[], strRows: string[][]) {
    const inferred = inferColumns(headers, strRows);
    setColumns(inferred);
    setRows(coerceRows(strRows, inferred.map((c) => c.type)));
    setBiMeasure(undefined);
    setBiDimension(undefined);
    setBiDate(undefined);
  }

  function loadBlueprint(id: string) {
    const bp = BLUEPRINTS.find((b) => b.id === id);
    if (!bp) return;
    setColumns(bp.columns);
    setRows(bp.sample);
    if (!title) setTitle(bp.title);
    setBiMeasure(bp.bi?.measure);
    setBiDimension(bp.bi?.dimension);
    setBiDate(bp.bi?.date);
  }

  function handlePaste() {
    const { headers, rows: r } = fromPasted(pasted);
    if (!headers.length) return;
    applyHeadersAndRows(headers, r);
  }

  async function handleCsvFile(file: File) {
    const text = await file.text();
    const { headers, rows: r } = fromPasted(text);
    if (!headers.length) return;
    applyHeadersAndRows(headers, r);
    if (!title) setTitle(file.name.replace(/\.[^.]+$/, ""));
  }

  async function handleAi() {
    setAiBusy(true);
    setAiError(null);
    try {
      const result = await callAi({ data: { description: aiDesc } });
      if (result.fallback) {
        setAiError("IA indisponível no momento — escolha um modelo pronto ou edite manualmente.");
      } else {
        const s = result.suggestion;
        setColumns(s.columns.map((c) => ({ header: c.header, type: c.type as ColType, list: c.list })));
        setRows([]);
        if (!title) setTitle(s.title);
        setBiMeasure(s.bi?.measure);
        setBiDimension(s.bi?.dimension);
        setBiDate(s.bi?.date);
      }
    } catch (e) {
      setAiError((e as Error).message);
    } finally {
      setAiBusy(false);
    }
  }

  function updateColumns(next: XlsxColumn[]) {
    setColumns(next);
    setRows(rows.map((r) => next.map((_, i) => r[i] ?? "")));
  }

  async function handleDownload() {
    setBusy(true);
    try {
      await generateXlsx({
        template,
        mode,
        title: title || "Planilha",
        columns,
        rows,
        accentHex: mode === "personalizavel" ? accentHex : undefined,
        bi: includeBi && bi ? bi : undefined,
      });
    } finally {
      setBusy(false);
    }
  }

  const canNext =
    (step === 1 && !!template) ||
    (step === 2 && title.trim().length > 0) ||
    (step === 3 && columns.length > 0 && columns.every((c) => c.header.trim().length > 0) && errors.length === 0) ||
    step === 4;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8"><CriadorProgress step={step} total={total} /></div>

      {step === 1 && (
        <CriadorCard>
          <h2 className="mb-1 text-xl font-semibold">Estilo e modo</h2>
          <p className="mb-6 text-sm text-neutral-600">Defina o visual base — você poderá importar dados ou pedir à IA na próxima etapa.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {([
              { id: "tabela", title: "Tabela Profissional", desc: "Cabeçalho + auto-filtro." },
              { id: "controle", title: "Controle / Lista", desc: "Categorias com validação." },
              { id: "relatorio", title: "Relatório com Totais", desc: "Soma automática." },
              { id: "branco", title: "Em Branco", desc: "Colunas tipadas livres." },
            ] as { id: XlsxTemplate; title: string; desc: string }[]).map((p) => (
              <button key={p.id} onClick={() => setTemplate(p.id)}
                className={`rounded-lg border p-4 text-left transition ${template === p.id ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"}`}>
                <div className="text-sm font-semibold">{p.title}</div>
                <div className="mt-1 text-xs text-neutral-600">{p.desc}</div>
              </button>
            ))}
          </div>
          <h3 className="mt-8 mb-3 text-sm font-semibold">Modo</h3>
          <div className="grid gap-3 sm:grid-cols-2"><ModePicker mode={mode} setMode={setMode} /></div>
        </CriadorCard>
      )}

      {step === 2 && (
        <CriadorCard>
          <h2 className="mb-1 text-xl font-semibold">Como vamos começar?</h2>
          <p className="mb-5 text-sm text-neutral-600">Escolha a forma mais rápida — você ainda poderá editar tudo.</p>

          <div className="mb-5 flex flex-wrap gap-2">
            {([
              { id: "ai", icon: Sparkles, label: "Descrever com IA" },
              { id: "template", icon: LayoutTemplate, label: "Modelo pronto" },
              { id: "paste", icon: ClipboardPaste, label: "Colar tabela" },
              { id: "csv", icon: FileUp, label: "Importar CSV" },
              { id: "manual", icon: Plus, label: "Do zero" },
            ] as { id: DataSource; icon: typeof Sparkles; label: string }[]).map((s) => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setSource(s.id)}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${source === s.id ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"}`}>
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.5} /> {s.label}
                </button>
              );
            })}
          </div>

          <CriadorField label="Título da planilha">
            <CriadorInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Controle Financeiro 2026" />
          </CriadorField>

          {source === "ai" && (
            <div className="mt-5 space-y-3">
              <CriadorField label="Descreva o que você precisa" hint="Ex: controle mensal de vendas por vendedor, com meta e comissão.">
                <CriadorTextarea value={aiDesc} onChange={(e) => setAiDesc(e.target.value)} placeholder="Descreva em uma ou duas frases..." />
              </CriadorField>
              <div className="flex items-center gap-3">
                <CriadorButton onClick={handleAi} disabled={aiBusy || aiDesc.trim().length < 3}>
                  {aiBusy ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <Sparkles className="h-4 w-4" strokeWidth={1.5} />}
                  Gerar estrutura com IA
                </CriadorButton>
                {aiError && <span className="text-xs text-amber-700">{aiError}</span>}
              </div>
            </div>
          )}

          {source === "template" && (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {BLUEPRINTS.map((bp) => (
                <button key={bp.id} onClick={() => loadBlueprint(bp.id)}
                  className="rounded-lg border border-neutral-200 bg-white p-4 text-left transition hover:border-neutral-900 hover:shadow-sm">
                  <div className="text-sm font-semibold">{bp.name}</div>
                  <div className="mt-1 text-xs text-neutral-600">{bp.desc}</div>
                </button>
              ))}
            </div>
          )}

          {source === "paste" && (
            <div className="mt-5 space-y-3">
              <CriadorField label="Cole sua tabela" hint="Colunas separadas por TAB, vírgula ou ponto-e-vírgula. Primeira linha = cabeçalhos.">
                <CriadorTextarea value={pasted} onChange={(e) => setPasted(e.target.value)} placeholder={"Data\tCliente\tValor\n01/02/2026\tACME\tR$ 1.500,00"} className="min-h-[160px] font-mono text-xs" />
              </CriadorField>
              <CriadorButton onClick={handlePaste} disabled={pasted.trim().length === 0}>
                Detectar colunas e tipos
              </CriadorButton>
            </div>
          )}

          {source === "csv" && (
            <div className="mt-5">
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-sm hover:bg-neutral-50">
                <FileUp className="h-4 w-4" strokeWidth={1.5} /> Selecionar arquivo CSV/TSV
                <input type="file" accept=".csv,.tsv,.txt" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleCsvFile(f); }} />
              </label>
              <p className="mt-2 text-xs text-neutral-500">O arquivo nunca sai do seu navegador.</p>
            </div>
          )}

          {columns.length > 0 && source !== "manual" && (
            <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs text-neutral-600">
              <strong className="text-neutral-900">{columns.length} colunas</strong> detectadas · {rows.length} linha(s) carregada(s). Avance para revisar.
            </div>
          )}
        </CriadorCard>
      )}

      {step === 3 && (
        <CriadorCard>
          <h2 className="mb-1 text-xl font-semibold">Colunas e dados</h2>
          <p className="mb-6 text-sm text-neutral-600">Revise tipos, fórmulas e linhas. O sistema valida antes do download.</p>

          <div className="space-y-2">
            {columns.map((c, i) => (
              <div key={i} className="grid grid-cols-12 gap-2">
                <CriadorInput className="col-span-6" value={c.header} placeholder="Nome da coluna"
                  onChange={(e) => { const a = [...columns]; a[i] = { ...a[i], header: e.target.value }; setColumns(a); }} />
                <CriadorSelect className="col-span-5" value={c.type}
                  onChange={(e) => { const a = [...columns]; a[i] = { ...a[i], type: e.target.value as ColType }; setColumns(a); }}>
                  <option value="texto">Texto</option>
                  <option value="numero">Número</option>
                  <option value="percentual">Percentual</option>
                  <option value="moeda">Moeda (R$)</option>
                  <option value="data">Data</option>
                  <option value="lista">Lista suspensa</option>
                </CriadorSelect>
                <button className="col-span-1 text-neutral-400 hover:text-red-600" onClick={() => updateColumns(columns.filter((_, k) => k !== i))}>
                  <Trash2 className="mx-auto h-4 w-4" strokeWidth={1.5} />
                </button>
                {c.type === "lista" && (
                  <CriadorInput className="col-span-12" placeholder="Opções separadas por vírgula"
                    value={c.list?.join(",") || ""}
                    onChange={(e) => { const a = [...columns]; a[i] = { ...a[i], list: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) }; setColumns(a); }} />
                )}
              </div>
            ))}
            <CriadorButton variant="outline" onClick={() => updateColumns([...columns, { header: "", type: "texto" }])}>
              <Plus className="h-4 w-4" strokeWidth={1.5} /> Adicionar coluna
            </CriadorButton>
          </div>

          <div className="mt-8">
            <h3 className="mb-3 text-sm font-semibold">Linhas</h3>
            <div className="overflow-x-auto rounded-lg border border-neutral-200">
              <table className="w-full text-sm">
                <thead className="bg-neutral-100 text-xs uppercase tracking-wider text-neutral-600">
                  <tr>{columns.map((c, i) => <th key={i} className="px-3 py-2 text-left">{c.header || `Col ${i + 1}`}</th>)}<th className="w-10" /></tr>
                </thead>
                <tbody>
                  {rows.map((r, ri) => (
                    <tr key={ri} className="border-t border-neutral-200">
                      {columns.map((_, ci) => (
                        <td key={ci} className="p-1">
                          <input className="h-9 w-full rounded border border-transparent px-2 hover:border-neutral-200 focus:border-neutral-900 focus:outline-none"
                            value={r[ci] instanceof Date ? (r[ci] as Date).toLocaleDateString("pt-BR") : String(r[ci] ?? "")}
                            onChange={(e) => { const a = rows.map((row) => [...row]); a[ri][ci] = e.target.value; setRows(a); }} />
                        </td>
                      ))}
                      <td className="p-1">
                        <button className="text-neutral-400 hover:text-red-600" onClick={() => setRows(rows.filter((_, k) => k !== ri))}>
                          <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-3">
              <CriadorButton variant="outline" onClick={() => setRows([...rows, columns.map(() => "")])}>
                <Plus className="h-4 w-4" strokeWidth={1.5} /> Adicionar linha
              </CriadorButton>
            </div>
          </div>

          {issues.length > 0 && (
            <div className="mt-6 space-y-1.5">
              {issues.map((iss, i) => (
                <div key={i} className={`flex items-start gap-2 rounded-md border p-2.5 text-xs ${iss.level === "error" ? "border-red-200 bg-red-50 text-red-800" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-none" strokeWidth={1.5} />
                  <span>{iss.message}</span>
                </div>
              ))}
            </div>
          )}

          {mode === "personalizavel" && (
            <CustomizationBlock onlyAccent fontFamily="" setFontFamily={() => {}} accentHex={accentHex} setAccentHex={setAccentHex} />
          )}
        </CriadorCard>
      )}

      {step === 4 && (
        <CriadorCard>
          <h2 className="mb-1 text-xl font-semibold">Pré-visualização e BI</h2>
          <p className="mb-5 text-sm text-neutral-600">Confira a planilha e o dashboard antes de baixar.</p>

          <div className="rounded-lg border border-neutral-200 bg-white p-5">
            <h3 className="text-base font-bold text-neutral-900">{title || "Sem título"}</h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr style={{ background: `#${accentHex}`, color: "white" }}>
                  {columns.map((c, i) => <th key={i} className="px-2.5 py-2 text-left font-semibold">{c.header}</th>)}
                </tr></thead>
                <tbody>
                  {rows.slice(0, 10).map((r, ri) => (
                    <tr key={ri} className="border-b border-neutral-100 even:bg-neutral-50/50">
                      {columns.map((c, ci) => (
                        <td key={ci} className="px-2.5 py-1.5 tabular-nums">
                          {formatPreviewCell(r[ci], c.type)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 text-xs text-neutral-500">{rows.length} linha(s) · {columns.length} coluna(s){rows.length > 10 ? " — exibindo as 10 primeiras" : ""}</div>
          </div>

          <div className="mt-6 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-1 h-4 w-4" checked={includeBi} onChange={(e) => setIncludeBi(e.target.checked)} />
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900">
                  <BarChart3 className="h-4 w-4" strokeWidth={1.5} /> Incluir aba Resumo / BI no .xlsx
                </div>
                <p className="mt-0.5 text-xs text-neutral-600">KPIs, agrupamento por categoria e série temporal — gerados automaticamente.</p>
              </div>
            </label>

            {includeBi && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <CriadorField label="Medida (número/moeda)">
                  <CriadorSelect value={biOpts.measure ?? ""} onChange={(e) => setBiMeasure(e.target.value || undefined)}>
                    <option value="">(automático)</option>
                    {columns.filter((c) => ["numero", "moeda", "percentual"].includes(c.type)).map((c) => (
                      <option key={c.header} value={c.header}>{c.header}</option>
                    ))}
                  </CriadorSelect>
                </CriadorField>
                <CriadorField label="Dimensão (categoria)">
                  <CriadorSelect value={biOpts.dimension ?? ""} onChange={(e) => setBiDimension(e.target.value || undefined)}>
                    <option value="">(automático)</option>
                    {columns.filter((c) => ["texto", "lista"].includes(c.type)).map((c) => (
                      <option key={c.header} value={c.header}>{c.header}</option>
                    ))}
                  </CriadorSelect>
                </CriadorField>
                <CriadorField label="Data (opcional)">
                  <CriadorSelect value={biOpts.date ?? ""} onChange={(e) => setBiDate(e.target.value || undefined)}>
                    <option value="">(automático)</option>
                    {columns.filter((c) => c.type === "data").map((c) => (
                      <option key={c.header} value={c.header}>{c.header}</option>
                    ))}
                  </CriadorSelect>
                </CriadorField>
              </div>
            )}
          </div>

          {includeBi && bi && (
            <div className="mt-6">
              <BiPreview bi={bi} accentHex={accentHex} />
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <CriadorButton onClick={handleDownload} disabled={busy || errors.length > 0}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} /> : <Download className="h-4 w-4" strokeWidth={1.5} />}
              Baixar .xlsx{includeBi && bi ? " + Resumo" : ""}
            </CriadorButton>
          </div>
        </CriadorCard>
      )}

      <WizardNav step={step} total={total} setStep={setStep} canNext={canNext} />
    </div>
  );
}

function formatPreviewCell(v: string | number | Date | null, type: ColType): string {
  if (v == null || v === "") return "";
  if (v instanceof Date) return v.toLocaleDateString("pt-BR");
  if (typeof v === "number") {
    if (type === "moeda") return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    if (type === "percentual") return (v * 100).toFixed(1) + "%";
    return v.toLocaleString("pt-BR", { maximumFractionDigits: 2 });
  }
  return String(v);
}


/* ===================== SHARED ===================== */

function WizardNav({ step, total, setStep, canNext }: { step: number; total: number; setStep: (n: number) => void; canNext: boolean }) {
  return (
    <div className="mt-6 flex items-center justify-between">
      <CriadorButton variant="outline" disabled={step === 1} onClick={() => setStep(Math.max(1, step - 1))}>
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} /> Voltar
      </CriadorButton>
      {step < total && (
        <CriadorButton disabled={!canNext} onClick={() => setStep(Math.min(total, step + 1))}>
          Continuar <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
        </CriadorButton>
      )}
    </div>
  );
}

function ModePicker({ mode, setMode }: { mode: CriadorMode; setMode: (m: CriadorMode) => void }) {
  return (
    <>
      <button onClick={() => setMode("padrao")}
        className={`rounded-lg border p-4 text-left transition ${mode === "padrao" ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"}`}>
        <div className="text-sm font-semibold">Modo Padrão</div>
        <div className="mt-1 text-xs text-neutral-600">Template travado. Você só preenche conteúdo. Rápido e infalível.</div>
      </button>
      <button onClick={() => setMode("personalizavel")}
        className={`rounded-lg border p-4 text-left transition ${mode === "personalizavel" ? "border-neutral-900 bg-neutral-50" : "border-neutral-200 hover:border-neutral-400"}`}>
        <div className="text-sm font-semibold">Modo Personalizável</div>
        <div className="mt-1 text-xs text-neutral-600">Ajustes seguros: fonte e cor de destaque. Layout permanece profissional.</div>
      </button>
    </>
  );
}

function CustomizationBlock({ fontFamily, setFontFamily, accentHex, setAccentHex, onlyAccent }: {
  fontFamily: string; setFontFamily: (s: string) => void; accentHex: string; setAccentHex: (s: string) => void; onlyAccent?: boolean;
}) {
  return (
    <div className="mt-8 rounded-lg border border-neutral-200 bg-neutral-50 p-4">
      <h3 className="mb-3 text-sm font-semibold">Personalização</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {!onlyAccent && (
          <CriadorField label="Fonte">
            <CriadorSelect value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
              {CURATED_FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </CriadorSelect>
          </CriadorField>
        )}
        <CriadorField label="Cor de destaque">
          <div className="flex flex-wrap gap-2">
            {CURATED_ACCENT_COLORS.map((c) => (
              <button key={c.hex} onClick={() => setAccentHex(c.hex)}
                className={`h-9 rounded-md border px-3 text-xs font-medium ${accentHex === c.hex ? "border-neutral-900 ring-2 ring-neutral-200" : "border-neutral-200"}`}
                style={{ background: `#${c.hex}`, color: "white" }}>
                {c.name}
              </button>
            ))}
          </div>
        </CriadorField>
      </div>
    </div>
  );
}

function PreviewBlock({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-neutral-200 bg-white p-6">{children}</div>;
}

function LogoUpload({ value, onChange }: { value?: string; onChange: (v?: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-neutral-300 bg-white px-3 text-sm hover:bg-neutral-50">
        <Upload className="h-4 w-4" strokeWidth={1.5} />
        {value ? "Trocar" : "Enviar imagem"}
        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
          const f = e.target.files?.[0]; if (!f) return;
          onChange(await readFileAsDataUrl(f));
        }} />
      </label>
      {value && (
        <>
          <img src={value} alt="" className="h-10 w-10 rounded border border-neutral-200 object-contain" />
          <button onClick={() => onChange(undefined)} className="text-xs text-neutral-500 hover:text-red-600">Remover</button>
        </>
      )}
    </div>
  );
}

function TableEditor({ table, onChange }: { table: DocTable; onChange: (t: DocTable) => void }) {
  return (
    <>
      <CriadorField label="Legenda (opcional)">
        <CriadorInput value={table.caption || ""} onChange={(e) => onChange({ ...table, caption: e.target.value })} />
      </CriadorField>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs">
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="p-0.5">
                    <input className="h-8 w-full rounded border border-neutral-200 px-2 focus:border-neutral-900 focus:outline-none"
                      value={cell} placeholder={ri === 0 ? "Cabeçalho" : ""}
                      onChange={(e) => {
                        const rows = table.rows.map((r) => [...r]); rows[ri][ci] = e.target.value; onChange({ ...table, rows });
                      }} />
                  </td>
                ))}
                <td className="p-0.5">
                  <button onClick={() => onChange({ ...table, rows: table.rows.filter((_, k) => k !== ri) })} className="text-neutral-300 hover:text-red-600">
                    <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex gap-2">
        <CriadorButton variant="outline" size="sm" onClick={() => {
          const cols = table.rows[0]?.length || 2;
          onChange({ ...table, rows: [...table.rows, Array(cols).fill("")] });
        }}><Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Linha</CriadorButton>
        <CriadorButton variant="outline" size="sm" onClick={() => {
          onChange({ ...table, rows: table.rows.map((r) => [...r, ""]) });
        }}><Plus className="h-3.5 w-3.5" strokeWidth={1.5} /> Coluna</CriadorButton>
      </div>
    </>
  );
}
