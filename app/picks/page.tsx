"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

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
  const [week, setWeek] = useState<number>(1); // Default to week 1
  const [picks, setPicks] = useState<{ [key: string]: string }>({}); // Store picks as { gameId: pickedTeamId }
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8">
      {/* Header Section with Home Logo */}
      <header className="w-full max-w-2xl flex items-center justify-center mb-6 sm:mb-8">
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Week {week} Picks
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Select the team you think will win each game.
          </p>
        </div>
      </header>

      {/* Navigation Section */}
      <div className="flex flex-col justify-center sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 mb-6 w-full max-w-md">
        <button
          onClick={() => changeWeek("prev")}
          disabled={week === 1}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
        >
          Previous Week
        </button>
        <button
          onClick={() => changeWeek("next")}
          disabled={week === 18}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all text-sm sm:text-base"
        >
          Next Week
        </button>
      </div>

      {/* Games List */}
      {isLoading ? (
        // Skeleton Loading UI
        <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 animate-pulse"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4 mt-2 sm:mt-0"></div>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-5 bg-gray-200 rounded-full"></div>
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : games.length === 0 ? (
        <p className="text-gray-600 text-center">
          No games available for this week.
        </p>
      ) : (
        <div className="w-full max-w-2xl space-y-4 sm:space-y-6">
          {games.map((game: Game) => (
            <div
              key={game.id}
              className="bg-white rounded-lg shadow-md p-4 sm:p-6 border border-gray-200"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {game.away.name} @ {game.home.name}
                </h2>
                <span className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-0">
                  {new Date(game.scheduled).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:space-x-6 space-y-3 sm:space-y-0">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`pick-${game.id}`}
                    value={game.away.id}
                    checked={picks[game.id] === game.away.id}
                    onChange={() => handlePick(game.id, game.away.id)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                    disabled={new Date(game.scheduled) < new Date()}
                  />
                  <span className="text-gray-700 font-medium text-sm sm:text-base">
                    {game.away.name}
                  </span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`pick-${game.id}`}
                    value={game.home.id}
                    checked={picks[game.id] === game.home.id}
                    onChange={() => handlePick(game.id, game.home.id)}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                    disabled={new Date(game.scheduled) < new Date()}
                  />
                  <span className="text-gray-700 font-medium text-sm sm:text-base">
                    {game.home.name}
                  </span>
                </label>
              </div>
              {new Date(game.scheduled) < new Date() && (
                <p className="text-red-500 text-xs sm:text-sm mt-2">
                  This game has already started. Picks are locked.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Submit Button */}
      {!isLoading && games.length > 0 && (
        <button
          onClick={handleSubmit}
          className="mt-6 sm:mt-8 w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all text-sm sm:text-base"
        >
          Submit Picks
        </button>
      )}
    </div>
  );
}
