'use client';

import { useEffect, useState } from 'react';

/**
 * Hook to track whether the component has mounted on the client side
 *
 * This hook is useful for preventing hydration mismatches when dealing with
 * client-only features like localStorage, window object, or browser-specific APIs.
 * It returns false during server-side rendering and true after client-side mounting.
 *
 * @returns {boolean} - True if component has mounted on the client, false otherwise
 *
 * @example
 * ```tsx
 * const mounted = useMounted();
 *
 * if (!mounted) {
 *   return <div>Loading...</div>;
 * }
 *
 * return <div>{localStorage.getItem('theme')}</div>;
 * ```
 */
export const useMounted = (): boolean => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
};
