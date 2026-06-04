import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { LayoutDashboard, FileText, LogOut, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function AdminShell({ children, active }: { children: ReactNode; active?: "dashboard" | "pages" }) {
  const navigate = useNavigate();
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/login", replace: true });
  };

  const nav = [
    { id: "dashboard", to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { id: "pages", to: "/admin/pages", label: "Páginas", icon: FileText },
  ] as const;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex w-60 flex-col border-r border-sidebar-border bg-sidebar p-4">
        <div className="mb-8 flex items-center gap-2 px-2">
          <div className="h-8 w-8 rounded-lg" style={{ background: "var(--gradient-primary)" }} />
          <span className="text-sm font-semibold tracking-tight">LP Manager</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  active === item.id
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={1.5} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="justify-start gap-2">
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Sair
        </Button>
      </aside>
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto max-w-6xl px-6 py-8">{children}</div>
      </main>
    </div>
  );
}

export function AdminHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function NewPageButton() {
  return (
    <Button asChild>
      <Link to="/admin/pages/new">
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        Nova página
      </Link>
    </Button>
  );
}
