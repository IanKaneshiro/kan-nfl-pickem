"use client";

import { useState, useEffect } from "react";

interface PickTrend {
  gameId: string;
  awayTeam: string;
  homeTeam: string;
  awayPicks: number;
  homePicks: number;
  totalPicks: number;
  scheduled: string;
}

interface PopularTeam {
  teamId: string;
  teamName: string;
  pickCount: number;
  winRate: number;
}

interface WeeklyTrends {
  week: number;
  pickTrends: PickTrend[];
  popularTeams: PopularTeam[];
  totalUsers: number;
  averagePicksPerUser: number;
}

interface TeamPicker {
  userId: string;
  username: string;
}

interface TeamPickersResponse {
  gameId: string;
  pickedTeam: string;
  pickers: TeamPicker[];
  count: number;
  teamName?: string;
}

export default function TrendsPage() {
  const [trends, setTrends] = useState<WeeklyTrends | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<TeamPickersResponse | null>(null);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  // Team mapping for display names to IDs (reverse of the API mapping)
  const TEAM_NAME_TO_ID: { [key: string]: string } = {
    "Dallas Cowboys": "DAL",
    "Philadelphia Eagles": "PHI",
    "Kansas City Chiefs": "KC",
    "Los Angeles Chargers": "LAC",
    "Las Vegas Raiders": "LV",
    "New York Giants": "NYG",
    "Miami Dolphins": "MIA",
    "New England Patriots": "NE",
    "Buffalo Bills": "BUF",
    "New York Jets": "NYJ",
    "Arizona Cardinals": "ARI",
    "Atlanta Falcons": "ATL",
    "Baltimore Ravens": "BAL",
    "Carolina Panthers": "CAR",
    "Chicago Bears": "CHI",
    "Cincinnati Bengals": "CIN",
    "Cleveland Browns": "CLE",
    "Denver Broncos": "DEN",
    "Detroit Lions": "DET",
    "Green Bay Packers": "GB",
    "Houston Texans": "HOU",
    "Indianapolis Colts": "IND",
    "Jacksonville Jaguars": "JAX",
    "Minnesota Vikings": "MIN",
    "New Orleans Saints": "NO",
    "Los Angeles Rams": "LAR",
    "Seattle Seahawks": "SEA",
    "San Francisco 49ers": "SF",
    "Tampa Bay Buccaneers": "TB",
    "Tennessee Titans": "TEN",
    "Washington Commanders": "WSH",
    "Pittsburgh Steelers": "PIT",
  };

  const handleTeamClick = async (gameId: string, teamName: string) => {
    const teamId = TEAM_NAME_TO_ID[teamName];
    if (!teamId) return;

    setIsLoadingModal(true);
    setShowModal(true);
    setModalData(null);

    try {
      const response = await fetch(
        `/api/team-pickers?gameId=${gameId}&pickedTeam=${teamId}`
      );
      if (!response.ok) throw new Error("Failed to fetch team pickers");
      const data = await response.json();
      setModalData({ ...data, teamName });
    } catch (error) {
      console.error("Error fetching team pickers:", error);
    } finally {
      setIsLoadingModal(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setModalData(null);
  };

  useEffect(() => {
    const fetchTrends = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/trends?week=${selectedWeek}`);
        if (!response.ok) throw new Error("Failed to fetch trends");
        const data = await response.json();
        setTrends(data);
      } catch (error) {
        console.error("Error fetching trends:", error);
        setTrends(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrends();
  }, [selectedWeek]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showModal) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showModal]);

  const getPickPercentage = (picks: number, total: number) => {
    if (total === 0) return 0;
    return Math.round((picks / total) * 100);
  };

  const getConfidenceLevel = (percentage: number) => {
    if (percentage >= 80)
      return {
        text: "High Consensus",
        color: "text-green-400",
        bg: "bg-green-900/30",
      };
    if (percentage >= 65)
      return {
        text: "Moderate Consensus",
        color: "text-yellow-400",
        bg: "bg-yellow-900/30",
      };
    if (percentage >= 55)
      return {
        text: "Slight Favorite",
        color: "text-blue-400",
        bg: "bg-blue-900/30",
      };
    return {
      text: "Split Decision",
      color: "text-gray-400",
      bg: "bg-gray-700/30",
    };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            📊 Pick Trends & Analytics
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-300">
            See what everyone else is picking and discover trending insights
          </p>
        </div>

        {/* Week Selection */}
        <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <label className="text-lg font-medium">Analyze Week:</label>
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
        </div>

        {isLoading ? (
          // Loading State
          <div className="space-y-8">
            {/* Stats Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-800 rounded-xl p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                </div>
              ))}
            </div>

            {/* Games Skeleton */}
            <div className="space-y-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-800 rounded-xl p-6 animate-pulse"
                >
                  <div className="h-6 bg-gray-700 rounded w-1/2 mb-4"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-16 bg-gray-700 rounded"></div>
                    <div className="h-16 bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : !trends || trends.totalUsers === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📈</div>
            <p className="text-xl text-gray-300">
              No pick data available for Week {selectedWeek}
            </p>
            <p className="text-gray-400 mt-2">
              Trends will appear once users start making picks
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Total Participants</p>
                    <p className="text-2xl font-bold text-white">
                      {trends.totalUsers}
                    </p>
                  </div>
                  <div className="text-3xl">👥</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Games This Week</p>
                    <p className="text-2xl font-bold text-white">
                      {trends.pickTrends.length}
                    </p>
                  </div>
                  <div className="text-3xl">🏈</div>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Avg Picks/User</p>
                    <p className="text-2xl font-bold text-white">
                      {trends.averagePicksPerUser.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-3xl">📊</div>
                </div>
              </div>
            </div>

            {/* Pick Trends by Game */}
            <div>
              <h2 className="text-2xl font-bold mb-6 flex items-center">
                <span className="mr-3">🎯</span>
                Game-by-Game Pick Trends
              </h2>

              <div className="space-y-6">
                {trends.pickTrends
                  .sort(
                    (a, b) =>
                      new Date(a.scheduled).getTime() -
                      new Date(b.scheduled).getTime()
                  )
                  .map((trend) => {
                    const awayPercentage = getPickPercentage(
                      trend.awayPicks,
                      trend.totalPicks
                    );
                    const homePercentage = getPickPercentage(
                      trend.homePicks,
                      trend.totalPicks
                    );
                    const favoriteIsHome = homePercentage > awayPercentage;
                    const favoritePercentage = Math.max(
                      awayPercentage,
                      homePercentage
                    );
                    const confidence = getConfidenceLevel(favoritePercentage);

                    // Handle case where no picks exist for this game
                    if (trend.totalPicks === 0) {
                      return (
                        <div
                          key={trend.gameId}
                          className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                        >
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
                            <h3 className="text-xl font-bold text-white">
                              {trend.awayTeam}{" "}
                              <span className="text-gray-400">@</span>{" "}
                              {trend.homeTeam}
                            </h3>
                            <div className="flex items-center gap-2 mt-2 sm:mt-0">
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-700 text-gray-400">
                                No Picks Yet
                              </span>
                              <span className="text-gray-400 text-sm">
                                {new Date(trend.scheduled).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <div className="text-center py-8">
                            <div className="text-4xl mb-2">🤔</div>
                            <p className="text-gray-400">
                              No one has picked this game yet
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={trend.gameId}
                        className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6">
                          <h3 className="text-xl font-bold text-white">
                            {trend.awayTeam}{" "}
                            <span className="text-gray-400">@</span>{" "}
                            {trend.homeTeam}
                          </h3>
                          <div className="flex items-center gap-2 mt-2 sm:mt-0">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${confidence.bg} ${confidence.color}`}
                            >
                              {confidence.text}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {new Date(trend.scheduled).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Away Team */}
                          <div
                            onClick={() =>
                              handleTeamClick(trend.gameId, trend.awayTeam)
                            }
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 hover:shadow-lg ${
                              !favoriteIsHome && favoritePercentage > 50
                                ? "border-green-500 bg-green-900/20 hover:bg-green-900/30"
                                : "border-gray-600 bg-gray-700/50 hover:bg-gray-700/70"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-lg">
                                ✈️ {trend.awayTeam}
                              </span>
                              <span className="text-2xl font-bold">
                                {awayPercentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-3">
                              <div
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  !favoriteIsHome && favoritePercentage > 50
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                                }`}
                                style={{ width: `${awayPercentage}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                              {trend.awayPicks} picks • Click to see who picked
                            </p>
                          </div>

                          {/* Home Team */}
                          <div
                            onClick={() =>
                              handleTeamClick(trend.gameId, trend.homeTeam)
                            }
                            className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:scale-105 hover:shadow-lg ${
                              favoriteIsHome && favoritePercentage > 50
                                ? "border-green-500 bg-green-900/20 hover:bg-green-900/30"
                                : "border-gray-600 bg-gray-700/50 hover:bg-gray-700/70"
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-lg">
                                🏠 {trend.homeTeam}
                              </span>
                              <span className="text-2xl font-bold">
                                {homePercentage}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-600 rounded-full h-3">
                              <div
                                className={`h-3 rounded-full transition-all duration-500 ${
                                  favoriteIsHome && favoritePercentage > 50
                                    ? "bg-green-500"
                                    : "bg-blue-500"
                                }`}
                                style={{ width: `${homePercentage}%` }}
                              ></div>
                            </div>
                            <p className="text-sm text-gray-400 mt-2">
                              {trend.homePicks} picks • Click to see who picked
                            </p>
                          </div>
                        </div>

                        {/* Additional Stats */}
                        <div className="mt-4 flex justify-center">
                          <div className="bg-gray-700 px-4 py-2 rounded-lg">
                            <span className="text-gray-300 text-sm">
                              Total Picks:{" "}
                              <span className="font-semibold text-white">
                                {trend.totalPicks}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Popular Teams Section */}
            {trends.popularTeams.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <span className="mr-3">🔥</span>
                  Most Popular Teams This Week
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trends.popularTeams.slice(0, 6).map((team, index) => (
                    <div
                      key={team.teamId}
                      className="bg-gray-800 rounded-xl p-4 border border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-white">
                          {team.teamName}
                        </span>
                        <span className="text-lg font-bold text-blue-400">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        <p>{team.pickCount} picks this week</p>
                        <p className="text-green-400">
                          {(team.winRate * 100).toFixed(1)}% season win rate
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal for showing team pickers */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-white">
                {modalData?.teamName
                  ? `Who picked ${modalData.teamName}`
                  : "Team Pickers"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {isLoadingModal ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-700 rounded-lg p-3 animate-pulse"
                  >
                    <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : modalData ? (
              <div>
                {modalData.pickers.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-gray-300 mb-3">
                      {modalData.count} user{modalData.count !== 1 ? "s" : ""}{" "}
                      picked this team:
                    </p>
                    {modalData.pickers.map((picker, index) => (
                      <div
                        key={picker.userId}
                        className="bg-gray-700 rounded-lg p-3 flex items-center"
                      >
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                          {picker.username.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-white">{picker.username}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🤷‍♂️</div>
                    <p className="text-gray-400">No one picked this team yet</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">❌</div>
                <p className="text-gray-400">Failed to load team pickers</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
