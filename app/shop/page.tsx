import { getShopItemsAction } from "@/lib/actions/shop";
import { getUserByIdAction } from "@/lib/actions/users";
import { getUserInventoryAction } from "@/lib/actions/shop";
import { ShopClient } from "./ShopClient";
import { ShopItem, UserInventory } from "@prisma/client";
import { notFound } from "next/navigation";
import { getCurrentUserId } from "@/lib/constants/users";

const userId = getCurrentUserId();

export default async function ShopPage() {
  const shopItems = await getShopItemsAction({ activeOnly: true });

  if (!shopItems.success) {
    throw new Error(shopItems.error?.message || `Failed to fetch shop items`);
  }

  if (!shopItems.data) {
    return notFound();
  }

  const userResponse = await getUserByIdAction({ userId });

  if (!userResponse.success) {
    throw new Error(userResponse.error?.message || `Failed to fetch user data`);
  }

  if (!userResponse.data) {
    return notFound();
  }
  const userPoints = userResponse.data?.points || 0;

  const inventoryResponse = await getUserInventoryAction({ userId });
  const userInventory = inventoryResponse.success
    ? inventoryResponse.data || []
    : [];

  return (
    <ShopClient
      shopItems={shopItems.data || []}
      userPoints={userPoints}
      userId={userId}
      initialInventory={userInventory as (UserInventory & { item: ShopItem })[]}
    />
  );
}
