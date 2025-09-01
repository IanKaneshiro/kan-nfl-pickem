import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import Link from "next/link";
import "./globals.css"; // Assuming you have global styles

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
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
            </div>

            {/* Authentication Buttons */}
            <div className="flex items-center gap-4">
              <SignedOut>
                <SignInButton mode="modal" />
                <SignUpButton mode="modal" />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </header>
          <main>{children}</main> {/* Wrapped content in main for semantics */}
        </body>
      </html>
    </ClerkProvider>
  );
}
