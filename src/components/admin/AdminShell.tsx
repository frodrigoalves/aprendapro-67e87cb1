import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import { LayoutDashboard, FileText, LogOut, Plus, Menu } from "lucide-react";
import { useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const NAV = [
  { id: "dashboard", to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { id: "pages", to: "/admin/pages", label: "Páginas", icon: FileText },
] as const;

type Active = "dashboard" | "pages";

function NavList({ active, onNavigate }: { active?: Active; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1">
      {NAV.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.id}
            to={item.to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active === item.id
                ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                : "text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}
          >
            <Icon className="h-4 w-4" strokeWidth={1.5} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children, active }: { children: ReactNode; active?: Active }) {
  const navigate = useNavigate();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.invalidate();
    navigate({ to: "/login", replace: true });
  };

  const SidebarInner = (
    <>
      <Link to="/" className="mb-8 flex items-center px-1">
        <Logo className="h-9" />
      </Link>
      <NavList active={active} onNavigate={() => setOpen(false)} />
      <Button variant="ghost" size="sm" onClick={handleLogout} className="justify-start gap-2">
        <LogOut className="h-4 w-4" strokeWidth={1.5} />
        Sair
      </Button>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden md:flex w-64 flex-col border-r border-sidebar-border bg-sidebar p-4">
        {SidebarInner}
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/85 backdrop-blur px-4 h-14">
          <Link to="/" className="flex items-center">
            <Logo className="h-7" />
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menu">
                <Menu className="h-5 w-5" strokeWidth={1.5} />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-4 flex flex-col bg-sidebar">
              {SidebarInner}
            </SheetContent>
          </Sheet>
        </header>

        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6 sm:py-10">{children}</div>
        </main>
      </div>
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
    <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function NewPageButton() {
  return (
    <Button asChild className="w-full sm:w-auto">
      <Link to="/admin/pages/new">
        <Plus className="h-4 w-4" strokeWidth={1.5} />
        Nova página
      </Link>
    </Button>
  );
}
