import type { PageSections } from "@/lib/page-types";
import { Check, Gift, Sparkles, Target } from "lucide-react";

export function PublicPageRenderer({ sections }: { sections: PageSections }) {
  const hero = sections.hero;
  const heroBg = hero.bg_color || "#0F0A1F";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section
        className="relative overflow-hidden px-6 py-20 sm:py-28"
        style={{ backgroundColor: heroBg }}
      >
        <div
          className="absolute inset-0 opacity-60 pointer-events-none"
          style={{ background: "var(--gradient-hero)" }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          {hero.title && (
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              {hero.title}
            </h1>
          )}
          {hero.subtitle && (
            <p className="mt-6 text-pretty text-lg text-muted-foreground sm:text-xl">
              {hero.subtitle}
            </p>
          )}
          {hero.cta_link && hero.cta_text && (
            <a
              href={hero.cta_link}
              className="mt-10 inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
            >
              {hero.cta_text}
            </a>
          )}
        </div>
      </section>

      {/* Promise */}
      {sections.promise.text && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl rounded-2xl border border-primary/30 bg-primary/10 p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary" strokeWidth={1.5} />
            <p className="mt-4 text-xl font-medium leading-relaxed sm:text-2xl">
              {sections.promise.text}
            </p>
          </div>
        </section>
      )}

      {/* Audience */}
      {sections.audience.text && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex items-center gap-3">
              <Target className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <h2 className="text-2xl font-semibold sm:text-3xl">Para quem é</h2>
            </div>
            <p className="whitespace-pre-line text-lg leading-relaxed text-muted-foreground">
              {sections.audience.text}
            </p>
          </div>
        </section>
      )}

      {/* Modules */}
      {sections.modules.length > 0 && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-10 text-center text-3xl font-semibold sm:text-4xl">
              O que você vai aprender
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {sections.modules.map((m, i) => (
                <div key={i} className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-sm font-semibold text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-lg font-semibold">{m.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{m.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bonuses */}
      {sections.bonuses.length > 0 && (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 flex items-center justify-center gap-3">
              <Gift className="h-7 w-7 text-primary" strokeWidth={1.5} />
              <h2 className="text-3xl font-semibold sm:text-4xl">Bônus exclusivos</h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sections.bonuses.map((b, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-2xl border border-primary/40 p-6"
                  style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--primary) 15%, transparent), color-mix(in oklab, var(--primary-glow) 8%, transparent))" }}
                >
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    <Gift className="h-3 w-3" strokeWidth={2} /> Bônus
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{b.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      {(sections.pricing.launch_price || sections.pricing.cta_link) && (
        <section className="px-6 py-20">
          <div className="mx-auto max-w-2xl">
            <div
              className="rounded-3xl border border-primary/40 p-10 text-center"
              style={{
                background: "linear-gradient(180deg, color-mix(in oklab, var(--primary) 18%, transparent), color-mix(in oklab, var(--primary) 6%, transparent))",
                boxShadow: "var(--shadow-glow)",
              }}
            >
              <p className="text-sm uppercase tracking-wider text-primary-glow">Oferta de lançamento</p>
              {sections.pricing.full_price && (
                <p className="mt-6 text-lg text-muted-foreground line-through">
                  De {sections.pricing.full_price}
                </p>
              )}
              {sections.pricing.launch_price && (
                <p className="mt-1 text-5xl font-bold tracking-tight sm:text-6xl">
                  {sections.pricing.launch_price}
                </p>
              )}
              <ul className="mt-8 space-y-2 text-left text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" strokeWidth={2} /> Acesso imediato após pagamento</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" strokeWidth={2} /> Pagamento seguro</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" strokeWidth={2} /> Garantia incondicional</li>
              </ul>
              {sections.pricing.cta_link && sections.pricing.cta_text && (
                <a
                  href={sections.pricing.cta_link}
                  className="mt-8 inline-flex w-full items-center justify-center rounded-xl px-8 py-4 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {sections.pricing.cta_text}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      {sections.footer.text && (
        <footer className="px-6 py-10 text-center text-sm text-muted-foreground">
          {sections.footer.text}
        </footer>
      )}
    </div>
  );
}
