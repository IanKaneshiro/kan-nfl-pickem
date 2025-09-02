"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { APIGame } from "@/types/api";

function SkeletonLoader() {
  return (
    <div className="p-4 space-y-6">
      <div className="h-8 bg-gray-700 rounded animate-pulse w-1/3"></div>
      <div className="h-10 bg-gray-700 rounded animate-pulse w-1/4"></div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="border border-gray-700 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-700 rounded animate-pulse w-1/2"></div>
              <div className="h-10 bg-gray-700 rounded animate-pulse w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [games, setGames] = useState<APIGame[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const { userId } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoadingAdmin, setIsLoadingAdmin] = useState(true);

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const response = await fetch(`/api/admin/check?userId=${userId}`);
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsLoadingAdmin(false);
      }
    };

    if (userId) {
      checkAdmin();
    } else {
      setIsLoadingAdmin(false);
    }
  }, [userId]);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch(`/api/games?week=${selectedWeek}`);
        const data = await response.json();

        if (data.games && Array.isArray(data.games)) {
          setGames(data.games);
        } else {
          console.error("Invalid games data:", data);
          setGames([]);
        }
      } catch (error) {
        console.error("Error fetching games:", error);
        setGames([]);
      }
    };

    fetchGames();
  }, [selectedWeek]);

  const updateGameWinner = async (gameId: string, winnerTeam: string) => {
    try {
      const response = await fetch("/api/admin/update-winner", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId,
          winnerTeam,
          userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update game winner");
      }

      // Refresh games list
      const updatedGames = games.map((game) =>
        game.id === gameId ? { ...game, winner_team: winnerTeam } : game
      );
      setGames(updatedGames);
    } catch (error) {
      console.error("Error updating game winner:", error);
    }
  };

  if (isLoadingAdmin) {
    return <SkeletonLoader />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-400">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Admin Panel - Set Game Winners
        </h1>

        <div className="mb-6 flex justify-center">
          <div className="flex items-center space-x-2">
            <label className="text-lg font-medium">Select Week:</label>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-gray-800 border border-gray-600 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 [&>option]:bg-gray-800 [&>option]:text-white"
            >
              {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => (
                <option key={week} value={week}>
                  Week {week}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-gray-800 border border-gray-700 p-6 rounded-lg shadow-lg hover:shadow-xl transition duration-200"
            >
              <div className="flex flex-col space-y-4">
                <div className="text-center">
                  <span className="text-lg font-semibold">
                    {game.away.name} @ {game.home.name}
                  </span>
                </div>
                <select
                  value={game.winner_team || ""}
                  onChange={(e) => updateGameWinner(game.id, e.target.value)}
                  className="bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 [&>option]:bg-gray-700 [&>option]:text-white"
                >
                  <option value="">Select Winner</option>
                  <option value={game.home.id}>{game.home.name}</option>
                  <option value={game.away.id}>{game.away.name}</option>
                  <option value="TIE">Tie</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
