import type { ShopItem, UserInventory } from "@prisma/client";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getShopItemsAction } from "@/lib/actions/shop";
import { getUserInventoryAction } from "@/lib/actions/shop";
import { getUserByIdAction } from "@/lib/actions/users";
import { auth } from "@/lib/auth";
import { ROUTES } from "@/lib/constants/routes";

import { ShopClient } from "./shop-client";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Spend earned points on cosmetic rewards and equip items for your sessions.",
};

export default async function ShopPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect(ROUTES.LOGIN);
  }

  const userId = session.user.id;

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
      key={`${userId}:${userPoints}:${userInventory.length}`}
      shopItems={shopItems.data || []}
      userPoints={userPoints}
      userId={userId}
      initialInventory={userInventory as (UserInventory & { item: ShopItem })[]}
    />
  );
}
