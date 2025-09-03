"use client";

import { useState, useEffect } from "react";

// Define the shape of a leaderboard entry
interface LeaderboardEntry {
  username: string;
  points: number;
  totalPicks: number;
  correctPicks: number;
  incorrectPicks: number;
  pendingPicks: number;
  accuracy: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const response = await fetch("/api/leaderboard");
        if (!response.ok) throw new Error("Failed to fetch leaderboard");
        const data = await response.json();

        setLeaderboard(data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      }
    }
    fetchLeaderboard();
  }, []); // Empty dependency array is fine here as we only want to fetch on mount

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-4 sm:py-6 px-2 sm:px-4 lg:px-8">
      {/* Header Section */}
      <div className="text-center mb-6 sm:mb-8 lg:mb-12">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
          🏆 Leaderboard
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-300">
          See who&apos;s dominating the NFL Pick&apos;em season!
        </p>
      </div>

      {/* Leaderboard Table */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="text-4xl sm:text-6xl mb-4">🏈</div>
          <p className="text-lg sm:text-xl text-gray-300">
            No leaderboard data available yet
          </p>
          <p className="text-gray-400 mt-2 text-sm sm:text-base">
            Start making picks to see standings!
          </p>
        </div>
      ) : (
        <div className="w-full max-w-4xl px-2 sm:px-0">
          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
              {/* 2nd Place */}
              <div className="text-center pt-4 sm:pt-8">
                <div className="bg-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-6 border-2 border-gray-600 transform hover:scale-105 transition-all duration-200">
                  <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">🥈</div>
                  <h3 className="font-bold text-sm sm:text-lg text-gray-200">
                    2nd Place
                  </h3>
                  <p className="text-white text-base sm:text-xl font-semibold mt-1 sm:mt-2 truncate">
                    {leaderboard[1].username}
                  </p>
                  <p className="text-gray-300 text-sm sm:text-lg">
                    {leaderboard[1].points} pts
                  </p>
                </div>
              </div>

              {/* 1st Place */}
              <div className="text-center">
                <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 text-gray-900 rounded-lg sm:rounded-xl p-3 sm:p-6 border-2 border-yellow-400 transform hover:scale-105 transition-all duration-200 shadow-xl">
                  <div className="text-3xl sm:text-5xl mb-1 sm:mb-2">👑</div>
                  <h3 className="font-bold text-base sm:text-xl">Champion</h3>
                  <p className="text-gray-900 text-lg sm:text-2xl font-bold mt-1 sm:mt-2 truncate">
                    {leaderboard[0].username}
                  </p>
                  <p className="text-gray-800 text-base sm:text-xl font-semibold">
                    {leaderboard[0].points} pts
                  </p>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="text-center pt-4 sm:pt-8">
                <div className="bg-gray-700 rounded-lg sm:rounded-xl p-3 sm:p-6 border-2 border-gray-600 transform hover:scale-105 transition-all duration-200">
                  <div className="text-2xl sm:text-4xl mb-1 sm:mb-2">🥉</div>
                  <h3 className="font-bold text-sm sm:text-lg text-gray-200">
                    3rd Place
                  </h3>
                  <p className="text-white text-base sm:text-xl font-semibold mt-1 sm:mt-2 truncate">
                    {leaderboard[2].username}
                  </p>
                  <p className="text-gray-300 text-sm sm:text-lg">
                    {leaderboard[2].points} pts
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard */}
          <div className="bg-gray-800 rounded-xl shadow-lg border border-gray-700 overflow-hidden">
            <div className="bg-gray-700 px-4 sm:px-6 py-4">
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Full Rankings
              </h2>
            </div>

            <div className="divide-y divide-gray-700">
              {/* Desktop Header */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 text-gray-300 font-semibold text-sm uppercase tracking-wider">
                <div className="col-span-2 text-center">Rank</div>
                <div className="col-span-5">Player</div>
                <div className="col-span-2 text-center">Points</div>
                <div className="col-span-2 text-center">Accuracy</div>
                <div className="col-span-1 text-center">Picks</div>
              </div>

              {leaderboard.map((entry, index) => (
                <div
                  key={entry.username}
                  className={`transition-all duration-200 hover:bg-gray-700/50 ${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 border-l-4 border-yellow-400"
                      : index === 1
                      ? "bg-gradient-to-r from-gray-600/30 to-gray-500/30 border-l-4 border-gray-400"
                      : index === 2
                      ? "bg-gradient-to-r from-orange-900/30 to-orange-800/30 border-l-4 border-orange-600"
                      : ""
                  }`}
                >
                  {/* Mobile Layout */}
                  <div className="sm:hidden px-4 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            index === 0
                              ? "bg-yellow-500 text-gray-900"
                              : index === 1
                              ? "bg-gray-400 text-gray-900"
                              : index === 2
                              ? "bg-orange-600 text-white"
                              : "bg-gray-600 text-white"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <span
                          className={`text-lg font-medium ${
                            index < 3
                              ? "font-semibold text-white"
                              : "text-gray-200"
                          }`}
                        >
                          {entry.username}
                        </span>
                        {index === 0 && (
                          <span className="text-yellow-400">👑</span>
                        )}
                        {index === 1 && (
                          <span className="text-gray-400">🥈</span>
                        )}
                        {index === 2 && (
                          <span className="text-orange-600">🥉</span>
                        )}
                      </div>
                      <span
                        className={`text-xl font-bold ${
                          index < 3 ? "text-white" : "text-gray-300"
                        }`}
                      >
                        {entry.points}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span
                        className={`font-medium ${
                          entry.accuracy >= 70
                            ? "text-green-400"
                            : entry.accuracy >= 50
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {entry.accuracy}% accuracy
                      </span>
                      <span className="text-gray-400">
                        {entry.totalPicks} picks
                      </span>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4">
                    <div className="col-span-2 text-center">
                      <div
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                          index === 0
                            ? "bg-yellow-500 text-gray-900"
                            : index === 1
                            ? "bg-gray-400 text-gray-900"
                            : index === 2
                            ? "bg-orange-600 text-white"
                            : "bg-gray-600 text-white"
                        }`}
                      >
                        {index + 1}
                      </div>
                    </div>
                    <div className="col-span-5 flex items-center">
                      <span
                        className={`text-lg ${
                          index < 3
                            ? "font-semibold text-white"
                            : "text-gray-200"
                        }`}
                      >
                        {entry.username}
                      </span>
                      {index === 0 && (
                        <span className="ml-2 text-yellow-400">👑</span>
                      )}
                      {index === 1 && (
                        <span className="ml-2 text-gray-400">🥈</span>
                      )}
                      {index === 2 && (
                        <span className="ml-2 text-orange-600">🥉</span>
                      )}
                    </div>
                    <div className="col-span-2 text-center">
                      <span
                        className={`text-lg font-semibold ${
                          index < 3 ? "text-white" : "text-gray-300"
                        }`}
                      >
                        {entry.points}
                      </span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span
                        className={`text-sm font-medium ${
                          entry.accuracy >= 70
                            ? "text-green-400"
                            : entry.accuracy >= 50
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}
                      >
                        {entry.accuracy}%
                      </span>
                    </div>
                    <div className="col-span-1 text-center">
                      <span className="text-sm text-gray-400">
                        {entry.totalPicks}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
