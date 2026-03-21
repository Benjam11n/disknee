import type { ShopItem } from "@prisma/client";

import { PointsDisplay } from "@/components/features/shop/points-display";

interface ShopHeaderProps {
  points: number;
  equippedItems: ShopItem[];
}

export function ShopHeader({ points, equippedItems }: ShopHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Shop
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Customize your character with awesome items!
        </p>
      </div>
      <PointsDisplay points={points} equippedItems={equippedItems} />
    </div>
  );
}
