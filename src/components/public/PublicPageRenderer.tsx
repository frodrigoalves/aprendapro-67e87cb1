import type { PageSections } from "@/lib/page-types";
import { Check, Gift, Sparkles, Target } from "lucide-react";

export function PublicPageRenderer({ sections }: { sections: PageSections }) {
  const hero = sections.hero;
  // Default to a corporate dark navy if not customized
  const heroBg = hero.bg_color || "#0B1B3A";

  // Kiwify CTA opens in a new tab so the sales page is never abandoned by accident
  const ctaProps = {
    target: "_blank" as const,
    rel: "noopener noreferrer" as const,
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      {/* Hero — text colors forced to white so any dark bg color stays readable */}
      <section
        className="relative overflow-hidden px-5 sm:px-6 py-16 sm:py-24 md:py-28 text-white"
        style={{ backgroundColor: heroBg, backgroundImage: "var(--gradient-hero-dark)" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-40 pointer-events-none"
          style={{
            background:
              "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, white 12%, transparent), transparent 70%)",
          }}
        />
        <div className="relative mx-auto max-w-3xl text-center">
          {hero.title && (
            <h1 className="text-balance text-3xl sm:text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight">
              {hero.title}
            </h1>
          )}
          {hero.subtitle && (
            <p className="mt-5 sm:mt-6 text-pretty text-base sm:text-lg md:text-xl text-white/75 leading-relaxed">
              {hero.subtitle}
            </p>
          )}
          {hero.cta_link && hero.cta_text && (
            <a
              href={hero.cta_link}
              {...ctaProps}
              className="mt-8 sm:mt-10 inline-flex w-full sm:w-auto items-center justify-center rounded-xl px-7 py-4 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.99]"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
            >
              {hero.cta_text}
            </a>
          )}
        </div>
      </section>

      {/* Promise */}
      {sections.promise.text && (
        <section className="px-5 sm:px-6 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-6 sm:p-8 text-center shadow-elegant">
            <Sparkles className="mx-auto h-7 w-7 text-primary" strokeWidth={1.5} />
            <p className="mt-4 text-lg sm:text-xl md:text-2xl font-medium leading-relaxed text-foreground">
              {sections.promise.text}
            </p>
          </div>
        </section>
      )}

      {/* Audience */}
      {sections.audience.text && (
        <section className="px-5 sm:px-6 py-12 sm:py-16">
          <div className="mx-auto max-w-3xl">
            <div className="mb-5 sm:mb-6 flex items-center gap-3">
              <Target className="h-6 w-6 text-primary" strokeWidth={1.5} />
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">Para quem é</h2>
            </div>
            <p className="whitespace-pre-line text-base sm:text-lg leading-relaxed text-muted-foreground">
              {sections.audience.text}
            </p>
          </div>
        </section>
      )}

      {/* Modules */}
      {sections.modules.length > 0 && (
        <section className="px-5 sm:px-6 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 sm:mb-10 text-center text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
              O que você vai aprender
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {sections.modules.map((m, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-border bg-card p-5 sm:p-6 transition-colors hover:border-primary/40"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-semibold text-primary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="text-base sm:text-lg font-semibold">{m.title}</h3>
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
        <section className="px-5 sm:px-6 py-12 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 sm:mb-10 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <Gift className="h-7 w-7 text-primary" strokeWidth={1.5} />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-center">
                Bônus exclusivos
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sections.bonuses.map((b, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden rounded-2xl border border-primary/25 bg-card p-5 sm:p-6"
                  style={{
                    background:
                      "linear-gradient(135deg, color-mix(in oklab, var(--primary) 8%, var(--card)), var(--card))",
                  }}
                >
                  <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                    <Gift className="h-3 w-3" strokeWidth={2} /> Bônus
                  </div>
                  <h3 className="mb-2 text-base sm:text-lg font-semibold">{b.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      {(sections.pricing.launch_price || sections.pricing.cta_link) && (
        <section className="px-5 sm:px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-2xl">
            <div
              className="rounded-3xl border border-primary/25 bg-card p-6 sm:p-10 text-center shadow-elegant"
              style={{
                background:
                  "linear-gradient(180deg, color-mix(in oklab, var(--primary) 6%, var(--card)), var(--card))",
              }}
            >
              <p className="text-xs sm:text-sm uppercase tracking-[0.18em] text-primary font-semibold">
                Oferta de lançamento
              </p>
              {sections.pricing.full_price && (
                <p className="mt-5 sm:mt-6 text-base sm:text-lg text-muted-foreground line-through">
                  De {sections.pricing.full_price}
                </p>
              )}
              {sections.pricing.launch_price && (
                <p className="mt-1 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground">
                  {sections.pricing.launch_price}
                </p>
              )}
              <ul className="mt-6 sm:mt-8 space-y-2 text-left text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={2} /> Acesso imediato após pagamento
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={2} /> Pagamento seguro
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-primary shrink-0" strokeWidth={2} /> Garantia incondicional
                </li>
              </ul>
              {sections.pricing.cta_link && sections.pricing.cta_text && (
                <a
                  href={sections.pricing.cta_link}
                  {...ctaProps}
                  className="mt-7 sm:mt-8 inline-flex w-full items-center justify-center rounded-xl px-8 py-4 text-base font-semibold text-primary-foreground transition-transform hover:scale-[1.02] active:scale-[0.99]"
                  style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow)" }}
                >
                  {sections.pricing.cta_text}
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer — plain text only, no navigation */}
      {sections.footer.text && (
        <footer className="px-5 sm:px-6 py-8 sm:py-10 text-center text-xs sm:text-sm text-muted-foreground">
          {sections.footer.text}
        </footer>
      )}
    </div>
  );
}
