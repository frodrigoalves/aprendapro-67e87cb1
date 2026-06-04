import { createFileRoute, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getPublicPage } from "@/lib/pages.functions";
import { PublicPageRenderer } from "@/components/public/PublicPageRenderer";
import { emptySections, type PageSections } from "@/lib/page-types";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

// Reserved literal paths that should never match the public slug route
const RESERVED = new Set(["admin", "login", "api", "favicon.ico", "robots.txt", "sitemap.xml"]);

export const Route = createFileRoute("/$slug")({
  loader: async ({ params }) => {
    if (RESERVED.has(params.slug)) throw notFound();
    const page = await getPublicPage({ data: { slug: params.slug } });
    return { page };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.page;
    if (!p) return { meta: [{ title: "Página não encontrada" }] };
    const sections = p.sections as unknown as PageSections;
    const title = sections?.hero?.title || p.product_name;
    const desc = sections?.hero?.subtitle || "";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
      ],
    };
  },
  component: PublicSlugPage,
  notFoundComponent: NotFound,
  errorComponent: NotFound,
});

function PublicSlugPage() {
  const { page } = Route.useLoaderData();
  const { slug } = Route.useParams();
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPreviewMode(new URLSearchParams(window.location.search).get("preview") === "1");
    }
  }, []);

  // Preview mode: fetch draft if user is authenticated
  const { data: previewData } = useQuery({
    queryKey: ["preview", slug],
    enabled: !page && previewMode,
    queryFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return null;
      const { data } = await supabase
        .from("pages")
        .select("product_name, slug, sections")
        .eq("slug", slug)
        .maybeSingle();
      return data;
    },
  });

  const renderPage = page ?? previewData;
  if (!renderPage) return <NotFound />;

  const sections: PageSections = { ...emptySections(), ...(renderPage.sections as unknown as PageSections) };
  return <PublicPageRenderer sections={sections} />;
}

function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 text-center">
      <div>
        <p className="text-7xl font-bold">404</p>
        <p className="mt-3 text-sm text-muted-foreground">Página não encontrada.</p>
      </div>
    </div>
  );
}
