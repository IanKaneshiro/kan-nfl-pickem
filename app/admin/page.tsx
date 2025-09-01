"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { APIGame } from "@/types/api";

export default function AdminPage() {
  const [games, setGames] = useState<APIGame[]>([]);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const { userId } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      const response = await fetch(`/api/admin/check?userId=${userId}`);
      const data = await response.json();

      setIsAdmin(data.isAdmin);
    };

    if (userId) {
      checkAdmin();
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

  if (!isAdmin) {
    return <div className="p-4">Access Denied</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Admin Panel - Set Game Winners
      </h1>

      <div className="mb-4">
        <label className="mr-2">Select Week:</label>
        <select
          value={selectedWeek}
          onChange={(e) => setSelectedWeek(Number(e.target.value))}
          className="border p-2 rounded  [&>option]:bg-gray-800 [&>option]:text-white"
        >
          {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => (
            <option key={week} value={week}>
              Week {week}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4">
        {games.map((game) => (
          <div key={game.id} className="border p-4 rounded">
            <div className="flex justify-between items-center">
              <span>
                {game.away.name} @ {game.home.name}
              </span>
              <select
                value={game.winner_team || ""}
                onChange={(e) => updateGameWinner(game.id, e.target.value)}
                className="border p-2 rounded bg-gray-800 text-white [&>option]:bg-gray-800 [&>option]:text-white"
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
  );
}
