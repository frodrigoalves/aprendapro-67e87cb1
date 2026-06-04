import { createFileRoute } from "@tanstack/react-router";
import { AdminShell, AdminHeader } from "@/components/admin/AdminShell";
import { PageEditor } from "@/components/admin/PageEditor";

export const Route = createFileRoute("/_authenticated/admin/pages/new")({
  head: () => ({ meta: [{ title: "Nova página" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: NewPage,
});

function NewPage() {
  return (
    <AdminShell active="pages">
      <AdminHeader title="Nova página" description="Crie uma nova landing page de vendas." />
      <PageEditor />
    </AdminShell>
  );
}
