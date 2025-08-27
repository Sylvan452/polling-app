'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/polls');
  }, [router]);
  
  return null; // No UI needed as we're redirecting
}
