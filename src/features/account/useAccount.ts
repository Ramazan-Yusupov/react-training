import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/shared/config/supabase';

export function useAccount() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  useEffect(() => {
    const listener = supabase?.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener?.data.subscription.unsubscribe();
  }, []);
  return user;
}
