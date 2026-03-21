import { Logo } from "@/components/shared/logo";

export function SidebarHeader() {
  return (
    <div className="flex flex-row items-center justify-start gap-4 pt-1 px-2">
      <Logo variant="icon" size={28} />
      <span className="text-sm font-bold tracking-wider text-foreground uppercase truncate">
        DisKnee
      </span>
    </div>
  );
}
