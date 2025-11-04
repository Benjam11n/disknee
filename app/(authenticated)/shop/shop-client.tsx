"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ShopItemCard } from "@/components/shop/shop-item-card";
import { PointsDisplay } from "@/components/shop/points-display";
import { ShopItem, UserInventory } from "@prisma/client";
import { toast } from "sonner";
import { purchaseItemAction, equipItemAction } from "@/lib/actions/shop";

interface ShopClientProps {
  shopItems: ShopItem[];
  userPoints: number;
  userId: string;
  initialInventory?: (UserInventory & { item: ShopItem })[];
}

export function ShopClient({
  shopItems,
  userPoints,
  userId,
  initialInventory = [],
}: ShopClientProps) {
  const [userInventory, setUserInventory] =
    useState<(UserInventory & { item: ShopItem })[]>(initialInventory);
  const [points, setPoints] = useState(userPoints);
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);

  const handlePurchase = async (itemId: string, price: number) => {
    if (points < price) {
      toast.error("Insufficient points!");
      return;
    }

    setIsPurchasing(itemId);

    try {
      const result = await purchaseItemAction({
        userId,
        itemId,
      });

      if (result.success && result.data) {
        setPoints((prev) => prev - price);
        setUserInventory((prev) => [
          ...prev,
          result.data as UserInventory & { item: ShopItem },
        ]);
        toast.success("Item purchased successfully!");
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to purchase item");
    } finally {
      setIsPurchasing(null);
    }
  };

  const handleEquip = async (itemId: string, equip: boolean) => {
    try {
      const result = await equipItemAction({
        userId,
        itemId,
        equip,
      });

      if (result.success && result.data) {
        const equippedItem = result.data as UserInventory & { item: ShopItem };
        setUserInventory((prev) =>
          prev.map((item) =>
            item.itemId === itemId
              ? { ...item, isEquipped: equip }
              : item.item.type === equippedItem.item.type
              ? { ...item, isEquipped: false }
              : item
          )
        );
        toast.success(equip ? "Item equipped!" : "Item unequipped!");
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to update item");
    }
  };

  const getEquippedItems = () => {
    return userInventory.filter((inv) => inv.isEquipped).map((inv) => inv.item);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Shop</h1>
          <PointsDisplay points={points} equippedItems={getEquippedItems()} />
        </div>

        {/* Shop Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shopItems.map((item) => {
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
                userPoints={points}
                isPurchasing={isPurchasing === item.id}
                onPurchase={() => handlePurchase(item.id, item.price)}
                onEquip={() => handleEquip(item.id, !isEquipped)}
              />
            );
          })}
        </div>

        {/* Empty State */}
        {shopItems.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                No items available
              </h3>
              <p className="text-muted-foreground">
                Check back later for new items in the shop!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Info */}
        <Card className="bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">💡</Badge>
              <h3 className="font-semibold">How to earn points</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Complete exercises and submit reflections to earn points. Each
              session gives you points based on your accuracy, with a bonus for
              leaving feedback!
            </p>
            <Separator className="my-2" />
            <p className="text-sm text-muted-foreground">
              <strong>Score Formula:</strong> (Accuracy × 100) + 20 bonus for
              reflection
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
