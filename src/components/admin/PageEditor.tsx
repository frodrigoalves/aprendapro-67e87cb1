import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Save, Rocket, Eye, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";
import { emptySections, slugify, type PageSections } from "@/lib/page-types";

type Props = {
  initial?: {
    id: string;
    product_name: string;
    slug: string;
    status: "draft" | "published";
    sections: PageSections;
  };
};

export function PageEditor({ initial }: Props) {
  const navigate = useNavigate();
  const [id, setId] = useState<string | undefined>(initial?.id);
  const [productName, setProductName] = useState(initial?.product_name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!initial);
  const [published, setPublished] = useState(initial?.status === "published");
  const [sections, setSections] = useState<PageSections>(initial?.sections ?? emptySections());
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!slugTouched) setSlug(slugify(productName));
  }, [productName, slugTouched]);

  const save = async (status: "draft" | "published") => {
    if (!productName.trim()) return toast.error("Informe o nome do produto");
    if (!slug.trim()) return toast.error("Slug inválido");
    setSaving(true);
    const payload = {
      product_name: productName.trim(),
      slug: slug.trim(),
      status,
      sections: sections as unknown as Record<string, unknown>,
    };
    try {
      if (id) {
        const { error } = await supabase.from("pages").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("pages").insert(payload).select("id").single();
        if (error) throw error;
        setId(data.id);
        navigate({ to: "/admin/pages/$id/edit", params: { id: data.id }, replace: true });
      }
      setPublished(status === "published");
      toast.success(status === "published" ? "Página publicada" : "Rascunho salvo");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Erro ao salvar";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const updateHero = (k: keyof PageSections["hero"], v: string) =>
    setSections((s) => ({ ...s, hero: { ...s.hero, [k]: v } }));
  const updatePricing = (k: keyof PageSections["pricing"], v: string) =>
    setSections((s) => ({ ...s, pricing: { ...s.pricing, [k]: v } }));

  return (
    <div className="space-y-6 pb-24">
      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <div>
            <Label htmlFor="pname">Nome do produto</Label>
            <Input id="pname" value={productName} onChange={(e) => setProductName(e.target.value)} className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="slug">Slug</Label>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-sm text-muted-foreground">/</span>
              <Input id="slug" value={slug} onChange={(e) => { setSlug(slugify(e.target.value)); setSlugTouched(true); }} />
            </div>
          </div>
        </div>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-xs text-muted-foreground">{published ? "Publicada" : "Rascunho"}</p>
            </div>
            <Switch checked={published} onCheckedChange={(v) => setPublished(v)} />
          </div>
        </Card>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-7">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="promise">Promessa</TabsTrigger>
          <TabsTrigger value="audience">Público</TabsTrigger>
          <TabsTrigger value="modules">Módulos</TabsTrigger>
          <TabsTrigger value="bonuses">Bônus</TabsTrigger>
          <TabsTrigger value="pricing">Preço</TabsTrigger>
          <TabsTrigger value="footer">Rodapé</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-4">
          <Card className="space-y-4 p-5">
            <Field label="Título"><Input value={sections.hero.title} onChange={(e) => updateHero("title", e.target.value)} /></Field>
            <Field label="Subtítulo"><Textarea rows={3} value={sections.hero.subtitle} onChange={(e) => updateHero("subtitle", e.target.value)} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Texto do botão CTA"><Input value={sections.hero.cta_text} onChange={(e) => updateHero("cta_text", e.target.value)} /></Field>
              <Field label="Link do botão CTA (Kiwify)"><Input value={sections.hero.cta_link} onChange={(e) => updateHero("cta_link", e.target.value)} placeholder="https://pay.kiwify.com.br/..." /></Field>
            </div>
            <Field label="Cor de fundo">
              <div className="flex items-center gap-2">
                <Input type="color" value={sections.hero.bg_color} onChange={(e) => updateHero("bg_color", e.target.value)} className="h-10 w-16 p-1" />
                <Input value={sections.hero.bg_color} onChange={(e) => updateHero("bg_color", e.target.value)} />
              </div>
            </Field>
          </Card>
        </TabsContent>

        <TabsContent value="promise" className="mt-4">
          <Card className="p-5">
            <Field label="Texto da promessa">
              <Textarea rows={5} value={sections.promise.text} onChange={(e) => setSections((s) => ({ ...s, promise: { text: e.target.value } }))} />
            </Field>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="mt-4">
          <Card className="p-5">
            <Field label="Para quem é este produto">
              <Textarea rows={5} value={sections.audience.text} onChange={(e) => setSections((s) => ({ ...s, audience: { text: e.target.value } }))} />
            </Field>
          </Card>
        </TabsContent>

        <TabsContent value="modules" className="mt-4">
          <DynamicList
            items={sections.modules}
            onChange={(items) => setSections((s) => ({ ...s, modules: items }))}
            label="módulo"
          />
        </TabsContent>

        <TabsContent value="bonuses" className="mt-4">
          <DynamicList
            items={sections.bonuses}
            onChange={(items) => setSections((s) => ({ ...s, bonuses: items }))}
            label="bônus"
          />
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <Card className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Preço de lançamento"><Input value={sections.pricing.launch_price} onChange={(e) => updatePricing("launch_price", e.target.value)} placeholder="R$ 197" /></Field>
              <Field label="Preço cheio"><Input value={sections.pricing.full_price} onChange={(e) => updatePricing("full_price", e.target.value)} placeholder="R$ 497" /></Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Texto do botão CTA"><Input value={sections.pricing.cta_text} onChange={(e) => updatePricing("cta_text", e.target.value)} /></Field>
              <Field label="Link do botão CTA"><Input value={sections.pricing.cta_link} onChange={(e) => updatePricing("cta_link", e.target.value)} placeholder="https://pay.kiwify.com.br/..." /></Field>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="mt-4">
          <Card className="p-5">
            <Field label="Texto do rodapé">
              <Input value={sections.footer.text} onChange={(e) => setSections((s) => ({ ...s, footer: { text: e.target.value } }))} placeholder="© 2025 Nome do produto" />
            </Field>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/95 backdrop-blur z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-2 px-6 py-3">
          {slug && (
            <Button asChild variant="ghost">
              <a href={`/${slug}${published ? "" : "?preview=1"}`} target="_blank" rel="noreferrer">
                <Eye className="h-4 w-4" strokeWidth={1.5} /> Preview
              </a>
            </Button>
          )}
          <Button variant="outline" disabled={saving} onClick={() => save("draft")}>
            <Save className="h-4 w-4" strokeWidth={1.5} /> Salvar rascunho
          </Button>
          <Button disabled={saving} onClick={() => save("published")}>
            <Rocket className="h-4 w-4" strokeWidth={1.5} /> Publicar
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

function DynamicList({
  items,
  onChange,
  label,
}: {
  items: { title: string; description: string }[];
  onChange: (items: { title: string; description: string }[]) => void;
  label: string;
}) {
  const update = (i: number, k: "title" | "description", v: string) => {
    const next = [...items];
    next[i] = { ...next[i], [k]: v };
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <Card key={i} className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">{label} {i + 1}</span>
            <div className="flex gap-1">
              <Button size="icon" variant="ghost" onClick={() => move(i, -1)} disabled={i === 0}><ArrowUp className="h-4 w-4" strokeWidth={1.5} /></Button>
              <Button size="icon" variant="ghost" onClick={() => move(i, 1)} disabled={i === items.length - 1}><ArrowDown className="h-4 w-4" strokeWidth={1.5} /></Button>
              <Button size="icon" variant="ghost" onClick={() => remove(i)}><Trash2 className="h-4 w-4 text-destructive" strokeWidth={1.5} /></Button>
            </div>
          </div>
          <Input placeholder="Título" value={item.title} onChange={(e) => update(i, "title", e.target.value)} />
          <Textarea rows={3} placeholder="Descrição" value={item.description} onChange={(e) => update(i, "description", e.target.value)} />
        </Card>
      ))}
      <Button variant="outline" onClick={() => onChange([...items, { title: "", description: "" }])}>
        <Plus className="h-4 w-4" strokeWidth={1.5} /> Adicionar {label}
      </Button>
    </div>
  );
}
