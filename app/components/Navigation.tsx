"use client";

import { useEffect, useState } from "react";
import {
  UserButton,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  useAuth,
} from "@clerk/nextjs";
import Link from "next/link";

export default function Navigation() {
  const [isAdmin, setIsAdmin] = useState(false);
  const { userId } = useAuth();
  useEffect(() => {
    const checkAdmin = async () => {
      if (!userId) return;

      try {
        const response = await fetch(`/api/admin/check?userId=${userId}`);
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdmin();
  }, [userId]);

  return (
    <header className="flex justify-between items-center p-4 gap-4 h-16 bg-gray-900 text-white">
      {/* Navigation Section */}
      <div className="flex gap-4 items-center">
        {/* Home Logo */}
        <Link href="/">
          <div className="flex items-center space-x-2 cursor-pointer">
            <span className="text-2xl sm:text-3xl font-bold text-green-600">
              🏈
            </span>
            <span className="text-lg sm:text-xl font-semibold hidden sm:inline">
              NFL Pick&apos;em
            </span>
          </div>
        </Link>

        {/* Picks Link */}
        <Link href="/picks">
          <button className="px-3 py-1 sm:px-4 sm:py-2 text-white rounded-md hover:bg-blue-700 transition-all duration-200 text-sm sm:text-base font-medium">
            Picks
          </button>
        </Link>

        {/* Leaderboard Link */}
        <Link href="/leader-board">
          <button className="px-3 py-1 sm:px-4 sm:py-2 text-white rounded-md hover:bg-blue-700 transition-all duration-200 text-sm sm:text-base font-medium">
            Leader Board
          </button>
        </Link>

        {/* Admin Link - Only shown if user is admin */}
        {isAdmin && (
          <Link href="/admin">
            <button className="px-3 py-1 sm:px-4 sm:py-2 text-white rounded-md bg-red-600 hover:bg-red-700 transition-all duration-200 text-sm sm:text-base font-medium">
              Admin
            </button>
          </Link>
        )}
      </div>

      {/* Auth Section */}
      <div className="flex gap-4 items-center">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton>
            <button className="px-4 py-2 text-white rounded-md hover:bg-blue-700 transition-all duration-200">
              Sign In
            </button>
          </SignInButton>
          <SignUpButton>
            <button className="px-4 py-2 text-white rounded-md hover:bg-blue-700 transition-all duration-200">
              Sign Up
            </button>
          </SignUpButton>
        </SignedOut>
      </div>
    </header>
  );
}
