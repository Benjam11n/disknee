import { ShopItemCard } from "@/components/features/shop/shop-item-card";
import { UserInventory, ShopItem } from "@prisma/client";
import { Trophy } from "lucide-react";

interface FeaturedItemsSectionProps {
  featuredItems: ShopItem[];
  userInventory: (UserInventory & { item: ShopItem })[];
  userPoints: number;
  isPurchasing: string | null;
  onPurchase: (itemId: string, price: number) => void;
  onEquip: (itemId: string, equip: boolean) => void;
}

export function FeaturedItemsSection({
  featuredItems,
  userInventory,
  userPoints,
  isPurchasing,
  onPurchase,
  onEquip,
}: FeaturedItemsSectionProps) {
  if (featuredItems.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-yellow-600" />
        <h2 className="text-2xl font-bold">Featured Items</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featuredItems.map((item) => {
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
    </div>
  );
}
