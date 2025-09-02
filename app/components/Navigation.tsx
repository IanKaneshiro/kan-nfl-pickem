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
  const [menuOpen, setMenuOpen] = useState(false);
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

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="relative flex justify-between items-center p-4 gap-4 h-16 bg-gray-900 text-white">
      {/* Navigation Section */}
      <div className="flex gap-4 items-center">
        {/* Home Logo */}
        <Link href="/" onClick={closeMenu}>
          <div className="flex items-center space-x-2 cursor-pointer">
            <span className="text-2xl sm:text-3xl font-bold text-green-600">
              🏈
            </span>
            <span className="text-lg sm:text-xl font-semibold hidden sm:inline">
              NFL Pick&apos;em
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-4 items-center">
          {/* Picks Link */}
          <Link href="/picks">
            <button className="px-3 py-1 sm:px-4 sm:py-2 text-white rounded-md hover:bg-blue-700 transition-all duration-200 text-sm sm:text-base font-medium">
              Picks
            </button>
          </Link>

          {/* Trends Link */}
          <Link href="/trends">
            <button className="px-3 py-1 sm:px-4 sm:py-2 text-white rounded-md hover:bg-blue-700 transition-all duration-200 text-sm sm:text-base font-medium">
              Trends
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

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-white hover:bg-gray-800 rounded-md transition-colors"
          aria-label="Toggle menu"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
            />
          </svg>
        </button>
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

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="absolute top-16 left-0 w-full bg-gray-900 border-t border-gray-700 md:hidden z-50">
          <div className="flex flex-col p-4 space-y-2">
            {/* Picks Link */}
            <Link href="/picks" onClick={closeMenu}>
              <button className="w-full text-left px-4 py-3 text-white rounded-md hover:bg-blue-700 transition-all duration-200 font-medium">
                Picks
              </button>
            </Link>

            {/* Trends Link */}
            <Link href="/trends" onClick={closeMenu}>
              <button className="w-full text-left px-4 py-3 text-white rounded-md hover:bg-blue-700 transition-all duration-200 font-medium">
                Trends
              </button>
            </Link>

            {/* Leaderboard Link */}
            <Link href="/leader-board" onClick={closeMenu}>
              <button className="w-full text-left px-4 py-3 text-white rounded-md hover:bg-blue-700 transition-all duration-200 font-medium">
                Leader Board
              </button>
            </Link>

            {/* Admin Link - Only shown if user is admin */}
            {isAdmin && (
              <Link href="/admin" onClick={closeMenu}>
                <button className="w-full text-left px-4 py-3 text-white rounded-md bg-red-600 hover:bg-red-700 transition-all duration-200 font-medium">
                  Admin
                </button>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
