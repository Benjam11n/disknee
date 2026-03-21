import type { z } from "zod";

import type {
  GetShopItemsSchema,
  GetUserInventorySchema,
  PurchaseItemSchema,
  EquipItemSchema,
} from "@/lib/validations/shop-validations";

export type GetShopItemsParams = z.infer<typeof GetShopItemsSchema>;
export type GetUserInventoryParams = z.infer<typeof GetUserInventorySchema>;
export type PurchaseItemParams = z.infer<typeof PurchaseItemSchema>;
export type EquipItemParams = z.infer<typeof EquipItemSchema>;
