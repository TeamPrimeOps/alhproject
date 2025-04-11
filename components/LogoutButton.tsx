'use client';

import { SignOut } from "@phosphor-icons/react";
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLogout}
      className="absolute bottom-6 left-6"
    >
      <SignOut className="h-5 w-5" />
      <span className="sr-only">Sign out</span>
    </Button>
  );
}