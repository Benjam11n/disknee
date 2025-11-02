"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShopItem } from "@prisma/client";
import { Coins, Check, ShoppingBag, Sparkles } from "lucide-react";

interface ShopItemCardProps {
  item: ShopItem;
  isOwned: boolean;
  isEquipped: boolean;
  userPoints: number;
  isPurchasing: boolean;
  onPurchase: () => void;
  onEquip: () => void;
}

export function ShopItemCard({
  item,
  isOwned,
  isEquipped,
  userPoints,
  isPurchasing,
  onPurchase,
  onEquip,
}: ShopItemCardProps) {
  const canAfford = userPoints >= item.price;
  const showPurchaseButton = !isOwned && canAfford;
  const showInsufficientFunds = !isOwned && !canAfford;

  return (
    <Card className={`relative overflow-hidden transition-all hover:shadow-md ${
      isOwned ? "ring-2 ring-primary/20" : ""
    } ${isEquipped ? "bg-primary/5" : ""}`}>
      {/* Badge for equipped items */}
      {isEquipped && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="default" className="bg-primary">
            <Sparkles className="h-3 w-3" />
          </Badge>
        </div>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="text-4xl">{item.icon}</div>
          <Badge variant={item.type === "hat" ? "default" : "secondary"}>
            {item.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div>
          <h3 className="font-semibold text-lg">{item.name}</h3>
          {item.description && (
            <p className="text-sm text-muted-foreground">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Coins className="h-4 w-4 text-yellow-600" />
            <span className="font-bold text-lg">{item.price}</span>
          </div>

          {isOwned ? (
            <Button
              onClick={onEquip}
              variant={isEquipped ? "outline" : "default"}
              size="sm"
              className="w-full"
            >
              {isEquipped ? "Unequip" : "Equip"}
            </Button>
          ) : showPurchaseButton ? (
            <Button
              onClick={onPurchase}
              disabled={isPurchasing}
              size="sm"
              className="w-full"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              {isPurchasing ? "Purchasing..." : "Buy"}
            </Button>
          ) : showInsufficientFunds ? (
            <Button disabled size="sm" className="w-full">
              <Coins className="h-4 w-4 mr-2" />
              Insufficient
            </Button>
          ) : null}
        </div>

        {isOwned && (
          <div className="flex items-center gap-1 text-sm text-green-600">
            <Check className="h-4 w-4" />
            <span>Owned</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}