import logoAsset from "@/assets/aprenda-pro-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ className, alt = "Aprenda Pro" }: { className?: string; alt?: string }) {
  return <img src={logoAsset.url} alt={alt} className={cn("h-auto w-auto select-none", className)} draggable={false} />;
}
