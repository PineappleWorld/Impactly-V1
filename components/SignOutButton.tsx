'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface SignOutButtonProps {
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  showIcon?: boolean;
}

export default function SignOutButton({ 
  className = '', 
  variant = 'ghost',
  showIcon = false 
}: SignOutButtonProps) {
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.refresh(); // Refresh to update auth state
    router.push('/'); // Redirect to home
  };

  return (
    <Button 
      onClick={handleSignOut}
      variant={variant}
      className={`hover:bg-red-100 hover:text-red-600 ${className}`}
    >
      {showIcon && <LogOut className="w-4 h-4 mr-2" />}
      Sign Out
    </Button>
  );
}
