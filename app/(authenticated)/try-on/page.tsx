'use client';

import { Suspense } from 'react';
import { TryOnClient } from './try-on-client';

export default function TryOnPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TryOnClient />
    </Suspense>
  );
}
