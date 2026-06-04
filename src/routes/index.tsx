import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site/SiteHeader";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Aprenda Pro" },
      {
        name: "description",
        content:
          "Plataforma profissional avançada de cursos para você se tornar um profissional de alta performance.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-hero">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 h-[420px] w-[420px] rounded-full opacity-50 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--brand-blue), transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-40 h-[480px] w-[480px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--brand-azure), transparent 65%)" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/3 h-[520px] w-[520px] rounded-full opacity-40 blur-3xl"
        style={{ background: "radial-gradient(circle, var(--brand-navy), transparent 65%)" }}
      />

      <div className="relative z-10">
        <SiteHeader transparent />
        <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-6 text-center">
          <Link to="/" aria-label="Aprenda Pro">
            <Logo className="w-full max-w-md sm:max-w-lg md:max-w-2xl" />
          </Link>
          <p className="mt-8 max-w-xl text-base sm:text-lg text-muted-foreground">
            Plataforma profissional avançada de cursos para você se tornar um profissional de alta
            performance.
          </p>
        </main>
      </div>
    </div>
  );
}
