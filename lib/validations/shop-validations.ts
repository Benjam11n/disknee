import { z } from "zod";

export const GetShopItemsSchema = z.object({
  activeOnly: z.coerce.boolean().default(true),
});

export const GetUserInventorySchema = z.object({
  userId: z.string(),
});

export const PurchaseItemSchema = z.object({
  itemId: z.string(),
  userId: z.string(),
});

export const EquipItemSchema = z.object({
  equip: z.boolean(),
  itemId: z.string(),
  userId: z.string(),
});
