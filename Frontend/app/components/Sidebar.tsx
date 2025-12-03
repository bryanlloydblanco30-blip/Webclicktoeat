"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // Clear all user data
    localStorage.removeItem('user');
    localStorage.removeItem('cart_session_id');
    localStorage.removeItem('session_id');
    
    // Redirect to login
    router.push('/login');
  };

  const menuItems = [
    { name: "Home", icon: "/home.png", href: "/" },
    { name: "My Cart", icon: "/shopping-cart.png", href: "/mycart" },
    { name: "History", icon: "/history.png", href: "/history" },
    { name: "Favorites", icon: "/heart.png", href: "/favorites" },
    { name: "Food Partner", icon: "/fork.png", href: "/partners" },
  ];

  return (
    <aside className="pt-3 shadow-md sticky top-0 h-screen">
      <div className="flex items-center p-5">
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={150} height={30} />
        </Link>
      </div>

      {menuItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-10 py-4 cursor-pointer transition ${
              isActive
                ? "bg-red-100 border-l-4 border-red-600 text-main-red font-semibold"
                : "hover:bg-gray-100"
            }`}
          >
            <Image src={item.icon} width={20} height={20} alt={item.name} />
            <h3 className="ml-3">{item.name}</h3>
          </Link>
        );
      })}

      {/* Logout button - not a Link, but a button */}
      <button
        onClick={handleLogout}
        className="flex items-center px-10 py-4 cursor-pointer transition hover:bg-gray-100 w-full text-left"
      >
        <Image src="/logout.png" width={20} height={20} alt="Logout" />
        <h3 className="ml-3">Logout</h3>
      </button>
    </aside>
  );
}