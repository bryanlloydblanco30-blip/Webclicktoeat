'use client';

import Image from "next/image";
import { useEffect, useState } from "react";

export default function AdminNavbar() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Get user from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 md:py-4">
      <section className="flex justify-between items-center gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 truncate">
            Admin Dashboard
          </h2>
          <p className="text-xs md:text-sm text-gray-500 hidden sm:block">
            Manage your food ordering system
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
              {user ? user.username : 'Admin'}
            </p>
            <p className="text-xs text-gray-500">Administrator</p>
          </div>
          <Image 
            src="/user.png" 
            alt="Admin" 
            width={40} 
            height={40}
            className="rounded-full flex-shrink-0"
            onError={(e) => {
              // Fallback if image doesn't exist
              e.currentTarget.style.display = 'none';
              const div = document.createElement('div');
              div.className = 'w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white font-bold';
              div.textContent = user?.username?.charAt(0).toUpperCase() || 'A';
              e.currentTarget.parentElement!.appendChild(div);
            }}
          />
        </div>
      </section>
    </nav>
  );
}