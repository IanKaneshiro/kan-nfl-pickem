import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 sm:mb-6 tracking-tight">
          NFL Pick&apos;em Challenge
        </h1>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8">
          Compete with your friends by predicting the winners of each NFL game
          every week. Climb the leaderboard and claim bragging rights!
        </p>

        {/* Navigation Button to /picks */}
        <Link href="/picks">
          <button className="px-6 sm:px-8 py-3 sm:py-4 bg-green-600 text-white rounded-lg shadow-lg hover:bg-green-700 transition-all duration-300 text-base sm:text-lg font-semibold">
            Make Your Picks
          </button>
        </Link>
      </div>

      {/* Optional Decorative Element (e.g., Football Texture) */}
      <div className="mt-10 sm:mt-12 text-center">
        <p className="text-sm sm:text-base text-gray-400">
          Ready for the 2025 season? Start picking now!
        </p>
      </div>
    </div>
  );
}
