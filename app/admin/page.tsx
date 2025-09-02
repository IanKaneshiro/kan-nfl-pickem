"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { APIGame } from "@/types/api";

function SkeletonLoader() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="h-8 bg-gray-700 rounded animate-pulse w-1/3 mx-auto mb-8"></div>
        <div className="h-10 bg-gray-700 rounded animate-pulse w-1/4 mx-auto mb-8"></div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-800 border border-gray-700 p-6 rounded-lg"
            >
              <div className="space-y-4">
                <div className="h-6 bg-gray-700 rounded animate-pulse w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-700 rounded animate-pulse w-1/2 mx-auto"></div>
                <div className="h-10 bg-gray-700 rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
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
  const [isLoadingGames, setIsLoadingGames] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<{
    [key: string]: "updating" | "success" | "error" | undefined;
  }>({});

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
      if (!isAdmin) return;

      setIsLoadingGames(true);
      try {
        const response = await fetch(`/api/games?week=${selectedWeek}`);
        const data = await response.json();

        if (data.games && Array.isArray(data.games)) {
          // Sort games by date
          const sortedGames = data.games.sort(
            (a: APIGame, b: APIGame) =>
              new Date(a.scheduled).getTime() - new Date(b.scheduled).getTime()
          );
          setGames(sortedGames);
        } else {
          console.error("Invalid games data:", data);
          setGames([]);
        }
      } catch (error) {
        console.error("Error fetching games:", error);
        setGames([]);
      } finally {
        setIsLoadingGames(false);
      }
    };

    fetchGames();
  }, [selectedWeek, isAdmin]);

  const updateGameWinner = async (gameId: string, winnerTeam: string) => {
    setUpdateStatus((prev) => ({ ...prev, [gameId]: "updating" }));

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
      setUpdateStatus((prev) => ({ ...prev, [gameId]: "success" }));

      // Clear success status after 2 seconds
      setTimeout(() => {
        setUpdateStatus((prev) => ({ ...prev, [gameId]: undefined }));
      }, 2000);
    } catch (error) {
      console.error("Error updating game winner:", error);
      setUpdateStatus((prev) => ({ ...prev, [gameId]: "error" }));

      // Clear error status after 3 seconds
      setTimeout(() => {
        setUpdateStatus((prev) => ({ ...prev, [gameId]: undefined }));
      }, 3000);
    }
  };

  const getGameStatus = (game: APIGame) => {
    const gameTime = new Date(game.scheduled);
    const now = new Date();
    const isGameStarted = gameTime < now;
    const timeDiff = gameTime.getTime() - now.getTime();
    const hoursUntilGame = Math.ceil(timeDiff / (1000 * 60 * 60));

    if (isGameStarted) {
      return { status: "started", text: "Game Started", color: "text-red-400" };
    } else if (hoursUntilGame <= 2) {
      return {
        status: "soon",
        text: `Starts in ${hoursUntilGame}h`,
        color: "text-yellow-400",
      };
    } else {
      return {
        status: "upcoming",
        text: gameTime.toLocaleDateString(),
        color: "text-gray-400",
      };
    }
  };

  if (isLoadingAdmin) {
    return <SkeletonLoader />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🚫</div>
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
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            🛡️ Admin Panel
          </h1>
          <p className="text-gray-300 text-lg">
            Set game winners and manage results
          </p>
        </div>

        {/* Week Selection */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <label className="text-lg font-medium">Select Week:</label>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(Number(e.target.value))}
            className="bg-gray-800 border border-gray-600 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 [&>option]:bg-gray-800 [&>option]:text-white min-w-32"
          >
            {Array.from({ length: 18 }, (_, i) => i + 1).map((week) => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>

          {/* Summary Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="bg-gray-800 px-3 py-2 rounded-lg">
              <span className="text-gray-400">Total Games: </span>
              <span className="text-white font-semibold">{games.length}</span>
            </div>
            <div className="bg-gray-800 px-3 py-2 rounded-lg">
              <span className="text-gray-400">Winners Set: </span>
              <span className="text-white font-semibold">
                {games.filter((g) => g.winner_team).length}
              </span>
            </div>
          </div>
        </div>

        {/* Games Grid */}
        {isLoadingGames ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-800 border border-gray-700 p-6 rounded-lg animate-pulse"
              >
                <div className="space-y-4">
                  <div className="h-6 bg-gray-700 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto"></div>
                  <div className="h-10 bg-gray-700 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏈</div>
            <p className="text-xl text-gray-300">
              No games found for Week {selectedWeek}
            </p>
            <p className="text-gray-400 mt-2">Try selecting a different week</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => {
              const gameStatus = getGameStatus(game);
              const updateState = updateStatus[game.id];

              return (
                <div
                  key={game.id}
                  className={`bg-gray-800 border p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 ${
                    game.winner_team
                      ? "border-green-600 bg-green-900/20"
                      : "border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Game Header */}
                    <div className="text-center">
                      <h3 className="text-lg font-bold text-white mb-2">
                        {game.away.name}{" "}
                        <span className="text-gray-400">@</span>{" "}
                        {game.home.name}
                      </h3>
                      <div className="flex justify-center items-center gap-2 text-sm">
                        <span className={gameStatus.color}>
                          {gameStatus.text}
                        </span>
                        {game.winner_team && (
                          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs">
                            ✓ Winner Set
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Winner Selection */}
                    <div className="relative">
                      <select
                        value={game.winner_team || ""}
                        onChange={(e) =>
                          updateGameWinner(game.id, e.target.value)
                        }
                        disabled={updateState === "updating"}
                        className={`w-full bg-gray-700 border border-gray-600 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 [&>option]:bg-gray-700 [&>option]:text-white ${
                          updateState === "updating"
                            ? "opacity-50 cursor-not-allowed"
                            : ""
                        }`}
                      >
                        <option value="">Select Winner</option>
                        <option value={game.home.id}>
                          🏠 {game.home.name}
                        </option>
                        <option value={game.away.id}>
                          ✈️ {game.away.name}
                        </option>
                        <option value="TIE">🤝 Tie</option>
                      </select>

                      {/* Update Status Indicator */}
                      {updateState && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                          {updateState === "updating" && (
                            <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                          )}
                          {updateState === "success" && (
                            <div className="text-green-500">✓</div>
                          )}
                          {updateState === "error" && (
                            <div className="text-red-500">✗</div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Game Time */}
                    <div className="text-center text-xs text-gray-400">
                      {new Date(game.scheduled).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
