import { NextRequest, NextResponse } from "next/server";

// Define TypeScript interfaces for the mock data
interface Team {
  id: string;
  name: string;
  alias: string;
}

interface Venue {
  id: string;
  name: string;
  city: string;
  state: string;
}

interface Game {
  id: string;
  scheduled: string;
  status: string;
  home: Team;
  away: Team;
  venue: Venue;
}

interface WeekData {
  games: Game[];
}

interface SeasonData {
  season: {
    year: number;
    type: string;
  };
  weeks: {
    [key: string]: WeekData; // Use string keys since object keys are strings
  };
}

// Mock data for multiple weeks
// Mock data for the 2025 NFL season
const mockSeasonData: SeasonData = {
  season: {
    year: 2025,
    type: "REG", // Regular season
  },
  weeks: {
    "1": {
      games: [
        {
          id: "2025-REG-1-GAME-001",
          scheduled: "2025-09-04T20:20:00Z", // Thursday Night Football
          status: "scheduled",
          home: { id: "PHI", name: "Philadelphia Eagles", alias: "PHI" },
          away: { id: "GB", name: "Green Bay Packers", alias: "GB" },
          venue: {
            id: "VEN-013",
            name: "Lincoln Financial Field",
            city: "Philadelphia",
            state: "PA",
          },
        },
        {
          id: "2025-REG-1-GAME-002",
          scheduled: "2025-09-07T17:00:00Z", // Sunday Early (1:00 PM ET)
          status: "scheduled",
          home: { id: "CHI", name: "Chicago Bears", alias: "CHI" },
          away: { id: "DET", name: "Detroit Lions", alias: "DET" },
          venue: {
            id: "VEN-014",
            name: "Soldier Field",
            city: "Chicago",
            state: "IL",
          },
        },
        {
          id: "2025-REG-1-GAME-003",
          scheduled: "2025-09-07T20:25:00Z", // Sunday Late (4:25 PM ET)
          status: "scheduled",
          home: { id: "LAC", name: "Los Angeles Chargers", alias: "LAC" },
          away: { id: "LV", name: "Las Vegas Raiders", alias: "LV" },
          venue: {
            id: "VEN-004",
            name: "SoFi Stadium",
            city: "Inglewood",
            state: "CA",
          },
        },
        {
          id: "2025-REG-1-GAME-004",
          scheduled: "2025-09-08T00:20:00Z", // Sunday Night (8:20 PM ET)
          status: "scheduled",
          home: { id: "DAL", name: "Dallas Cowboys", alias: "DAL" },
          away: { id: "NYG", name: "New York Giants", alias: "NYG" },
          venue: {
            id: "VEN-003",
            name: "AT&T Stadium",
            city: "Arlington",
            state: "TX",
          },
        },
        {
          id: "2025-REG-1-GAME-005",
          scheduled: "2025-09-09T00:15:00Z", // Monday Night (8:15 PM ET)
          status: "scheduled",
          home: { id: "MIA", name: "Miami Dolphins", alias: "MIA" },
          away: { id: "NE", name: "New England Patriots", alias: "NE" },
          venue: {
            id: "VEN-006",
            name: "Hard Rock Stadium",
            city: "Miami Gardens",
            state: "FL",
          },
        },
      ],
    },
    "2": {
      games: [
        {
          id: "2025-REG-2-GAME-001",
          scheduled: "2025-09-11T20:20:00Z", // Thursday Night
          status: "scheduled",
          home: { id: "BUF", name: "Buffalo Bills", alias: "BUF" },
          away: { id: "NYJ", name: "New York Jets", alias: "NYJ" },
          venue: {
            id: "VEN-012",
            name: "Highmark Stadium",
            city: "Orchard Park",
            state: "NY",
          },
        },
        {
          id: "2025-REG-2-GAME-002",
          scheduled: "2025-09-14T17:00:00Z", // Sunday Early
          status: "scheduled",
          home: { id: "MIN", name: "Minnesota Vikings", alias: "MIN" },
          away: { id: "SF", name: "San Francisco 49ers", alias: "SF" },
          venue: {
            id: "VEN-015",
            name: "U.S. Bank Stadium",
            city: "Minneapolis",
            state: "MN",
          },
        },
        {
          id: "2025-REG-2-GAME-003",
          scheduled: "2025-09-14T20:25:00Z", // Sunday Late
          status: "scheduled",
          home: { id: "SEA", name: "Seattle Seahawks", alias: "SEA" },
          away: { id: "ARI", name: "Arizona Cardinals", alias: "ARI" },
          venue: {
            id: "VEN-016",
            name: "Lumen Field",
            city: "Seattle",
            state: "WA",
          },
        },
        {
          id: "2025-REG-2-GAME-004",
          scheduled: "2025-09-15T00:20:00Z", // Sunday Night
          status: "scheduled",
          home: { id: "KCC", name: "Kansas City Chiefs", alias: "KC" },
          away: { id: "BAL", name: "Baltimore Ravens", alias: "BAL" },
          venue: {
            id: "VEN-001",
            name: "Arrowhead Stadium",
            city: "Kansas City",
            state: "MO",
          },
        },
        {
          id: "2025-REG-2-GAME-005",
          scheduled: "2025-09-16T00:15:00Z", // Monday Night
          status: "scheduled",
          home: { id: "ATL", name: "Atlanta Falcons", alias: "ATL" },
          away: { id: "TB", name: "Tampa Bay Buccaneers", alias: "TB" },
          venue: {
            id: "VEN-017",
            name: "Mercedes-Benz Stadium",
            city: "Atlanta",
            state: "GA",
          },
        },
      ],
    },
    "3": {
      games: [
        {
          id: "2025-REG-3-GAME-001",
          scheduled: "2025-09-18T20:20:00Z", // Thursday Night
          status: "scheduled",
          home: { id: "PIT", name: "Pittsburgh Steelers", alias: "PIT" },
          away: { id: "CLE", name: "Cleveland Browns", alias: "CLE" },
          venue: {
            id: "VEN-018",
            name: "Acrisure Stadium",
            city: "Pittsburgh",
            state: "PA",
          },
        },
        {
          id: "2025-REG-3-GAME-002",
          scheduled: "2025-09-21T17:00:00Z", // Sunday Early
          status: "scheduled",
          home: { id: "IND", name: "Indianapolis Colts", alias: "IND" },
          away: { id: "HOU", name: "Houston Texans", alias: "HOU" },
          venue: {
            id: "VEN-011",
            name: "Lucas Oil Stadium",
            city: "Indianapolis",
            state: "IN",
          },
        },
        {
          id: "2025-REG-3-GAME-003",
          scheduled: "2025-09-21T20:25:00Z", // Sunday Late
          status: "scheduled",
          home: { id: "DEN", name: "Denver Broncos", alias: "DEN" },
          away: { id: "LAC", name: "Los Angeles Chargers", alias: "LAC" },
          venue: {
            id: "VEN-008",
            name: "Empower Field at Mile High",
            city: "Denver",
            state: "CO",
          },
        },
        {
          id: "2025-REG-3-GAME-004",
          scheduled: "2025-09-22T00:20:00Z", // Sunday Night
          status: "scheduled",
          home: { id: "LAR", name: "Los Angeles Rams", alias: "LAR" },
          away: { id: "SF", name: "San Francisco 49ers", alias: "SF" },
          venue: {
            id: "VEN-004",
            name: "SoFi Stadium",
            city: "Inglewood",
            state: "CA",
          },
        },
        {
          id: "2025-REG-3-GAME-005",
          scheduled: "2025-09-23T00:15:00Z", // Monday Night
          status: "scheduled",
          home: { id: "CIN", name: "Cincinnati Bengals", alias: "CIN" },
          away: { id: "BAL", name: "Baltimore Ravens", alias: "BAL" },
          venue: {
            id: "VEN-019",
            name: "Paycor Stadium",
            city: "Cincinnati",
            state: "OH",
          },
        },
      ],
    },
  },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const week = searchParams.get("week"); // e.g., `/api/nfl-games?week=1`

  // Validate the week parameter
  if (!week || isNaN(parseInt(week))) {
    return NextResponse.json(
      { error: "Valid week parameter is required" },
      { status: 400 }
    );
  }

  const weekNum = parseInt(week);
  const weekKey = weekNum.toString(); // Convert to string for indexing

  // Check if the requested week exists in the mock data
  if (!mockSeasonData.weeks[weekKey]) {
    return NextResponse.json(
      { error: `No games found for week ${weekNum}` },
      { status: 404 }
    );
  }

  // Construct the response in the format expected by the frontend
  const response = {
    season: {
      ...mockSeasonData.season,
      week: weekNum,
    },
    games: mockSeasonData.weeks[weekKey].games,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
