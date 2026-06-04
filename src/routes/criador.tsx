import { createFileRoute } from "@tanstack/react-router";
import { CriadorApp } from "@/criador/CriadorApp";

export const Route = createFileRoute("/criador")({
  head: () => ({
    meta: [
      { title: "Criador — Documentos, Apresentações e Planilhas" },
      {
        name: "description",
        content:
          "Gere documentos Word, apresentações PowerPoint e planilhas Excel profissionais direto do navegador.",
      },
    ],
  }),
  component: CriadorApp,
});
