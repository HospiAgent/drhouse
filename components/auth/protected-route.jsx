"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/auth';

export function ProtectedRoute({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is authenticated
    if (!isAuthenticated()) {
      // Redirect to login if not authenticated
      router.replace('/login');
    } else {
      setLoading(false);
    }
  }, [router]);

  // Show nothing while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If authenticated, render the children
  return children;
}

export function PublicRoute({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is authenticated
    if (isAuthenticated()) {
      // Redirect to dashboard if already authenticated
      router.replace('/dashboard');
    } else {
      setLoading(false);
    }
  }, [router]);

  // Show nothing while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, render the children
  return children;
}
