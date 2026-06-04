// Portable UI primitives for the Criador module.
// Uses ONLY Tailwind classes — no shadcn imports — so the folder can be lifted out.
import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";

function cn(...classes: (string | false | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export const CriadorButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "ghost"; size?: "sm" | "md" }>(
  ({ className, variant = "primary", size = "md", ...rest }, ref) => (
    <button
      ref={ref}
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" ? "h-8 px-3 text-xs" : "h-10 px-4 text-sm",
        variant === "primary" && "bg-neutral-900 text-white hover:bg-neutral-800",
        variant === "outline" && "border border-neutral-300 bg-white text-neutral-900 hover:bg-neutral-50",
        variant === "ghost" && "text-neutral-700 hover:bg-neutral-100",
        className,
      )}
    />
  ),
);
CriadorButton.displayName = "CriadorButton";

export const CriadorInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...rest }, ref) => (
    <input
      ref={ref}
      {...rest}
      className={cn(
        "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200",
        className,
      )}
    />
  ),
);
CriadorInput.displayName = "CriadorInput";

export const CriadorTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...rest }, ref) => (
    <textarea
      ref={ref}
      {...rest}
      className={cn(
        "min-h-[120px] w-full rounded-md border border-neutral-300 bg-white p-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200",
        className,
      )}
    />
  ),
);
CriadorTextarea.displayName = "CriadorTextarea";

export const CriadorSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...rest }, ref) => (
    <select
      ref={ref}
      {...rest}
      className={cn(
        "h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-900 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-200",
        className,
      )}
    >
      {children}
    </select>
  ),
);
CriadorSelect.displayName = "CriadorSelect";

export function CriadorField({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-neutral-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-neutral-500">{hint}</span>}
    </label>
  );
}

export function CriadorCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-neutral-200 bg-white p-6 shadow-sm", className)}>{children}</div>;
}

export function CriadorProgress({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between text-xs text-neutral-500">
        <span>Etapa {step} de {total}</span>
        <span>{pct}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-neutral-200">
        <div className="h-full bg-neutral-900 transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
