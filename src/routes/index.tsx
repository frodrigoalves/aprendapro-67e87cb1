import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, LogIn, Sparkles } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aprenda Pro" },
      { name: "description", content: "Plataforma de landing pages de alta conversão para cursos online." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-hero">
      {/* Decorative blurred blobs */}
      <div aria-hidden className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--brand-blue), transparent 65%)" }} />
      <div aria-hidden className="pointer-events-none absolute top-1/3 -right-40 h-[480px] w-[480px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--brand-azure), transparent 65%)" }} />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/3 h-[520px] w-[520px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--brand-navy), transparent 65%)" }} />

      <header className="relative z-10 flex items-center justify-between px-5 sm:px-10 py-5">
        <Logo className="h-9 sm:h-10" />
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link to="/login">
            <LogIn className="h-4 w-4" strokeWidth={1.5} />
            <span className="hidden sm:inline">Acessar painel</span>
            <span className="sm:hidden">Entrar</span>
          </Link>
        </Button>
      </header>

      <main className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-5 sm:px-8 pt-10 sm:pt-20 pb-24 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 backdrop-blur px-3 py-1 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
          Landing pages de alta conversão
        </span>

        <h1 className="mt-6 text-4xl sm:text-6xl md:text-7xl font-semibold leading-[1.05] tracking-tight">
          Transforme cursos em <br className="hidden sm:block" />
          <span className="text-gradient-brand">vendas previsíveis</span>
        </h1>

        <p className="mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground">
          Crie, publique e otimize páginas de vendas com design profissional e botão direto ao
          Kiwify. Sem distrações, focadas em conversão.
        </p>

        <div className="mt-8 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:w-auto sm:flex-row">
          <Button asChild size="lg" className="shadow-glow">
            <Link to="/login">
              Acessar painel
              <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </Button>
        </div>

        <div className="mt-16 sm:mt-24 grid w-full grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
          {[
            { title: "Editor visual", desc: "Monte páginas em minutos com seções prontas." },
            { title: "Publicação instantânea", desc: "Slug próprio, SEO otimizado e mobile-first." },
            { title: "Conversão direta", desc: "Botão Kiwify integrado em cada CTA." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card/70 backdrop-blur p-5 text-left shadow-elegant">
              <h3 className="text-base font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="relative z-10 border-t border-border/60 bg-background/60 backdrop-blur py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Aprenda Pro
      </footer>
    </div>
  );
}
