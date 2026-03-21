'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { VideoStream } from '@/components/shared/video-stream';
import type { ShopItem } from '@prisma/client';
import { Video, VideoOff } from 'lucide-react';

export function TryOnClient() {
  const searchParams = useSearchParams();
  const itemName = searchParams.get('item_name') || 'Item';
  const itemIcon = searchParams.get('item_icon') || '👑';
  const itemType = searchParams.get('item_type') || 'HAT';

  const mockItem: ShopItem = {
    id: 'try-on-item',
    name: itemName,
    description: 'Trying on this item',
    icon: itemIcon,
    type: itemType,
    price: 0,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const [isVideoOn, setIsVideoOn] = useState(true);

  const equippedHat = mockItem.type === 'HAT' ? mockItem : undefined;
  const equippedGlasses = mockItem.type === 'ACCESSORY' ? mockItem : undefined;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="flex-1 grid grid-cols-1 gap-4 p-6">
        <Card className="relative bg-black overflow-hidden">
          <VideoStream
            isVideoOn={isVideoOn}
            isCallActive={true}
            exerciseId={'simple-squat'}
            crownSettings={{
              emoji: equippedHat?.icon || '👑',
              size: 60,
              yOffset: -60,
            }}
            glassesSettings={{
              emoji: equippedGlasses?.icon || '🕶️',
              size: 100,
              yOffset: 10,
            }}
          />
        </Card>
      </div>
      <div className="border-t bg-background p-6 flex justify-center">
        <Button
          onClick={() => setIsVideoOn((prev) => !prev)}
          variant={isVideoOn ? 'default' : 'secondary'}
          size="lg"
        >
          {isVideoOn ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
}
