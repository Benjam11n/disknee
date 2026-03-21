"use client";

import type { ShopItem } from "@prisma/client";
import {
  Coins,
  Check,
  ShoppingBag,
  Sparkles,
  Lock,
  Star,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ROUTES } from "@/lib/constants/routes";
import { cn } from "@/lib/utils";
import { getRarity } from "@/lib/utils/shop-utils";

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
  const router = useRouter();
  const canAfford = userPoints >= item.price;
  const rarity = getRarity(item.price);
  const isNew =
    Date.now() - new Date(item.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
  const canTryOn =
    (item.type === "HAT" || item.type === "ACCESSORY") && !isOwned;

  const handleTryOn = () => {
    router.push(
      `${ROUTES.TRY_ON}?item_name=${item.name}&item_icon=${item.icon}&item_type=${item.type}`
    );
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-200 hover:shadow-md border-border",
        "bg-card flex flex-col",
        isOwned && "ring-1 ring-primary/30",
        isEquipped && "bg-primary/5",
        !canAfford && !isOwned && "opacity-80"
      )}
    >
      {/* Top badges & Rarity */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10 pointer-events-none">
        <div className="flex flex-col gap-1">
          {isNew && !isOwned && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              NEW
            </Badge>
          )}
          {isEquipped && (
            <Badge
              variant="outline"
              className="text-[10px] px-1.5 py-0 border-primary text-primary bg-background"
            >
              Equipped
            </Badge>
          )}
        </div>
        <div className="flex items-center text-xs font-semibold uppercase tracking-wider opacity-70">
          <Star className="h-3 w-3 mr-1 fill-muted-foreground text-muted-foreground" />
          {rarity.tier}
        </div>
      </div>

      <CardHeader className="pb-2 pt-8 flex-none text-center">
        {/* Item icon wrapper */}
        <div className="flex justify-center mb-2">
          <div className="text-4xl transition-transform group-hover:scale-105 select-none">
            {item.icon}
          </div>
        </div>

        <h3
          className="font-bold text-base leading-tight truncate px-2"
          title={item.name}
        >
          {item.name}
        </h3>
        {item.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 px-4">
            {item.description}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4 pt-1 flex-1 flex flex-col justify-end">
        {/* Price section */}
        <div className="flex items-center justify-center space-x-1.5 pb-2 border-b border-border/40">
          <Coins
            className={cn(
              "h-4 w-4",
              canAfford ? "text-primary" : "text-muted-foreground"
            )}
          />
          <span
            className={cn(
              "font-semibold text-lg leading-none",
              canAfford ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {item.price}
          </span>
        </div>

        {/* Action buttons */}
        <div className="space-y-2 w-full mt-auto">
          {isOwned ? (
            <Button
              onClick={onEquip}
              variant={isEquipped ? "outline-solid" : "default"}
              size="sm"
              className="w-full text-xs h-8"
            >
              {isEquipped ? (
                <>
                  <Check className="h-3.5 w-3.5 mr-1" /> Equipped
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 mr-1" /> Equip
                </>
              )}
            </Button>
          ) : canAfford ? (
            <Button
              onClick={onPurchase}
              disabled={isPurchasing}
              size="sm"
              className="w-full text-xs h-8"
            >
              {isPurchasing ? (
                "Purchasing..."
              ) : (
                <>
                  <ShoppingBag className="h-3.5 w-3.5 mr-1" /> Buy
                </>
              )}
            </Button>
          ) : (
            <Button
              disabled
              variant="outline"
              size="sm"
              className="w-full text-xs h-8"
            >
              <Lock className="h-3.5 w-3.5 mr-1" /> Locked
            </Button>
          )}

          {canTryOn && (
            <Button
              onClick={handleTryOn}
              variant="secondary"
              size="sm"
              className="w-full text-xs h-8"
            >
              <Eye className="h-3.5 w-3.5 mr-1" /> Try On
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
