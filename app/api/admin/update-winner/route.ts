import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials are not configured");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(request: Request) {
  const { gameId, winnerTeam, userId } = await request.json();

  // First verify the user is an admin
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (userError || !user || !user.is_admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Update the game winner
  const { error: gameError } = await supabase
    .from("games")
    .update({ winner_team: winnerTeam })
    .eq("id", gameId);

  if (gameError) {
    return NextResponse.json(
      { error: "Failed to update game" },
      { status: 500 }
    );
  }

  // Update all picks for this game
  const { error: picksError } = await supabase
    .from("picks")
    .update({
      is_correct:
        winnerTeam === "TIE"
          ? null // If it's a tie, set is_correct to null
          : winnerTeam === "picked_team", // Compare with the picked team
    })
    .eq("game_id", gameId);

  if (picksError) {
    return NextResponse.json(
      { error: "Failed to update picks" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
