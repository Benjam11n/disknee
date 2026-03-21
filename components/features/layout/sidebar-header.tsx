import { Logo } from '@/components/shared/logo';

export function SidebarHeader() {
  return (
    <div className="flex flex-col items-center justify-center pt-2">
      <Logo variant="icon" size={32} />
      <span className="text-[10px] font-bold tracking-widest text-foreground mt-2 uppercase">
        DisKnee
      </span>
    </div>
  );
}
