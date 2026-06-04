import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminShell, AdminHeader, NewPageButton } from "@/components/admin/AdminShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Eye, ExternalLink, Power } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/pages/")({
  head: () => ({ meta: [{ title: "Páginas" }, { name: "robots", content: "noindex,nofollow" }] }),
  component: PagesListPage,
});

function PagesListPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["pages-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pages")
        .select("id, product_name, slug, status, updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["pages-list"] });
    qc.invalidateQueries({ queryKey: ["pages-stats"] });
  };

  const togglePublish = async (id: string, current: string) => {
    const next = current === "published" ? "draft" : "published";
    const { error } = await supabase.from("pages").update({ status: next }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(next === "published" ? "Página publicada" : "Página despublicada");
    refresh();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("pages").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Página excluída");
    refresh();
  };

  return (
    <AdminShell active="pages">
      <AdminHeader title="Páginas" description="Suas landing pages de vendas." action={<NewPageButton />} />
      <Card className="overflow-hidden p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Atualizada</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">Carregando...</TableCell></TableRow>
            )}
            {!isLoading && data?.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-12">Nenhuma página ainda. Crie a primeira.</TableCell></TableRow>
            )}
            {data?.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="font-medium">{p.product_name || "—"}</TableCell>
                <TableCell className="text-muted-foreground">/{p.slug}</TableCell>
                <TableCell>
                  {p.status === "published" ? (
                    <Badge className="bg-success/15 text-success border-success/30">Publicada</Badge>
                  ) : (
                    <Badge variant="secondary">Rascunho</Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {new Date(p.updated_at).toLocaleDateString("pt-BR")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    {p.status === "published" && (
                      <Button asChild size="icon" variant="ghost" title="Visualizar">
                        <a href={`/${p.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" strokeWidth={1.5} /></a>
                      </Button>
                    )}
                    {p.status === "draft" && (
                      <Button asChild size="icon" variant="ghost" title="Preview">
                        <a href={`/${p.slug}?preview=1`} target="_blank" rel="noreferrer"><Eye className="h-4 w-4" strokeWidth={1.5} /></a>
                      </Button>
                    )}
                    <Button size="icon" variant="ghost" title={p.status === "published" ? "Despublicar" : "Publicar"} onClick={() => togglePublish(p.id, p.status)}>
                      <Power className="h-4 w-4" strokeWidth={1.5} />
                    </Button>
                    <Button asChild size="icon" variant="ghost" title="Editar">
                      <Link to="/admin/pages/$id/edit" params={{ id: p.id }}><Pencil className="h-4 w-4" strokeWidth={1.5} /></Link>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="icon" variant="ghost" title="Excluir"><Trash2 className="h-4 w-4 text-destructive" strokeWidth={1.5} /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir página?</AlertDialogTitle>
                          <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(p.id)}>Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </AdminShell>
  );
}
