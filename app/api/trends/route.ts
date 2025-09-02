import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials are not configured");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Team mapping for display names
const TEAM_MAP: { [key: string]: string } = {
  DAL: "Dallas Cowboys",
  PHI: "Philadelphia Eagles",
  KC: "Kansas City Chiefs",
  LAC: "Los Angeles Chargers",
  LV: "Las Vegas Raiders",
  NYG: "New York Giants",
  MIA: "Miami Dolphins",
  NE: "New England Patriots",
  BUF: "Buffalo Bills",
  NYJ: "New York Jets",
  ARI: "Arizona Cardinals",
  ATL: "Atlanta Falcons",
  BAL: "Baltimore Ravens",
  CAR: "Carolina Panthers",
  CHI: "Chicago Bears",
  CIN: "Cincinnati Bengals",
  CLE: "Cleveland Browns",
  DEN: "Denver Broncos",
  DET: "Detroit Lions",
  GB: "Green Bay Packers",
  HOU: "Houston Texans",
  IND: "Indianapolis Colts",
  JAX: "Jacksonville Jaguars",
  MIN: "Minnesota Vikings",
  NO: "New Orleans Saints",
  LAR: "Los Angeles Rams",
  SEA: "Seattle Seahawks",
  SF: "San Francisco 49ers",
  TB: "Tampa Bay Buccaneers",
  TEN: "Tennessee Titans",
  WSH: "Washington Commanders",
  PIT: "Pittsburgh Steelers",
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const week = parseInt(searchParams.get("week") || "1");

    // Get all games for the specified week
    const { data: games, error: gamesError } = await supabase
      .from("games")
      .select("id, home_team, away_team, scheduled")
      .eq("week", week);

    if (gamesError) {
      console.error("Error fetching games:", gamesError);
      throw new Error("Failed to fetch games");
    }

    // Get all picks for the specified week with user info
    const { data: picks, error: picksError } = await supabase
      .from("picks")
      .select("game_id, picked_team, user_id")
      .eq("week", week);

    if (picksError) {
      console.error("Error fetching picks:", picksError);
      throw new Error("Failed to fetch picks");
    }

    // Get unique users count for this week
    const uniqueUsers = new Set(picks.map((pick) => pick.user_id));
    const totalUsers = uniqueUsers.size;

    // Calculate pick trends for each game
    const pickTrends = games.map((game) => {
      const gamePicks = picks.filter((pick) => pick.game_id === game.id);
      const awayPicks = gamePicks.filter(
        (pick) => pick.picked_team === game.away_team
      ).length;
      const homePicks = gamePicks.filter(
        (pick) => pick.picked_team === game.home_team
      ).length;
      const totalPicks = gamePicks.length;

      return {
        gameId: game.id,
        awayTeam: TEAM_MAP[game.away_team] || game.away_team,
        homeTeam: TEAM_MAP[game.home_team] || game.home_team,
        awayPicks,
        homePicks,
        totalPicks,
        scheduled: game.scheduled,
      };
    });

    // Calculate popular teams for this week
    const teamPickCounts: { [key: string]: number } = {};
    picks.forEach((pick) => {
      teamPickCounts[pick.picked_team] =
        (teamPickCounts[pick.picked_team] || 0) + 1;
    });

    // Get historical data for win rates (season-long correct picks)
    const { data: historicalPicks, error: historicalError } = await supabase
      .from("picks")
      .select("picked_team, is_correct")
      .not("is_correct", "is", null); // Only picks where games have finished

    if (historicalError) {
      console.error("Error fetching historical data:", historicalError);
    }

    // Calculate win rates for each team
    const teamWinRates: { [key: string]: { correct: number; total: number } } =
      {};
    if (historicalPicks) {
      historicalPicks.forEach((pick) => {
        if (!teamWinRates[pick.picked_team]) {
          teamWinRates[pick.picked_team] = { correct: 0, total: 0 };
        }
        teamWinRates[pick.picked_team].total++;
        if (pick.is_correct) {
          teamWinRates[pick.picked_team].correct++;
        }
      });
    }

    // Create popular teams array
    const popularTeams = Object.entries(teamPickCounts)
      .map(([teamId, pickCount]) => {
        const winData = teamWinRates[teamId];
        const winRate = winData ? winData.correct / winData.total : 0;

        return {
          teamId,
          teamName: TEAM_MAP[teamId] || teamId,
          pickCount,
          winRate: isNaN(winRate) ? 0 : winRate,
        };
      })
      .sort((a, b) => b.pickCount - a.pickCount);

    // Calculate average picks per user
    const totalPicksCount = picks.length;
    const averagePicksPerUser =
      totalUsers > 0 ? totalPicksCount / totalUsers : 0;

    const response = {
      week,
      totalUsers,
      averagePicksPerUser: Math.round(averagePicksPerUser * 10) / 10, // Round to 1 decimal
      pickTrends: pickTrends.sort(
        (a, b) =>
          new Date(a.scheduled).getTime() - new Date(b.scheduled).getTime()
      ),
      popularTeams,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching trends:", error);
    return NextResponse.json(
      { error: "Failed to fetch trends" },
      { status: 500 }
    );
  }
}
