'use client';

import { House, ChartLine, FileText, Gear, User } from "@phosphor-icons/react";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';
import { LogoutButton } from './LogoutButton';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback } from './ui/avatar';

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const links = [
    { href: '/', label: 'Home', icon: House },
    { href: '/analytics', label: 'Analytics', icon: ChartLine },
    { href: '/disputes', label: 'Disputes', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Gear },
  ];

  return (
    <div className="w-64 bg-background h-screen fixed left-0 top-0 border-r border-border flex flex-col">
      <div className="p-6 flex justify-between items-center">
        <h1 className="text-xl font-bold">Dispute Manager</h1>
        <ThemeToggle />
      </div>
      
      <nav className="flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-6 py-3 text-sm ${
                isActive 
                  ? 'text-primary bg-muted border-r-2 border-primary' 
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" weight={isActive ? "fill" : "regular"} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-border">
        <div className="flex items-center space-x-3">
          <Avatar>
            <AvatarFallback>
              {user?.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
          </div>
          <LogoutButton />
        </div>
      </div>
    </div>
  );
}