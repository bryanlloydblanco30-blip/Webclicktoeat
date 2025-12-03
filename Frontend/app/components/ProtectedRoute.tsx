'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'staff' | 'member';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const verifyAuth = () => {
      // Don't check auth on public pages
      const publicPages = ['/login', '/signup'];
      if (publicPages.includes(pathname)) {
        setIsChecking(false);
        setIsAuthorized(true);
        return;
      }

      try {
        // Get user from localStorage
        const userStr = localStorage.getItem('user');
        
        if (!userStr) {
          // Not logged in - redirect to login
          console.log('❌ No user found - redirecting to login');
          setIsAuthorized(false);
          setIsChecking(false);
          router.push('/login');
          return;
        }

        const user = JSON.parse(userStr);
        console.log('✅ User found:', user.role);

        // Check role if specified
        if (requiredRole && user.role !== requiredRole) {
          console.log(`⚠️ Role mismatch: Required ${requiredRole}, got ${user.role}`);
          setIsAuthorized(false);
          setIsChecking(false);
          
          // Redirect to appropriate page based on their actual role
          if (user.role === 'admin') {
            router.push('/admin');
          } else if (user.role === 'staff') {
            router.push('/partners');
          } else {
            router.push('/');
          }
          return;
        }

        // User is authorized
        console.log('✅ User authorized');
        setIsAuthorized(true);
        setIsChecking(false);
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        localStorage.removeItem('user'); // Clear invalid data
        setIsAuthorized(false);
        setIsChecking(false);
        router.push('/login');
      }
    };

    verifyAuth();
  }, [pathname, router, requiredRole]); // Include all dependencies

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying access...</p>
        </div>
      </div>
    );
  }

  return isAuthorized ? <>{children}</> : null;
}