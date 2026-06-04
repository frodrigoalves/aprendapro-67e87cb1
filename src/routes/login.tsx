import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { bootstrapAdmin } from "@/lib/bootstrap-admin.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Acesso" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const result = await bootstrapAdmin();
        if (!cancelled && result.created) {
          toast.success(`Usuário admin inicial criado: ${result.email}`);
        }
      } catch (err) {
        console.error("bootstrapAdmin error:", err);
      }
      const { data } = await supabase.auth.getUser();
      if (!cancelled && data.user) navigate({ to: "/admin", replace: true });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    navigate({ to: "/admin", replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10 bg-hero">
      <Card className="w-full max-w-md bg-card/85 backdrop-blur border-border p-6 sm:p-8 shadow-elegant">
        <div className="mb-6 flex flex-col items-center gap-3">
          <Logo className="h-10" />
          <h1 className="text-lg font-semibold tracking-tight">Acesso restrito</h1>
          <p className="text-xs text-muted-foreground">Entre para gerenciar suas landing pages</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
