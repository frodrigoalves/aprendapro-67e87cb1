import type { XlsxColumn } from "../xlsx";
import type { BiOpts } from "./bi";

export interface XlsxBlueprint {
  id: string;
  name: string;
  desc: string;
  title: string;
  columns: XlsxColumn[];
  sample: (string | number | Date | null)[][];
  bi?: BiOpts;
}

const now = new Date();
const daysAgo = (n: number) => new Date(now.getTime() - n * 86400000);

export const BLUEPRINTS: XlsxBlueprint[] = [
  {
    id: "fluxo-caixa",
    name: "Fluxo de Caixa",
    desc: "Entradas, saídas e saldo por data.",
    title: "Fluxo de Caixa",
    columns: [
      { header: "Data", type: "data" },
      { header: "Descrição", type: "texto" },
      { header: "Categoria", type: "lista", list: ["Receita", "Despesa Fixa", "Despesa Variável", "Investimento", "Impostos"] },
      { header: "Entrada", type: "moeda" },
      { header: "Saída", type: "moeda" },
    ],
    sample: [
      [daysAgo(20), "Venda produto A", "Receita", 4500, 0],
      [daysAgo(18), "Aluguel escritório", "Despesa Fixa", 0, 2500],
      [daysAgo(12), "Venda serviço B", "Receita", 7800, 0],
      [daysAgo(8), "Fornecedor X", "Despesa Variável", 0, 1200],
      [daysAgo(3), "Imposto trimestral", "Impostos", 0, 1850],
    ],
    bi: { dimension: "Categoria", measure: "Entrada", date: "Data" },
  },
  {
    id: "estoque",
    name: "Controle de Estoque",
    desc: "Produtos, quantidades e custo médio.",
    title: "Controle de Estoque",
    columns: [
      { header: "SKU", type: "texto" },
      { header: "Produto", type: "texto" },
      { header: "Categoria", type: "lista", list: ["Eletrônicos", "Papelaria", "Limpeza", "Alimentos"] },
      { header: "Quantidade", type: "numero" },
      { header: "Mínimo", type: "numero" },
      { header: "Custo Unit.", type: "moeda" },
    ],
    sample: [
      ["P001", "Caneta esferográfica", "Papelaria", 120, 30, 1.5],
      ["P002", "Caderno A5", "Papelaria", 45, 20, 12.9],
      ["P003", "Detergente 500ml", "Limpeza", 8, 15, 3.2],
      ["P004", "Mouse sem fio", "Eletrônicos", 22, 5, 89.9],
    ],
    bi: { dimension: "Categoria", measure: "Quantidade" },
  },
  {
    id: "crm",
    name: "CRM Simples",
    desc: "Leads, status e valor potencial.",
    title: "CRM",
    columns: [
      { header: "Lead", type: "texto" },
      { header: "Empresa", type: "texto" },
      { header: "Status", type: "lista", list: ["Novo", "Qualificado", "Proposta", "Ganho", "Perdido"] },
      { header: "Origem", type: "lista", list: ["Site", "Indicação", "LinkedIn", "Evento", "Cold call"] },
      { header: "Valor", type: "moeda" },
      { header: "Próximo contato", type: "data" },
    ],
    sample: [
      ["João Silva", "ACME", "Proposta", "Site", 12000, daysAgo(-3)],
      ["Marina Reis", "Beta SA", "Qualificado", "LinkedIn", 8500, daysAgo(-1)],
      ["Pedro Lima", "Gamma", "Ganho", "Indicação", 21500, daysAgo(-10)],
      ["Ana Castro", "Delta", "Novo", "Site", 4200, daysAgo(-7)],
    ],
    bi: { dimension: "Status", measure: "Valor" },
  },
  {
    id: "okr",
    name: "OKRs Trimestrais",
    desc: "Objetivos, key results e progresso.",
    title: "OKRs",
    columns: [
      { header: "Objetivo", type: "texto" },
      { header: "Key Result", type: "texto" },
      { header: "Responsável", type: "texto" },
      { header: "Meta", type: "numero" },
      { header: "Atual", type: "numero" },
      { header: "Progresso", type: "percentual" },
    ],
    sample: [
      ["Expandir base", "100 novos clientes", "Ana", 100, 32, 0.32],
      ["Reduzir churn", "Churn < 2%", "Carlos", 2, 3.1, 0.55],
      ["NPS alto", "NPS > 60", "Marina", 60, 48, 0.8],
    ],
    bi: { dimension: "Responsável", measure: "Progresso" },
  },
  {
    id: "horas",
    name: "Folha de Horas",
    desc: "Horas trabalhadas por projeto.",
    title: "Folha de Horas",
    columns: [
      { header: "Data", type: "data" },
      { header: "Colaborador", type: "texto" },
      { header: "Projeto", type: "texto" },
      { header: "Horas", type: "numero" },
      { header: "Valor/Hora", type: "moeda" },
    ],
    sample: [
      [daysAgo(7), "Carlos", "Site Cliente X", 8, 150],
      [daysAgo(6), "Marina", "App Cliente Y", 6, 180],
      [daysAgo(5), "Carlos", "Site Cliente X", 4, 150],
      [daysAgo(2), "Ana", "App Cliente Y", 5, 200],
    ],
    bi: { dimension: "Projeto", measure: "Horas", date: "Data" },
  },
  {
    id: "obra",
    name: "Orçamento de Obra",
    desc: "Etapas, materiais e custos.",
    title: "Orçamento",
    columns: [
      { header: "Etapa", type: "lista", list: ["Fundação", "Estrutura", "Alvenaria", "Acabamento", "Elétrica", "Hidráulica"] },
      { header: "Item", type: "texto" },
      { header: "Unidade", type: "texto" },
      { header: "Quantidade", type: "numero" },
      { header: "Preço Unit.", type: "moeda" },
    ],
    sample: [
      ["Fundação", "Concreto usinado", "m³", 12, 480],
      ["Estrutura", "Aço CA-50", "kg", 850, 9.8],
      ["Acabamento", "Porcelanato 60x60", "m²", 120, 89],
    ],
    bi: { dimension: "Etapa", measure: "Preço Unit." },
  },
  {
    id: "comissoes",
    name: "Comissões de Vendas",
    desc: "Vendas, meta e comissão por vendedor.",
    title: "Comissões",
    columns: [
      { header: "Vendedor", type: "texto" },
      { header: "Mês", type: "lista", list: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"] },
      { header: "Vendas", type: "moeda" },
      { header: "Meta", type: "moeda" },
      { header: "% Comissão", type: "percentual" },
    ],
    sample: [
      ["Marina", "Jan", 45000, 40000, 0.05],
      ["Carlos", "Jan", 38000, 40000, 0.04],
      ["Ana", "Jan", 52000, 45000, 0.06],
    ],
    bi: { dimension: "Vendedor", measure: "Vendas" },
  },
];
