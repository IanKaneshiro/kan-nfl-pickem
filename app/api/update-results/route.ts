import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with service role key for admin access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const { week, gameResults } = await request.json();
    if (!week || !gameResults || !Array.isArray(gameResults)) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Process each game result
    for (const result of gameResults) {
      const { gameId, winnerTeam } = result;

      // Validate gameId and winnerTeam
      if (!gameId || !winnerTeam) {
        return NextResponse.json(
          { error: "gameId and winnerTeam are required for each result" },
          { status: 400 }
        );
      }

      // Update the winner_team in the games table
      const { error: gameError } = await supabase
        .from("games")
        .update({ winner_team: winnerTeam })
        .eq("id", gameId)
        .eq("week", week);

      if (gameError) {
        console.error("Error updating game:", gameError);
        return NextResponse.json(
          { error: `Failed to update game ${gameId}: ${gameError.message}` },
          { status: 500 }
        );
      }

      // Update is_correct in the picks table by fetching picks and updating them
      const { data: picks, error: fetchPicksError } = await supabase
        .from("picks")
        .select("id, picked_team")
        .eq("game_id", gameId)
        .eq("week", week);

      if (fetchPicksError) {
        console.error("Error fetching picks:", fetchPicksError);
        return NextResponse.json(
          {
            error: `Failed to fetch picks for game ${gameId}: ${fetchPicksError.message}`,
          },
          { status: 500 }
        );
      }

      if (picks && picks.length > 0) {
        const updates = picks.map((pick) => ({
          id: pick.id,
          is_correct: pick.picked_team === winnerTeam,
        }));

        const { error: updatePicksError } = await supabase
          .from("picks")
          .upsert(updates, { onConflict: "id" });

        if (updatePicksError) {
          console.error("Error updating picks:", updatePicksError);
          return NextResponse.json(
            {
              error: `Failed to update picks for game ${gameId}: ${updatePicksError.message}`,
            },
            { status: 500 }
          );
        }
      } else {
        console.log(`No picks found for game ${gameId} in week ${week}`);
      }
    }

    return NextResponse.json(
      { message: "Results updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
