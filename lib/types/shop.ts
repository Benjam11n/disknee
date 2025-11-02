import { z } from "zod";
import {
  GetShopItemsSchema,
  GetUserInventorySchema,
  PurchaseItemSchema,
  EquipItemSchema,
} from "@/lib/validations/shop-schemas";

export type GetShopItemsParams = z.infer<typeof GetShopItemsSchema>;
export type GetUserInventoryParams = z.infer<typeof GetUserInventorySchema>;
export type PurchaseItemParams = z.infer<typeof PurchaseItemSchema>;
export type EquipItemParams = z.infer<typeof EquipItemSchema>;