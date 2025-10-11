'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { createClient } from '@/lib/supabase';
import SignOutButton from '@/components/SignOutButton';

type SocialLink = {
  platform: string;
  url: string;
  display_order: number;
  is_active: boolean;
};

export function SharedHeader() {
  const { user } = useAuth();
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('social_media_links')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (data) {
        setSocialLinks(data);
      }
    } catch (error) {
      console.error('Failed to fetch social links:', error);
    }
  };

  const getSocialIcon = (platform: string) => {
    const iconClass = "w-5 h-5";
    switch (platform.toLowerCase()) {
      case 'telegram':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.099.155.232.171.326.016.093.036.306.02.472z" />
          </svg>
        );
      case 'x':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        );
      case 'tiktok':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>
        );
      case 'instagram':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        );
      case 'facebook':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
          </svg>
        );
      case 'linkedin':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Sparkles className="w-7 h-7 text-emerald-600" />
          <span className="text-2xl font-bold bg-gradient-to-r from-lime-500 via-emerald-600 to-teal-700 text-transparent bg-clip-text tracking-tight">
            Impactly
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/marketplace" className="text-base text-slate-700 hover:text-slate-900 transition-colors font-medium">
            Marketplace
          </Link>
          <Link href="/charities" className="text-base text-slate-700 hover:text-slate-900 transition-colors font-medium">
            Partners
          </Link>
          <Link href="/impact" className="text-base text-slate-700 hover:text-slate-900 transition-colors font-medium">
            Impact
          </Link>

          <div className="flex items-center gap-3 ml-2">
            {socialLinks.filter(l => ['Telegram', 'X', 'LinkedIn'].includes(l.platform)).map((link) => (
              <a
                key={link.platform}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-700 transition-colors"
                aria-label={link.platform}
              >
                {getSocialIcon(link.platform)}
              </a>
            ))}
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <Button className="rounded-full px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm">
                  Profile
                </Button>
              </Link>
              <SignOutButton />
            </div>
          ) : (
            <Link href="/auth">
              <Button className="rounded-full px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-sm">
                Sign In
              </Button>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
