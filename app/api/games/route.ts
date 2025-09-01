import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Game, Team } from "@/types/games";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Team mapping for transforming API response
const TEAM_MAP: { [key: string]: Team } = {
  DAL: { id: "DAL", name: "Dallas Cowboys", alias: "DAL" },
  PHI: { id: "PHI", name: "Philadelphia Eagles", alias: "PHI" },
  KC: { id: "KC", name: "Kansas City Chiefs", alias: "KC" },
  LAC: { id: "LAC", name: "Los Angeles Chargers", alias: "LAC" },
  LV: { id: "LV", name: "Las Vegas Raiders", alias: "LV" },
  NYG: { id: "NYG", name: "New York Giants", alias: "NYG" },
  MIA: { id: "MIA", name: "Miami Dolphins", alias: "MIA" },
  NE: { id: "NE", name: "New England Patriots", alias: "NE" },
  BUF: { id: "BUF", name: "Buffalo Bills", alias: "BUF" },
  NYJ: { id: "NYJ", name: "New York Jets", alias: "NYJ" },
  ARI: { id: "ARI", name: "Arizona Cardinals", alias: "ARI" },
  ATL: { id: "ATL", name: "Atlanta Falcons", alias: "ATL" },
  BAL: { id: "BAL", name: "Baltimore Ravens", alias: "BAL" },
  CAR: { id: "CAR", name: "Carolina Panthers", alias: "CAR" },
  CHI: { id: "CHI", name: "Chicago Bears", alias: "CHI" },
  CIN: { id: "CIN", name: "Cincinnati Bengals", alias: "CIN" },
  CLE: { id: "CLE", name: "Cleveland Browns", alias: "CLE" },
  DEN: { id: "DEN", name: "Denver Broncos", alias: "DEN" },
  DET: { id: "DET", name: "Detroit Lions", alias: "DET" },
  GB: { id: "GB", name: "Green Bay Packers", alias: "GB" },
  HOU: { id: "HOU", name: "Houston Texans", alias: "HOU" },
  IND: { id: "IND", name: "Indianapolis Colts", alias: "IND" },
  JAX: { id: "JAX", name: "Jacksonville Jaguars", alias: "JAX" },
  MIN: { id: "MIN", name: "Minnesota Vikings", alias: "MIN" },
  NO: { id: "NO", name: "New Orleans Saints", alias: "NO" },
  LAR: { id: "LAR", name: "Los Angeles Rams", alias: "LAR" },
  SEA: { id: "SEA", name: "Seattle Seahawks", alias: "SEA" },
  SF: { id: "SF", name: "San Francisco 49ers", alias: "SF" },
  TB: { id: "TB", name: "Tampa Bay Buccaneers", alias: "TB" },
  TEN: { id: "TEN", name: "Tennessee Titans", alias: "TEN" },
  WSH: { id: "WSH", name: "Washington Commanders", alias: "WSH" },
  PIT: { id: "PIT", name: "Pittsburgh Steelers", alias: "PIT" },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const week = searchParams.get("week");

  if (!week || isNaN(parseInt(week))) {
    return NextResponse.json(
      { error: "Valid week parameter is required" },
      { status: 400 }
    );
  }

  try {
    // First check if we already have games for this week in the database
    const { data: existingGames, error: dbError } = await supabase
      .from("games")
      .select("*")
      .eq("week", parseInt(week));

    if (dbError) {
      console.error("Error checking database:", dbError);
      throw dbError;
    }

    let gamesData;

    if (existingGames && existingGames.length > 0) {
      // If games exist in database, return them directly
      return NextResponse.json({
        season: {
          year: 2025,
          week: parseInt(week),
        },
        games: existingGames.map((game) => ({
          id: game.id,
          scheduled: game.scheduled,
          status: game.status,
          home: TEAM_MAP[game.home_team],
          away: TEAM_MAP[game.away_team],
        })),
      });
    } else {
      // If no games found in database, fetch from API
      const url = `https://tank01-nfl-live-in-game-real-time-statistics-nfl.p.rapidapi.com/getNFLGamesForWeek?week=${week}&seasonType=reg&season=2025`;
      const options = {
        method: "GET",
        headers: {
          "x-rapidapi-key": process.env.RAPIDAPI_KEY!,
          "x-rapidapi-host": process.env.RAPIDAPI_HOST!,
        },
      };

      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const result = await response.json();
      gamesData = result.body;
      console.log(gamesData);
    }

    // Define the database game type
    type DbGame = {
      id: string;
      week: number;
      scheduled: string;
      home_team: string;
      away_team: string;
      status: string;
    };

    // First transform API data into database format
    type APIGame = {
      gameID: string;
      gameTime_epoch: string;
      gameStatus: string;
      home: string;
      away: string;
    };

    const dbGames = gamesData.map((game: APIGame) => {
      const transformed = {
        id: game.gameID,
        week: parseInt(week),
        scheduled: new Date(
          parseFloat(game.gameTime_epoch) * 1000
        ).toISOString(),
        home_team: game.home,
        away_team: game.away,
        status: game.gameStatus.toLowerCase(),
      };
      return transformed;
    });

    // Then transform into application format for response
    const transformedGames: Game[] = dbGames.map((game: DbGame) => ({
      id: game.id,
      scheduled: game.scheduled,
      status: game.status,
      home: TEAM_MAP[game.home_team],
      away: TEAM_MAP[game.away_team],
    }));

    const { error: upsertError } = await supabase
      .from("games")
      .upsert(dbGames, {
        onConflict: "id",
      });

    if (upsertError) {
      console.error("Error syncing games:", upsertError);
    }

    return NextResponse.json({
      season: {
        year: 2025,
        week: parseInt(week),
      },
      games: transformedGames,
    });
  } catch (error) {
    console.error("Error fetching games:", error);
    return NextResponse.json(
      { error: "Failed to fetch games" },
      { status: 500 }
    );
  }
}
