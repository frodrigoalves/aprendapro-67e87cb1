# Criador de Planilhas v2 — Automação, IA e mini-BI

Evoluir `/criador` (aba Planilha) para um gerador inteligente: entende o que o usuário quer, monta a estrutura sozinho, valida antes de baixar e ainda entrega uma aba de BI/Dashboard pronta.

## 1. Arquitetura (visão geral)

```text
┌──────────────────────────────────────────────────────────────┐
│  /criador  (UI wizard, client)                               │
│  ├─ Passo 1: Descreva ou cole dados                          │
│  ├─ Passo 2: Estrutura sugerida (editável)                   │
│  ├─ Passo 3: Preview + validação                             │
│  └─ Passo 4: Download .xlsx (+ aba BI opcional)              │
└───────────────┬──────────────────────────────────────────────┘
                │
        ┌───────┴────────┐
        ▼                ▼
 src/criador/ai/    src/criador/engine/
 (server fns)       (100% client, determinístico)
 - suggestSchema    - typeInfer (datas, R$, %, num, lista)
 - suggestKPIs      - csvImport + cleanup
 - explainErrors    - formulaBuilder (SOMA, SE, PROCV…)
                    - chartPicker
                    - biBuilder (aba Resumo)
                    - validator (#REF!, #DIV/0!, vazios)
                    - previewRenderer (HTML grid)
```

A camada `engine/` continua portátil (sem deps do projeto). A camada `ai/` é opcional: roda via `createServerFn` e fala com **Mistral/Ollama na sua VPS** através de uma URL configurável (`OLLAMA_BASE_URL`, `OLLAMA_MODEL`) — fallback automático para o motor determinístico se a IA estiver indisponível.

## 2. Funcionalidades novas

### A. Detecção automática de tipos e fórmulas
- Ao colar uma tabela ou importar CSV, cada coluna é classificada (data BR, moeda R$, %, número, texto, lista/enumerado, e‑mail, CPF/CNPJ).
- Aplica máscara/numFmt correta e cria automaticamente:
  - Linha **Total** (SOMA) para numéricos/moeda
  - **MÉDIA** e **MÁX/MIN** quando faz sentido
  - **SUBTOTAL(9, …)** em conjunto com AutoFilter (totais respeitam filtro)
  - Validações de lista quando detecta enumerado (≤ 12 valores únicos)
  - Formatação condicional: vencidos (datas < hoje), negativos em vermelho, top 10%

### B. Importar CSV / colar + limpeza
- Botão "Colar dados" e "Importar CSV/TSV" (parse client-side, sem upload).
- Limpeza automática: remove duplicatas, normaliza datas (`dd/mm/aaaa`), troca vírgula↔ponto em números BR, remove `R$` e `%`, separa colunas combinadas (heurística por delimitador), trim de espaços.
- Tudo reversível: mostra o que mudou antes de aplicar.

### C. Wizard guiado + IA (Mistral/Ollama)
- Campo "Descreva sua planilha" → server function chama Mistral via Ollama e retorna JSON estruturado `{ titulo, colunas[], formulas[], kpis[], grafico }`.
- 3–5 perguntas curtas (objetivo, periodicidade, métrica principal, agrupamento) refinam o resultado.
- Biblioteca de modelos prontos (executados localmente, sem IA): Fluxo de Caixa, Controle de Estoque, CRM Simples, OKRs, Folha de Horas, Orçamento de Obra, Comissões.
- Fallback: se Ollama offline/timeout → usa heurísticas + templates.

### D. Pré-visualização no navegador
- Antes do download, renderiza as primeiras ~50 linhas como grid HTML estilizado (cabeçalho, formatação, totais, validações destacadas).
- Toggle "Ver aba Resumo/BI" mostra os KPIs e gráficos que serão embutidos.
- Usuário pode editar cabeçalho, tipo de coluna e fórmulas inline antes de gerar.

### E. Validação pré-download
- Varredura determinística: referências quebradas, divisões por zero potenciais, colunas vazias, totais sem base numérica, listas com itens duplicados.
- Cada aviso é clicável e pula para a célula no preview.
- Bloqueia download apenas em erros críticos; warnings são informativos.

### F. Mini-BI / Dashboard automático
Nova aba `Resumo` gerada com:
- **KPIs**: total, média, contagem, crescimento mês a mês (quando há coluna data).
- **Segmentações**: agrupa por colunas categóricas (TopN com `SOMASES`/`CONT.SES`).
- **Gráficos nativos do Excel** via `exceljs` (`addChart` em workbooks XLSX): barra, linha (séries temporais), pizza (composição), conforme `chartPicker` decide pelo tipo dos dados.
- Modo "Transformar em BI": ao escolher 1 coluna de medida + 1 de dimensão + (opcional) coluna de data, gera dashboard completo com filtros (AutoFilter + slicers simulados via validação).
- Saída alternativa: botão "Abrir BI no navegador" renderiza o mesmo dashboard em HTML (Recharts) na própria página, útil para visualizar sem baixar.

### G. Modo personalizável (já existe) — reforço
- Tema da planilha (cor de cabeçalho, fonte, zebra striping), agora aplicado também à aba Resumo.
- Logotipo opcional no topo (data URL embutido na imagem do header — sem upload externo).

## 3. UX do wizard (4 passos)

1. **Origem**: "Descrever em texto" · "Colar tabela" · "Importar CSV" · "Escolher modelo".
2. **Estrutura**: tabela editável de colunas (nome, tipo, fórmula, validação). Botão "Sugerir com IA" e "Sugerir KPIs".
3. **Preview**: grid + lista de avisos + toggle Resumo/BI.
4. **Gerar**: download `.xlsx` e/ou abrir BI no navegador.

Progress bar e navegação Voltar/Avançar mantidas. Persistência em `localStorage` (rascunho).

## 4. Detalhes técnicos

- **Engine determinístico** em `src/criador/engine/*.ts` (puro TS, sem React) — facilita testes unitários e mantém portabilidade.
- **Server functions** em `src/lib/criador-ai.functions.ts`:
  - `suggestSchemaFromText({ description })`
  - `suggestKpisFromColumns({ columns, sampleRows })`
  - Ambas chamam `${OLLAMA_BASE_URL}/api/chat` (modelo `OLLAMA_MODEL`, padrão `mistral`) com `format: "json"` e validam a saída com Zod. Timeout 8 s; em erro retornam `{ fallback: true }` para o cliente usar heurísticas.
- **Secrets necessários** (vou pedir antes de codar): `OLLAMA_BASE_URL` (ex.: `https://ollama.suavps.com`) e opcional `OLLAMA_API_KEY` (Bearer) caso a VPS tenha auth, e `OLLAMA_MODEL` (padrão `mistral`).
- **Gráficos no XLSX**: usar `exceljs` `addChart` (barra/linha/pizza). Para pizza, limitar a 8 fatias + "Outros".
- **CSV parser**: implementação leve própria (≤ 60 linhas) — sem nova dependência.
- **Validação**: roda no engine + reaproveita o esquema antes de chamar `workbook.xlsx.writeBuffer()`.
- **Preview HTML**: componente `<XlsxPreview />` recebe o mesmo `XlsxInput` que vai para o gerador — única fonte de verdade.
- **Correção de bug atual**: importar `file-saver` como default (`import FileSaver from "file-saver"; const { saveAs } = FileSaver;`) em `pptx.ts`, `xlsx.ts`, `word.ts` para resolver o erro SSR de named export.

## 5. Entregáveis

- `src/criador/engine/` (typeInfer, csvImport, formulaBuilder, chartPicker, biBuilder, validator).
- `src/criador/preview/XlsxPreview.tsx` + `BiPreview.tsx` (Recharts).
- `src/criador/templates/` (7 modelos prontos).
- `src/lib/criador-ai.functions.ts` (Ollama/Mistral).
- Atualização de `CriadorApp.tsx` para o novo wizard 4 passos com tab Planilha enriquecida.
- Fix do `file-saver` import nos três geradores.
- Sem mudanças em banco/RLS; sem novas rotas além de `/criador`.

## 6. O que fica fora deste ciclo

- Pagamento por documento (flag `CRIADOR_PRICING_ENABLED` continua `false`).
- Persistência de planilhas no backend (tudo client-side; rascunho em `localStorage`).
- Edição colaborativa multi-usuário.

## 7. Antes de implementar

Vou precisar de:
1. URL da sua VPS Ollama (`OLLAMA_BASE_URL`) e, se houver, chave de acesso.
2. Confirmar o modelo padrão (`mistral`, `mistral:7b-instruct`, `mixtral`?).
3. Confirmar se quer o botão "Abrir BI no navegador" (Recharts) além do dashboard embutido no `.xlsx`.
