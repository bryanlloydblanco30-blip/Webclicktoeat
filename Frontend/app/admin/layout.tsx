// app/admin/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isStaffInOwnArea, setIsStaffInOwnArea] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        console.log('❌ No user found, redirecting to login');
        router.push('/login');
        return;
      }

      try {
        const user = JSON.parse(userStr);
        const role = user.role?.toLowerCase();
        const isStaffArea = pathname?.startsWith('/admin/owneradmin');
        
        console.log('🔍 Auth check:', { username: user.username, role, pathname });
        
        if (isStaffArea) {
          if (role === 'staff' || role === 'admin') {
            console.log('✅ Authorized for staff area');
            setIsStaffInOwnArea(role === 'staff');
            setIsAuthorized(true);
          } else {
            console.log('❌ Not authorized for staff area');
            router.push('/');
          }
        } else {
          if (role === 'admin') {
            console.log('✅ Admin authorized');
            setIsStaffInOwnArea(false);
            setIsAuthorized(true);
          } else if (role === 'staff') {
            console.log('⚠️ Staff redirecting to own area');
            router.push('/admin/owneradmin');
          } else {
            console.log('❌ Not authorized');
            router.push('/');
          }
        }
      } catch (error) {
        console.error('❌ Auth error:', error);
        router.push('/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (!isAuthorized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-red-500 mx-auto"></div>
          <p className="mt-4 text-xl text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Staff users in owneradmin see NO sidebar/navbar
  if (isStaffInOwnArea) {
    console.log('🎯 Rendering staff-only layout');
    return <div className="w-full">{children}</div>;
  }

  // Admin users see full layout
  console.log('🎯 Rendering admin layout');
  return (
    <section className="flex">
      <Sidebar />
      <div className="w-full">
        <Navbar />
        {children}
      </div>
    </section>
  );
}