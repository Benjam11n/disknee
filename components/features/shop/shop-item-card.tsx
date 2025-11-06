'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShopItem } from '@prisma/client';
import { Coins, Check, ShoppingBag, Sparkles, Lock, Star, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { getRarity } from '@/lib/utils/shop-utils';

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
  const isNew = Date.now() - new Date(item.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000; // New if less than 7 days old
  const canTryOn = (item.type === 'HAT' || item.type === 'ACCESSORY') && !isOwned;

  const handleTryOn = () => {
    router.push(
      `${ROUTES.TRY_ON}?item_name=${item.name}&item_icon=${item.icon}&item_type=${item.type}`
    );
  };

  return (
    <Card
      className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer',
        'bg-card dark:bg-gray-900/80 border-border',
        rarity.color,
        rarity.shadow,
        isOwned && 'ring-2 ring-primary/30',
        isEquipped &&
          'bg-gradient-to-br from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10',
        !canAfford && !isOwned && 'opacity-75'
      )}
    >
      {/* Top badges */}
      <div className="absolute top-2 left-2 right-2 z-10 flex justify-between">
        {/* New badge */}
        {isNew && !isOwned && (
          <Badge className="bg-green-500 hover:bg-green-600 text-xs">
            <Star className="h-3 w-3 mr-1" />
            NEW
          </Badge>
        )}

        {/* Equipped badge */}
        {isEquipped && (
          <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black">
            <Sparkles className="h-3 w-3 mr-1" />
            Equipped
          </Badge>
        )}
      </div>

      {/* Rarity stars in corner */}
      <div className="absolute top-2 right-2 z-10">
        <div className="flex">
          {rarity.tier === 'Legendary' && (
            <Star className="h-4 w-4 text-purple-500 dark:text-purple-400 fill-purple-500 dark:fill-purple-400" />
          )}
          {rarity.tier === 'Epic' && (
            <>
              <Star className="h-4 w-4 text-indigo-500 dark:text-indigo-400 fill-indigo-500 dark:fill-indigo-400" />
              <Star className="h-4 w-4 text-indigo-500 dark:text-indigo-400 fill-indigo-500 dark:fill-indigo-400 -ml-1" />
            </>
          )}
          {rarity.tier === 'Rare' && (
            <>
              <Star className="h-4 w-4 text-blue-500 dark:text-blue-400 fill-blue-500 dark:fill-blue-400" />
              <Star className="h-4 w-4 text-blue-500 dark:text-blue-400 fill-blue-500 dark:fill-blue-400 -ml-1" />
              <Star className="h-4 w-4 text-blue-500 dark:text-blue-400 fill-blue-500 dark:fill-blue-400 -ml-1" />
            </>
          )}
        </div>
      </div>

      <CardHeader className="pb-3 pt-12">
        <div className="flex flex-col items-center space-y-3">
          {/* Item icon with hover effect */}
          <div className="relative">
            <div className="text-6xl transition-transform group-hover:scale-110">{item.icon}</div>
            {/* Shimmer effect for rare items */}
            {rarity.tier !== 'Common' && (
              <div className="absolute inset-0 animate-pulse opacity-30">
                <div className="text-6xl blur-xl">{item.icon}</div>
              </div>
            )}
          </div>

          {/* Item type badge */}
          <Badge variant={item.type === 'hat' ? 'default' : 'secondary'} className="text-xs">
            {item.type}
          </Badge>

          {/* Rarity text */}
          <span className={cn('text-xs font-semibold uppercase tracking-wider', rarity.textColor)}>
            {rarity.tier}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div className="text-center">
          <h3 className="font-bold text-lg">{item.name}</h3>
          {item.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
          )}
        </div>

        {/* Price section */}
        <div className="flex items-center justify-center space-x-2">
          <Coins
            className={cn(
              'h-5 w-5',
              canAfford
                ? 'text-yellow-600 dark:text-yellow-400'
                : 'text-gray-400 dark:text-gray-500'
            )}
          />
          <span
            className={cn(
              'font-bold text-2xl',
              canAfford
                ? 'text-yellow-700 dark:text-yellow-400'
                : 'text-gray-500 dark:text-gray-400'
            )}
          >
            {item.price}
          </span>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          {isOwned ? (
            <Button
              onClick={onEquip}
              variant={isEquipped ? 'outline' : 'default'}
              size="sm"
              className="w-full"
            >
              {isEquipped ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Equipped
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Equip
                </>
              )}
            </Button>
          ) : canAfford ? (
            <Button
              onClick={onPurchase}
              disabled={isPurchasing}
              size="sm"
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
            >
              {isPurchasing ? (
                <>Purchasing...</>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Buy Now
                </>
              )}
            </Button>
          ) : (
            <Button disabled size="sm" className="w-full relative">
              <Lock className="h-4 w-4 mr-2" />
              <span className="mr-2">Locked</span>
              <span className="text-xs">Need {item.price - userPoints} more</span>
            </Button>
          )}
        </div>

        {canTryOn && (
          <Button onClick={handleTryOn} variant="outline" size="sm" className="w-full">
            <Eye className="h-4 w-4 mr-2" />
            Try On
          </Button>
        )}

        {/* Owned indicator */}
        {isOwned && (
          <div className="flex items-center justify-center gap-1 text-sm text-green-600 dark:text-green-400 font-medium">
            <Check className="h-4 w-4" />
            <span>In Inventory</span>
          </div>
        )}
      </CardContent>

      {/* Gradient overlay for locked items */}
      {!canAfford && !isOwned && (
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px]" />
      )}
    </Card>
  );
}
