"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface ProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const user = useQuery(api.users.currentUser);
  const isAuthenticated = !!user;
  const isLoading = user === undefined;
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect to login with the current path as redirectTo
      const redirectUrl = `${redirectTo}?redirectTo=${encodeURIComponent(pathname)}`;
      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, router, pathname, redirectTo]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="liquid-glass p-8 rounded-m3-xl">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
            <span className="text-body-large text-on-surface-variant">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

// Higher-order component version
export function withAuth<T extends Record<string, unknown>>(
  Component: React.ComponentType<T>,
  redirectTo?: string
) {
  return function AuthenticatedComponent(props: T) {
    return (
      <ProtectedRoute redirectTo={redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
