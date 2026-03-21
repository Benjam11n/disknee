"use server";

import type { ShopItem, UserInventory } from "@prisma/client";

import { action } from "@/lib/handlers/action";
import { handleError } from "@/lib/handlers/error";
import { prisma } from "@/lib/prisma";
import type {
  GetShopItemsParams,
  PurchaseItemParams,
  EquipItemParams,
  GetUserInventoryParams,
} from "@/lib/types/shop";
import {
  GetShopItemsSchema,
  PurchaseItemSchema,
  EquipItemSchema,
  GetUserInventorySchema,
} from "@/lib/validations/shop-validations";

export async function getShopItemsAction(
  params: GetShopItemsParams
): Promise<ActionResponse<ShopItem[]>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: GetShopItemsSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { activeOnly } = validationResult.params!;

  try {
    const items = await prisma.shopItem.findMany({
      orderBy: { price: "asc" },
      where: {
        isActive: activeOnly !== false,
      },
    });

    return { data: items, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserInventoryAction(
  params: GetUserInventoryParams
): Promise<ActionResponse<UserInventory[]>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: GetUserInventorySchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId } = validationResult.params!;

  try {
    const inventory = await prisma.userInventory.findMany({
      include: {
        item: true,
      },
      orderBy: { purchasedAt: "desc" },
      where: { userId },
    });

    return { data: inventory, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function purchaseItemAction(
  params: PurchaseItemParams
): Promise<ActionResponse<UserInventory>> {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: PurchaseItemSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId, itemId } = validationResult.params!;

  try {
    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Get user and item
      const [user, item] = await Promise.all([
        tx.user.findUnique({ where: { id: userId } }),
        tx.shopItem.findUnique({ where: { id: itemId } }),
      ]);

      if (!user || !item) {
        throw new Error("User or item not found");
      }

      if (user.points < item.price) {
        throw new Error("Insufficient points");
      }

      // Check if already owned
      const existing = await tx.userInventory.findUnique({
        where: {
          userId_itemId: {
            itemId,
            userId,
          },
        },
      });

      if (existing) {
        throw new Error("Item already owned");
      }

      // Deduct points
      await tx.user.update({
        data: {
          points: user.points - item.price,
        },
        where: { id: userId },
      });

      // Add to inventory
      const inventoryItem = await tx.userInventory.create({
        data: {
          itemId,
          userId,
        },
        include: {
          item: true,
        },
      });

      return { inventoryItem, item, user };
    });

    return { data: result.inventoryItem, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function equipItemAction(params: EquipItemParams) {
  const validationResult = await action({
    authorize: true,
    params: params,
    schema: EquipItemSchema,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId, itemId, equip } = validationResult.params!;

  try {
    // Get the inventory item
    const inventoryItem = await prisma.userInventory.findUnique({
      include: {
        item: true,
      },
      where: {
        userId_itemId: {
          itemId,
          userId,
        },
      },
    });

    if (!inventoryItem) {
      throw new Error("Item not found in inventory");
    }

    // If equipping, unequip all other items of the same type
    if (equip) {
      await prisma.userInventory.updateMany({
        data: {
          isEquipped: false,
        },
        where: {
          item: {
            type: inventoryItem.item.type,
          },
          userId,
        },
      });
    }

    // Update the item
    const updated = await prisma.userInventory.update({
      data: {
        isEquipped: equip,
      },
      include: {
        item: true,
      },
      where: { id: inventoryItem.id },
    });

    return { data: updated, success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
