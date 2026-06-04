import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { GraduationCap } from "lucide-react";

export const Route = createFileRoute("/cursos")({
  head: () => ({
    meta: [
      { title: "Cursos — Aprenda Pro" },
      { name: "description", content: "Todos os cursos em atividade da plataforma Aprenda Pro." },
    ],
  }),
  component: CursosPage,
});

function CursosPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card">
            <GraduationCap className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Cursos</h1>
            <p className="text-sm text-muted-foreground">Catálogo de cursos em atividade.</p>
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Em breve novos cursos serão publicados aqui.
          </p>
        </div>
      </main>
    </div>
  );
}
