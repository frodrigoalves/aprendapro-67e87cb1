import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, AdminHeader, NewPageButton } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { FileText, CheckCircle2, FilePen, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  head: () => ({ meta: [{ title: "Dashboard" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["pages-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.from("pages").select("id, status");
      if (error) throw error;
      return data;
    },
  });

  const total = data?.length ?? 0;
  const published = data?.filter((p) => p.status === "published").length ?? 0;
  const drafts = data?.filter((p) => p.status === "draft").length ?? 0;

  const stats = [
    { label: "Total de páginas", value: total, icon: FileText },
    { label: "Publicadas", value: published, icon: CheckCircle2 },
    { label: "Rascunhos", value: drafts, icon: FilePen },
  ];

  return (
    <AdminShell active="dashboard">
      <AdminHeader title="Dashboard" description="Visão geral das suas páginas de vendas." action={<NewPageButton />} />
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <Icon className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <p className="mt-3 text-3xl font-semibold">{s.value}</p>
            </Card>
          );
        })}
      </div>
      <Card className="mt-6 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-medium">Gerenciar páginas</h2>
            <p className="text-sm text-muted-foreground">Crie, edite e publique suas landing pages.</p>
          </div>
          <Link to="/admin/pages" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
            Ver páginas <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </Card>
    </AdminShell>
  );
}
