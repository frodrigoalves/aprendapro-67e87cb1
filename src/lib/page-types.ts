export type ModuleItem = { title: string; description: string };
export type BonusItem = { title: string; description: string };

export type PageSections = {
  hero: {
    title: string;
    subtitle: string;
    cta_text: string;
    cta_link: string;
    bg_color: string;
  };
  promise: { text: string };
  audience: { text: string };
  modules: ModuleItem[];
  bonuses: BonusItem[];
  pricing: {
    launch_price: string;
    full_price: string;
    cta_text: string;
    cta_link: string;
  };
  footer: { text: string };
};

export const emptySections = (): PageSections => ({
  hero: {
    title: "",
    subtitle: "",
    cta_text: "Quero garantir minha vaga",
    cta_link: "",
    bg_color: "#0B1B3A",
  },
  promise: { text: "" },
  audience: { text: "" },
  modules: [],
  bonuses: [],
  pricing: {
    launch_price: "",
    full_price: "",
    cta_text: "Garantir oferta de lançamento",
    cta_link: "",
  },
  footer: { text: "" },
});

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
