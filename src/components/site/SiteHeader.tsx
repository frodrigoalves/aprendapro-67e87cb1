import { Link } from "@tanstack/react-router";
import { GraduationCap, Wrench, LogIn, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const links = [
  { to: "/cursos", label: "Cursos", icon: GraduationCap },
  { to: "/ferramentas", label: "Ferramentas", icon: Wrench },
  { to: "/login", label: "Acesso", icon: LogIn },
] as const;

export function SiteHeader({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-colors",
        transparent
          ? "border-transparent bg-background/40 backdrop-blur-md"
          : "border-border bg-background/85 backdrop-blur",
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center" aria-label="Início">
          <Logo className="h-8" />
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.to}
                to={l.to}
                className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-foreground/75 transition-colors hover:bg-accent hover:text-foreground"
                activeProps={{ className: "text-foreground bg-accent" }}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {l.label}
              </Link>
            );
          })}
        </nav>

        <button
          className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {open ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="mx-auto flex w-full max-w-7xl flex-col gap-1 px-4 py-3">
            {links.map((l) => {
              const Icon = l.icon;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium text-foreground/80 hover:bg-accent"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
