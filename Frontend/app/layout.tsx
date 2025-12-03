// app/layout.tsx
'use client';

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import { ToastProvider } from "./components/Toast";
import { usePathname } from "next/navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Check if we're on auth or admin pages
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isAdminPage = pathname.startsWith('/admin');

  return (
    <html lang="en">
      <head>
        <title>BSU Food Hub</title>
        <meta name="description" content="Food ordering system for BSU" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ToastProvider>
          {isAuthPage || isAdminPage ? (
            // Auth and Admin pages: no main app sidebar/navbar
            children
          ) : (
            // Regular app pages: show main app sidebar and navbar
            <section className="flex">
              <Sidebar />
              <div className="w-full">
                <Navbar />
                <main>{children}</main>
              </div>
            </section>
          )}
        </ToastProvider>
      </body>
    </html>
  );
}