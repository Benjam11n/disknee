"use client";

import type { ShopItem, UserInventory } from "@prisma/client";
import { useMemo, useReducer, useState } from "react";
import { toast } from "sonner";

import { FeaturedItemsSection } from "@/components/features/shop/featured-items-section";
import { ShopFilters } from "@/components/features/shop/shop-filters";
import { ShopHeader } from "@/components/features/shop/shop-header";
import { ShopInfoCard } from "@/components/features/shop/shop-info-card";
import { ShopItemsGrid } from "@/components/features/shop/shop-items-grid";
import { purchaseItemAction, equipItemAction } from "@/lib/actions/shop";

interface ShopClientProps {
  shopItems: ShopItem[];
  userPoints: number;
  userId: string;
  initialInventory?: (UserInventory & { item: ShopItem })[];
}

const EMPTY_INVENTORY: (UserInventory & { item: ShopItem })[] = [];

interface ShopInventoryState {
  points: number;
  userInventory: (UserInventory & { item: ShopItem })[];
}

type ShopInventoryAction =
  | {
      nextInventory: (UserInventory & { item: ShopItem })[];
      nextPoints: number;
      type: "purchase";
    }
  | {
      equip: boolean;
      item: UserInventory & { item: ShopItem };
      type: "equip";
    };

function shopInventoryReducer(
  state: ShopInventoryState,
  action: ShopInventoryAction
): ShopInventoryState {
  if (action.type === "purchase") {
    return {
      points: action.nextPoints,
      userInventory: action.nextInventory,
    };
  }

  return {
    ...state,
    userInventory: state.userInventory.map((inventoryItem) =>
      inventoryItem.itemId === action.item.itemId
        ? { ...inventoryItem, isEquipped: action.equip }
        : inventoryItem.item.type === action.item.item.type
          ? { ...inventoryItem, isEquipped: false }
          : inventoryItem
    ),
  };
}

export function ShopClient({
  shopItems,
  userPoints,
  userId,
  initialInventory = EMPTY_INVENTORY,
}: ShopClientProps) {
  const [{ points, userInventory }, dispatchInventory] = useReducer(
    shopInventoryReducer,
    {
      points: userPoints,
      userInventory: initialInventory,
    }
  );
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">(
    "name"
  );

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(shopItems.map((item) => item.type))];
    return ["all", ...cats];
  }, [shopItems]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    const filtered = shopItems.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || item.type === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort items
    filtered.sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === "price-asc") {
        return a.price - b.price;
      }
      if (sortBy === "price-desc") {
        return b.price - a.price;
      }
      return 0;
    });

    return filtered;
  }, [shopItems, searchTerm, selectedCategory, sortBy]);

  // Featured items (most expensive ones)
  const featuredItems = useMemo(
    () =>
      shopItems
        .filter((item) => item.price >= 300) // Epic and Legendary items
        .toSorted((a, b) => b.price - a.price)
        .slice(0, 3),
    [shopItems]
  );

  const handlePurchase = async (itemId: string, price: number) => {
    if (points < price) {
      toast.error("Insufficient points!");
      return;
    }

    setIsPurchasing(itemId);

    try {
      const result = await purchaseItemAction({
        itemId,
        userId,
      });

      if (result.success && result.data) {
        const purchasedItem = result.data as UserInventory & { item: ShopItem };
        dispatchInventory({
          nextInventory: [...userInventory, purchasedItem],
          nextPoints: points - price,
          type: "purchase",
        });
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
        equip,
        itemId,
        userId,
      });

      if (result.success && result.data) {
        const equippedItem = result.data as UserInventory & { item: ShopItem };
        dispatchInventory({
          equip,
          item: equippedItem,
          type: "equip",
        });
        toast.success(equip ? "Item equipped!" : "Item unequipped!");
      }
    } catch (error: unknown) {
      toast.error((error as Error).message || "Failed to update item");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-8">
        <ShopHeader points={points} />

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
          hasFilters={Boolean(searchTerm) || selectedCategory !== "all"}
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
