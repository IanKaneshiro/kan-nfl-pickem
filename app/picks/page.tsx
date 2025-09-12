"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { getCurrentNFLWeek } from "@/utils/nflSeason";

// Define the shape of a Game object for TypeScript
interface Team {
  id: string;
  name: string;
  alias: string;
}

interface Game {
  id: string;
  scheduled: string;
  status: string;
  home: Team;
  away: Team;
}

export default function Picks() {
  const { user, isSignedIn } = useUser();
  const [games, setGames] = useState<Game[]>([]);
  const [week, setWeek] = useState<number>(getCurrentNFLWeek()); // Default to current NFL week
  const [picks, setPicks] = useState<{ [key: string]: string }>({}); // Store picks as { gameId: pickedTeamId }
  const [isLoading, setIsLoading] = useState(true);

  const currentWeek = getCurrentNFLWeek();

  // Fetch games and user's picks when week changes
  useEffect(() => {
    async function fetchGamesAndPicks() {
      setIsLoading(true);
      try {
        // Fetch games
        const gamesRes = await fetch(`/api/games?week=${week}`);
        if (!gamesRes.ok) throw new Error("Failed to fetch games");
        const gamesData = await gamesRes.json();

        // Validate the response data
        if (!Array.isArray(gamesData.games)) {
          throw new Error("Invalid response format: games is not an array");
        }

        // Validate each game has the required properties and structure
        const validatedGames = gamesData.games.filter((game: Partial<Game>) => {
          // Check if game has all required properties
          const isValid =
            game &&
            game.id &&
            game.scheduled &&
            game.status &&
            game.home &&
            game.away &&
            game.home.id &&
            game.home.name &&
            game.away.id &&
            game.away.name;

          if (!isValid) {
            console.warn("Skipping invalid game:", game);
          }

          return isValid;
        });

        validatedGames.sort((a: Game, b: Game) => {
          return (
            new Date(a.scheduled).getTime() - new Date(b.scheduled).getTime()
          );
        });

        setGames(validatedGames);

        // If user is signed in, fetch their picks
        if (isSignedIn && user) {
          try {
            const picksRes = await fetch(`/api/picks?week=${week}`);

            if (!picksRes.ok) {
              const errorText = await picksRes.text();
              console.error(
                "Failed to fetch picks:",
                picksRes.status,
                errorText
              );
              return;
            }

            const picksData = await picksRes.json();
            setPicks(picksData.picks || {});
          } catch (error) {
            console.error("Error fetching picks:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setGames([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchGamesAndPicks();
  }, [week, isSignedIn, user]);

  // Handle team selection for a game
  const handlePick = (gameId: string, teamId: string) => {
    setPicks((prevPicks) => ({
      ...prevPicks,
      [gameId]: teamId,
    }));
  };

  // Handle week change
  const changeWeek = (direction: "prev" | "next") => {
    if (direction === "prev" && week > 1) {
      setWeek(week - 1);
    } else if (direction === "next" && week < 18) {
      setWeek(week + 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!isSignedIn || !user) {
      alert("Please sign in to submit your picks!");
      return;
    }

    if (Object.keys(picks).length === 0) {
      alert("Please make at least one pick before submitting!");
      return;
    }

    // Convert picks object to array format for the API
    const picksArray = Object.entries(picks).map(([gameId, teamId]) => ({
      gameId,
      teamId,
    }));

    try {
      const response = await fetch("/api/save-picks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week, picks: picksArray }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save picks");
      }

      const result = await response.json();
      console.log("Picks saved:", result);
      alert("Picks submitted successfully!");
    } catch (error) {
      console.error("Error submitting picks:", error);
      alert("Failed to save picks. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <header className="w-full max-w-4xl flex items-center justify-center mb-6 sm:mb-8">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Week {week} Picks{week === currentWeek ? " (Current Week)" : ""}
          </h1>
          <p className="text-sm sm:text-base text-gray-300">
            Select the team you think will win each game
          </p>
        </div>
      </header>

      {/* Navigation Section */}
      <div className="flex flex-col justify-center sm:flex-row space-y-3 sm:space-y-0 sm:space-x-6 mb-8 w-full max-w-md">
        <button
          onClick={() => changeWeek("prev")}
          disabled={week === 1}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all text-sm sm:text-base font-medium shadow-lg disabled:shadow-none"
        >
          ← Previous Week
        </button>
        <button
          onClick={() => changeWeek("next")}
          disabled={week === 18}
          className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all text-sm sm:text-base font-medium shadow-lg disabled:shadow-none"
        >
          Next Week →
        </button>
      </div>

      {/* Games List */}
      {isLoading ? (
        // Enhanced Skeleton Loading UI
        <div className="w-full max-w-4xl space-y-6">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 animate-pulse"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4">
                <div className="h-7 bg-gray-700 rounded w-3/4"></div>
                <div className="h-5 bg-gray-700 rounded w-1/4 mt-2 sm:mt-0"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                  <div className="h-6 w-6 bg-gray-600 rounded-full"></div>
                  <div className="h-6 bg-gray-600 rounded w-32"></div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                  <div className="h-6 w-6 bg-gray-600 rounded-full"></div>
                  <div className="h-6 bg-gray-600 rounded w-32"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : games.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏈</div>
          <p className="text-xl text-gray-300">
            No games available for this week
          </p>
          <p className="text-gray-400 mt-2">
            Check back later or try a different week
          </p>
        </div>
      ) : (
        <div className="w-full max-w-4xl space-y-6">
          {games.map((game: Game) => {
            const gameStarted = new Date(game.scheduled) < new Date();
            return (
              <div
                key={game.id}
                className={`bg-gray-800 rounded-xl shadow-lg p-6 border transition-all duration-200 hover:shadow-xl ${
                  gameStarted
                    ? "border-gray-600 opacity-75"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {game.away.name} <span className="text-gray-400">@</span>{" "}
                    {game.home.name}
                  </h2>
                  <div className="flex flex-col sm:items-end mt-2 sm:mt-0">
                    <span className="text-sm text-gray-300">
                      {new Date(game.scheduled).toLocaleDateString()}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(game.scheduled).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Away Team */}
                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      picks[game.id] === game.away.id
                        ? "bg-blue-600 border-blue-500 shadow-lg"
                        : gameStarted
                        ? "bg-gray-700 border-gray-600 cursor-not-allowed"
                        : "bg-gray-700 border-gray-600 hover:border-gray-500 hover:bg-gray-650"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`pick-${game.id}`}
                      value={game.away.id}
                      checked={picks[game.id] === game.away.id}
                      onChange={() => handlePick(game.id, game.away.id)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      disabled={gameStarted}
                    />
                    <div className="flex-1">
                      <span className="text-white font-semibold text-lg">
                        {game.away.name}
                      </span>
                      <div className="text-xs text-gray-300 mt-1">Away</div>
                    </div>
                  </label>

                  {/* Home Team */}
                  <label
                    className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
                      picks[game.id] === game.home.id
                        ? "bg-blue-600 border-blue-500 shadow-lg"
                        : gameStarted
                        ? "bg-gray-700 border-gray-600 cursor-not-allowed"
                        : "bg-gray-700 border-gray-600 hover:border-gray-500 hover:bg-gray-650"
                    }`}
                  >
                    <input
                      type="radio"
                      name={`pick-${game.id}`}
                      value={game.home.id}
                      checked={picks[game.id] === game.home.id}
                      onChange={() => handlePick(game.id, game.home.id)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 focus:ring-2"
                      disabled={gameStarted}
                    />
                    <div className="flex-1">
                      <span className="text-white font-semibold text-lg">
                        {game.home.name}
                      </span>
                      <div className="text-xs text-gray-300 mt-1">Home</div>
                    </div>
                  </label>
                </div>

                {gameStarted && (
                  <div className="mt-4 p-3 bg-red-900/30 border border-red-800 rounded-lg">
                    <p className="text-red-300 text-sm flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      This game has already started. Picks are locked.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Submit Button */}
      {!isLoading && games.length > 0 && (
        <div className="mt-8 w-full max-w-md">
          <button
            onClick={handleSubmit}
            className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white text-lg font-semibold rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            🏈 Submit Picks
          </button>
          <p className="text-center text-gray-400 text-sm mt-3">
            {Object.keys(picks).length} of {games.length} games selected
          </p>
        </div>
      )}
    </div>
  );
}
