"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShopItemCard } from "@/components/shop/shop-item-card";
import { PointsDisplay } from "@/components/shop/points-display";
import { ShopItem, UserInventory } from "@prisma/client";
import { toast } from "sonner";
import { purchaseItemAction, equipItemAction } from "@/lib/actions/shop";
import { Search, Filter, Sparkles, Trophy } from "lucide-react";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc">("name");

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(shopItems.map((item) => item.type)));
    return ["all", ...cats];
  }, [shopItems]);

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = shopItems.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || item.type === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // Sort items
    filtered.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "price-asc") return a.price - b.price;
      if (sortBy === "price-desc") return b.price - a.price;
      return 0;
    });

    return filtered;
  }, [shopItems, searchTerm, selectedCategory, sortBy]);

  // Featured items (most expensive ones)
  const featuredItems = useMemo(() => {
    return shopItems
      .filter(item => item.price >= 300) // Epic and Legendary items
      .sort((a, b) => b.price - a.price)
      .slice(0, 3);
  }, [shopItems]);

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
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Shop
            </h1>
            <p className="text-muted-foreground mt-1">Customize your character with awesome items!</p>
          </div>
          <PointsDisplay points={points} equippedItems={getEquippedItems()} />
        </div>

        {/* Featured Items Section */}
        {featuredItems.length > 0 && (
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
                    userPoints={points}
                    isPurchasing={isPurchasing === item.id}
                    onPurchase={() => handlePurchase(item.id, item.price)}
                    onEquip={() => handleEquip(item.id, !isEquipped)}
                  />
                );
              })}
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Browse Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Category Filters and Sort */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Category Filter */}
              <div className="flex flex-wrap gap-2 flex-1">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className="capitalize"
                  >
                    {category}
                  </Button>
                ))}
              </div>

              {/* Sort Options */}
              <div className="flex gap-2">
                <Button
                  variant={sortBy === "name" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("name")}
                >
                  Name
                </Button>
                <Button
                  variant={sortBy === "price-asc" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("price-asc")}
                >
                  Price ↑
                </Button>
                <Button
                  variant={sortBy === "price-desc" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy("price-desc")}
                >
                  Price ↓
                </Button>
              </div>
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
              {filteredAndSortedItems.length} {filteredAndSortedItems.length === 1 ? "item" : "items"} found
            </div>
          </CardContent>
        </Card>

        {/* Shop Items Grid */}
        {filteredAndSortedItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedItems.map((item) => {
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
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                No items found
              </h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filters to find what you're looking for!
              </p>
            </CardContent>
          </Card>
        )}

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
