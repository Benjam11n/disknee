import { PointsDisplay } from '@/components/features/shop/points-display';
import { ShopItem } from '@prisma/client';

interface ShopHeaderProps {
  points: number;
  equippedItems: ShopItem[];
}

export function ShopHeader({ points, equippedItems }: ShopHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Shop
        </h1>
        <p className="text-muted-foreground mt-1">Customize your character with awesome items!</p>
      </div>
      <PointsDisplay points={points} equippedItems={equippedItems} />
    </div>
  );
}
