import type { ShopItem } from "@prisma/client";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { getExerciseByIdAction } from "@/lib/actions/exercises";
import { getUserInventoryAction } from "@/lib/actions/shop";
import { auth } from "@/lib/auth";
import type { InventoryWithItem } from "@/lib/types/exercise";

import { CallExerciseClient } from "./call-exercise-client";

export default async function CallExercisePage({ params }: RouteParams) {
  const { exerciseId } = await params;

  const exerciseResponse = await getExerciseByIdAction({ id: exerciseId });

  if (!exerciseResponse.success || !exerciseResponse.data) {
    notFound();
  }

  // Get user session and inventory
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  let equippedItems: ShopItem[] = [];

  if (session?.user) {
    const inventoryResponse = await getUserInventoryAction({
      userId: session.user.id,
    });
    const inventoryData = inventoryResponse.data as InventoryWithItem[];
    if (inventoryResponse.success && inventoryData) {
      equippedItems = inventoryData
        .filter((item: InventoryWithItem) => item.isEquipped)
        .map((item) => item.item);
    }
  }

  return (
    <CallExerciseClient
      exercise={exerciseResponse.data}
      equippedItems={equippedItems}
    />
  );
}
