"use client";

import { useState, useEffect } from "react";

// Define the shape of a leaderboard entry
interface LeaderboardEntry {
  username: string;
  points: number;
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
    console.log(leaderboard);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800">
          Leaderboard
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-2">
          See who’s dominating the NFL Pick'em season!
        </p>
      </div>

      {/* Leaderboard Table */}
      {leaderboard.length === 0 ? (
        <p className="text-gray-600 text-center">
          No leaderboard data available yet.
        </p>
      ) : (
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-gray-800 font-semibold border-b border-gray-300 pb-2">
            <div className="col-span-2 sm:col-span-1 text-center">#</div>
            <div className="col-span-6 sm:col-span-8">Username</div>
            <div className="col-span-4 sm:col-span-3 text-center">Points</div>
          </div>
          {leaderboard.map((entry, index) => (
            <div
              key={entry.username}
              className={`grid grid-cols-12 gap-4 py-3 sm:py-4 text-gray-700 ${
                index < 3 ? "font-medium" : ""
              } ${
                index === 0
                  ? "bg-green-50"
                  : index === 1
                  ? "bg-blue-50"
                  : index === 2
                  ? "bg-gray-50"
                  : ""
              }`}
            >
              <div className="col-span-2 sm:col-span-1 text-center">
                {index + 1}
              </div>
              <div className="col-span-6 sm:col-span-8">{entry.username}</div>
              <div className="col-span-4 sm:col-span-3 text-center">
                {entry.points}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
