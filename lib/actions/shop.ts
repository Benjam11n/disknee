"use server";

import { prisma } from "@/lib/prisma";
import { action } from "@/lib/handlers/action";
import { handleError } from "@/lib/handlers/error";
import {
  GetShopItemsSchema,
  PurchaseItemSchema,
  EquipItemSchema,
  GetUserInventorySchema,
} from "@/lib/validations/shop-validations";
import {
  GetShopItemsParams,
  PurchaseItemParams,
  EquipItemParams,
  GetUserInventoryParams,
} from "@/lib/types/shop";
import { ShopItem, UserInventory } from "@prisma/client";

export async function getShopItemsAction(
  params: GetShopItemsParams
): Promise<ActionResponse<ShopItem[]>> {
  const validationResult = await action({
    params: params,
    schema: GetShopItemsSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { activeOnly } = validationResult.params!;

  try {
    const items = await prisma.shopItem.findMany({
      where: {
        isActive: activeOnly !== false,
      },
      orderBy: { price: "asc" },
    });

    return { success: true, data: items };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getUserInventoryAction(
  params: GetUserInventoryParams
): Promise<ActionResponse<UserInventory[]>> {
  const validationResult = await action({
    params: params,
    schema: GetUserInventorySchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId } = validationResult.params!;

  try {
    const inventory = await prisma.userInventory.findMany({
      where: { userId },
      include: {
        item: true,
      },
      orderBy: { purchasedAt: "desc" },
    });

    return { success: true, data: inventory };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function purchaseItemAction(
  params: PurchaseItemParams
): Promise<ActionResponse<UserInventory>> {
  const validationResult = await action({
    params: params,
    schema: PurchaseItemSchema,
    authorize: true,
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
            userId,
            itemId,
          },
        },
      });

      if (existing) {
        throw new Error("Item already owned");
      }

      // Deduct points
      await tx.user.update({
        where: { id: userId },
        data: {
          points: user.points - item.price,
        },
      });

      // Add to inventory
      const inventoryItem = await tx.userInventory.create({
        data: {
          userId,
          itemId,
        },
        include: {
          item: true,
        },
      });

      return { user, item, inventoryItem };
    });

    return { success: true, data: result.inventoryItem };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function equipItemAction(params: EquipItemParams) {
  const validationResult = await action({
    params: params,
    schema: EquipItemSchema,
    authorize: true,
  });

  if (validationResult instanceof Error) {
    return handleError(validationResult) as ErrorResponse;
  }

  const { userId, itemId, equip } = validationResult.params!;

  try {
    // Get the inventory item
    const inventoryItem = await prisma.userInventory.findUnique({
      where: {
        userId_itemId: {
          userId,
          itemId,
        },
      },
      include: {
        item: true,
      },
    });

    if (!inventoryItem) {
      throw new Error("Item not found in inventory");
    }

    // If equipping, unequip all other items of the same type
    if (equip) {
      await prisma.userInventory.updateMany({
        where: {
          userId,
          item: {
            type: inventoryItem.item.type,
          },
        },
        data: {
          isEquipped: false,
        },
      });
    }

    // Update the item
    const updated = await prisma.userInventory.update({
      where: { id: inventoryItem.id },
      data: {
        isEquipped: equip,
      },
      include: {
        item: true,
      },
    });

    return { success: true, data: updated };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}
