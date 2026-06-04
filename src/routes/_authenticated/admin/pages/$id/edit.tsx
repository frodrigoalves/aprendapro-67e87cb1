import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, AdminHeader } from "@/components/admin/AdminShell";
import { PageEditor } from "@/components/admin/PageEditor";
import { emptySections, type PageSections } from "@/lib/page-types";

export const Route = createFileRoute("/_authenticated/admin/pages/$id/edit")({
  head: () => ({ meta: [{ title: "Editar página" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const { data, isLoading, error } = useQuery({
    queryKey: ["page", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  return (
    <AdminShell active="pages">
      <AdminHeader title="Editar página" description={data?.product_name ?? ""} />
      {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
      {error && <p className="text-sm text-destructive">Erro ao carregar.</p>}
      {data && (
        <PageEditor
          initial={{
            id: data.id,
            product_name: data.product_name,
            slug: data.slug,
            status: data.status as "draft" | "published",
            sections: { ...emptySections(), ...(data.sections as unknown as PageSections) },
          }}
        />
      )}
    </AdminShell>
  );
}
