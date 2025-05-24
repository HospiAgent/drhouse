'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HomeHero } from '@/components/home/hero';
import { HomeFeatures } from '@/components/home/features';
import { HomeCTA } from '@/components/home/cta';
import { MainNav } from '@/components/main-nav';
import { FooterSection } from '@/components/footer-section';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check for authentication token
    const checkAuth = () => {
      // Ensure this only runs in the browser
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('drhouse_auth_token');
        
        // If token exists, redirect to dashboard
        if (token) {
          router.push('/dashboard');
        }
      }
    };

    checkAuth();
  }, [router]); // Include router in dependencies

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <HomeHero />
        <HomeFeatures />
        <HomeCTA />
      </main>
      <FooterSection />
    </div>
  );
}