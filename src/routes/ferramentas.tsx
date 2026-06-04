import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { FileText, Presentation, Sheet, Wrench, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/ferramentas")({
  head: () => ({
    meta: [
      { title: "Ferramentas — Aprenda Pro" },
      { name: "description", content: "Ferramentas profissionais para acelerar seu trabalho." },
    ],
  }),
  component: FerramentasPage,
});

function FerramentasPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card">
            <Wrench className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Ferramentas</h1>
            <p className="text-sm text-muted-foreground">
              Cursos e ferramentas que aceleram sua produção profissional.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            to="/criador"
            className="group rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="text-base font-semibold">Criador</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Documentos, apresentações e planilhas profissionais em minutos.
            </p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
              Abrir <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
          </Link>

          <div className="rounded-xl border border-dashed border-border bg-card/40 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Presentation className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h2 className="text-base font-semibold text-muted-foreground">Em breve</h2>
            <p className="mt-1 text-sm text-muted-foreground">Novas ferramentas em desenvolvimento.</p>
          </div>

          <div className="rounded-xl border border-dashed border-border bg-card/40 p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              <Sheet className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h2 className="text-base font-semibold text-muted-foreground">Em breve</h2>
            <p className="mt-1 text-sm text-muted-foreground">Novas ferramentas em desenvolvimento.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
