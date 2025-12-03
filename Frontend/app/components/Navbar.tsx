'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Load user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('cart_session_id');
    setShowDropdown(false);
    router.push('/login');
  };

  return (
    <nav className="m-3">
      <section className="flex justify-end space-left-right">
        <div className="flex items-center gap-3 relative">
          {user ? (
            <>
              {/* User Info Display */}
              <div className="flex flex-col items-end">
                <p className="font-semibold text-gray-900 text-sm">
                  {user.full_name || user.username}
                </p>
                {user.sr_code && (
                  <p className="text-xs text-gray-500">
                    {user.sr_code}
                  </p>
                )}
              </div>

              {/* User Avatar with Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="focus:outline-none"
                >
                  <Image 
                    src="/user.png" 
                    alt="User" 
                    width={35} 
                    height={35}
                    className="cursor-pointer hover:opacity-80 transition"
                  />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDropdown(false)}
                    />
                    
                    {/* Menu */}
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      {/* User Email */}
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>

                      {/* Menu Items */}
                      <Link
                        href="/history"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setShowDropdown(false)}
                      >
                        <div className="flex items-center gap-2">
                          <span>📋</span>
                          Order History
                        </div>
                      </Link>

                      <Link
                        href="/favorites"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                        onClick={() => setShowDropdown(false)}
                      >
                        <div className="flex items-center gap-2">
                          <span>❤️</span>
                          Favorites
                        </div>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition border-t border-gray-100 mt-1"
                      >
                        <div className="flex items-center gap-2">
                          <span>🚪</span>
                          Logout
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Guest - Show Login Button */}
              <Link
                href="/login"
                className="bg-main-red hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-white hover:bg-gray-50 text-main-red border-2 border-main-red px-4 py-2 rounded-lg font-semibold transition"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </section>
    </nav>
  );
}