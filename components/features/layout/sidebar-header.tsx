import { Logo } from '@/components/shared/logo';

export function SidebarHeader() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Logo variant="icon" size={40} />
      <div className="flex flex-col gap-0.5 text-center">
        <h1 className="text-xl font-bold tracking-tight text-foreground">DisKnee</h1>
        <p className="text-xs text-muted-foreground">Virtual Physiotherapy</p>
      </div>
    </div>
  );
}
