// Optional AI assistance via user's self-hosted Ollama/Mistral instance.
// Reads OLLAMA_BASE_URL / OLLAMA_MODEL / OLLAMA_API_KEY at runtime.
// Returns { fallback: true } whenever the model is unreachable or output is
// invalid — the client falls back to deterministic heuristics.
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const ColTypeSchema = z.enum(["texto", "numero", "moeda", "percentual", "data", "lista"]);

const SuggestionSchema = z.object({
  title: z.string().min(1).max(120),
  columns: z
    .array(
      z.object({
        header: z.string().min(1).max(60),
        type: ColTypeSchema,
        list: z.array(z.string().min(1).max(40)).max(20).optional(),
      }),
    )
    .min(2)
    .max(15),
  bi: z
    .object({
      dimension: z.string().optional(),
      measure: z.string().optional(),
      date: z.string().optional(),
    })
    .optional(),
});

export type AiSuggestion = z.infer<typeof SuggestionSchema>;

const SYSTEM_PROMPT = `Você é um especialista em planilhas profissionais e BI.
Receberá uma descrição em português do que o usuário quer e DEVE responder APENAS um JSON válido (sem markdown, sem comentários) no formato:
{
  "title": "Nome curto da planilha",
  "columns": [
    {"header":"Nome da coluna","type":"texto|numero|moeda|percentual|data|lista","list":["opção1","opção2"]}
  ],
  "bi": { "dimension":"...", "measure":"...", "date":"..." }
}
Regras:
- 4 a 10 colunas, nomes curtos em português.
- Use "lista" apenas para colunas categóricas com no máximo 8 opções.
- Sempre que houver coluna de valor financeiro, marque como "moeda".
- "bi.dimension" deve ser uma coluna categórica; "bi.measure" uma coluna numérica/moeda; "bi.date" uma coluna de data, se existir.
- Não invente colunas redundantes (Id sequencial não é necessário).`;

export const suggestSpreadsheetFromText = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ description: z.string().min(3).max(800) }).parse(input),
  )
  .handler(async ({ data }) => {
    const base = process.env.AI_ENGINE_URL;
    const model = process.env.AI_ENGINE_MODEL === "primary" ? "mistral" : (process.env.AI_ENGINE_MODEL || "primary";
    const apiKey = process.env.AI_ENGINE_KEY;
    if (!base) return { fallback: true as const, reason: "OLLAMA_BASE_URL not set" };

    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 10_000);
    try {
      const res = await fetch(`${base.replace(/\/$/, "")}/api/chat`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(apiKey ? { authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          model,
          stream: false,
          format: "json",
          options: { temperature: 0.2 },
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: data.description },
          ],
        }),
        signal: ctrl.signal,
      });
      if (!res.ok) return { fallback: true as const, reason: `HTTP ${res.status}` };
      const body = (await res.json()) as { message?: { content?: string } };
      const raw = body.message?.content?.trim();
      if (!raw) return { fallback: true as const, reason: "empty response" };
      const parsed = SuggestionSchema.safeParse(JSON.parse(raw));
      if (!parsed.success) return { fallback: true as const, reason: "schema mismatch" };
      return { fallback: false as const, suggestion: parsed.data };
    } catch (err) {
      return { fallback: true as const, reason: (err as Error).message };
    } finally {
      clearTimeout(timeout);
    }
  });
