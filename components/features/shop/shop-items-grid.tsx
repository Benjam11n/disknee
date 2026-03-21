import type { UserInventory, ShopItem } from "@prisma/client";
import { Sparkles } from "lucide-react";

import { ShopItemCard } from "@/components/features/shop/shop-item-card";
import { Card, CardContent } from "@/components/ui/card";

interface ShopItemsGridProps {
  items: ShopItem[];
  userInventory: (UserInventory & { item: ShopItem })[];
  userPoints: number;
  isPurchasing: string | null;
  onPurchase: (itemId: string, price: number) => void;
  onEquip: (itemId: string, equip: boolean) => void;
  hasFilters?: boolean;
}

export function ShopItemsGrid({
  items,
  userInventory,
  userPoints,
  isPurchasing,
  onPurchase,
  onEquip,
  hasFilters = false,
}: ShopItemsGridProps) {
  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-muted-foreground mb-2">
            {hasFilters ? "No items found" : "No items available"}
          </h3>
          <p className="text-muted-foreground">
            {hasFilters
              ? "Try adjusting your search or filters to find what you're looking for!"
              : "Check back later for new items in the shop!"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
      {items.map((item) => {
        const inventoryItem = userInventory.find(
          (inv) => inv.itemId === item.id
        );
        const isOwned = !!inventoryItem;
        const isEquipped = inventoryItem?.isEquipped || false;

        return (
          <ShopItemCard
            key={item.id}
            item={item}
            isOwned={isOwned}
            isEquipped={isEquipped}
            userPoints={userPoints}
            isPurchasing={isPurchasing === item.id}
            onPurchase={() => onPurchase(item.id, item.price)}
            onEquip={() => onEquip(item.id, !isEquipped)}
          />
        );
      })}
    </div>
  );
}
