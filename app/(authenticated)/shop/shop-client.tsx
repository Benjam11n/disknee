'use client';

import { useState, useMemo } from 'react';
import type { ShopItem, UserInventory } from '@prisma/client';
import { toast } from 'sonner';
import { purchaseItemAction, equipItemAction } from '@/lib/actions/shop';
import { ShopHeader } from '@/components/features/shop/shop-header';
import { FeaturedItemsSection } from '@/components/features/shop/featured-items-section';
import { ShopFilters } from '@/components/features/shop/shop-filters';
import { ShopItemsGrid } from '@/components/features/shop/shop-items-grid';
import { ShopInfoCard } from '@/components/features/shop/shop-info-card';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc'>('name');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(shopItems.map((item) => item.type)));
    return ['all', ...cats];
  }, [shopItems]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    const filtered = shopItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.type === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort items
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      return 0;
    });

    return filtered;
  }, [shopItems, searchTerm, selectedCategory, sortBy]);

  // Featured items (most expensive ones)
  const featuredItems = useMemo(() => {
    return shopItems
      .filter((item) => item.price >= 300) // Epic and Legendary items
      .sort((a, b) => b.price - a.price)
      .slice(0, 3);
  }, [shopItems]);

  const handlePurchase = async (itemId: string, price: number) => {
    if (points < price) {
      toast.error('Insufficient points!');
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
        setUserInventory((prev) => [...prev, result.data as UserInventory & { item: ShopItem }]);
        toast.success('Item purchased successfully!');
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Failed to purchase item');
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
        toast.success(equip ? 'Item equipped!' : 'Item unequipped!');
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Failed to update item');
    }
  };

  const getEquippedItems = () => {
    return userInventory.filter((inv) => inv.isEquipped).map((inv) => inv.item);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-8">
        <ShopHeader points={points} equippedItems={getEquippedItems()} />

        <FeaturedItemsSection
          featuredItems={featuredItems}
          userInventory={userInventory}
          userPoints={points}
          isPurchasing={isPurchasing}
          onPurchase={handlePurchase}
          onEquip={handleEquip}
        />

        <ShopFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
          resultsCount={filteredAndSortedItems.length}
        />

        <ShopItemsGrid
          items={filteredAndSortedItems}
          userInventory={userInventory}
          userPoints={points}
          isPurchasing={isPurchasing}
          onPurchase={handlePurchase}
          onEquip={handleEquip}
          hasFilters={Boolean(searchTerm) || selectedCategory !== 'all'}
        />

        {shopItems.length === 0 && (
          <ShopItemsGrid
            items={[]}
            userInventory={userInventory}
            userPoints={points}
            isPurchasing={isPurchasing}
            onPurchase={handlePurchase}
            onEquip={handleEquip}
            hasFilters={false}
          />
        )}

        <ShopInfoCard />
      </div>
    </div>
  );
}
