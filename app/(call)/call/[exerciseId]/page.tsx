import { notFound } from 'next/navigation';
import { CallExerciseClient } from './call-exercise-client';
import { getExerciseByIdAction } from '@/lib/actions/exercises';
import { getUserInventoryAction } from '@/lib/actions/shop';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { ShopItem, UserInventory } from '@prisma/client';

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
    const inventoryResponse = await getUserInventoryAction({ userId: session.user.id });
    if (inventoryResponse.success && inventoryResponse.data) {
      equippedItems = inventoryResponse.data
        .filter((item: UserInventory) => item.isEquipped)
        .map((item: UserInventory & { item: ShopItem }) => item.item);
    }
  }

  return <CallExerciseClient exercise={exerciseResponse.data} equippedItems={equippedItems} />;
}
