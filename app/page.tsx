import Link from "next/link";
import { getCurrentNFLWeek, formatNFLWeekDisplay } from "@/utils/nflSeason";

export default function Home() {
  const currentWeek = getCurrentNFLWeek();

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="text-center max-w-4xl">
        <div className="text-6xl sm:text-7xl lg:text-8xl mb-6">🏈</div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 tracking-tight">
          NFL Pick&apos;em Challenge
        </h1>
        <div className="text-lg sm:text-xl text-green-400 mb-6 font-semibold">
          🗓️ {formatNFLWeekDisplay(currentWeek)}
        </div>
        <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mb-8 sm:mb-10 leading-relaxed">
          Compete with your friends by predicting the winners of each NFL game
          every week. Climb the leaderboard and claim bragging rights!
        </p>

        {/* Call to Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/picks">
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl shadow-lg hover:from-green-700 hover:to-green-800 transition-all duration-300 text-lg font-semibold transform hover:scale-105">
              🎯 Make Your Picks
            </button>
          </Link>
          <Link href="/trends">
            <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-300 text-lg font-semibold transform hover:scale-105">
              📊 View Trends
            </button>
          </Link>
          <Link href="/leader-board">
            <button className="w-full sm:w-auto px-8 py-4 bg-gray-700 text-white rounded-xl shadow-lg hover:bg-gray-600 transition-all duration-300 text-lg font-semibold border border-gray-600 hover:border-gray-500">
              🏆 Leaderboard
            </button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl">
        <div className="text-center p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Weekly Picks
          </h3>
          <p className="text-gray-300">
            Pick winners for every NFL game each week of the season
          </p>
        </div>
        <div className="text-center p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Analytics & Trends
          </h3>
          <p className="text-gray-300">
            See pick trends, popular teams, and community insights in real-time
          </p>
        </div>
        <div className="text-center p-6 bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Compete & Win
          </h3>
          <p className="text-gray-300">
            Climb the leaderboard and earn bragging rights all season long
          </p>
        </div>
      </div>

      {/* Season Info */}
      <div className="mt-12 text-center">
        <p className="text-sm sm:text-base text-gray-400">
          Ready for the 2025 NFL season? Start picking now!
        </p>
      </div>
    </div>
  );
}
