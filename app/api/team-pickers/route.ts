import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials are not configured");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const gameId = searchParams.get("gameId");
    const pickedTeam = searchParams.get("pickedTeam");

    if (!gameId || !pickedTeam) {
      return NextResponse.json(
        { error: "gameId and pickedTeam are required" },
        { status: 400 }
      );
    }

    // Get all users who picked the specified team for the specified game
    const { data: picks, error: picksError } = await supabase
      .from("picks")
      .select(
        `
        user_id,
        users (
          username
        )
      `
      )
      .eq("game_id", gameId)
      .eq("picked_team", pickedTeam);

    if (picksError) {
      console.error("Error fetching team pickers:", picksError);
      throw new Error("Failed to fetch team pickers");
    }

    // Format the response to include usernames
    const pickers =
      picks?.map((pick) => {
        let username = "Unknown User";
        if (Array.isArray(pick.users) && pick.users.length > 0) {
          username = pick.users[0].username || "Unknown User";
        } else if (
          pick.users &&
          typeof pick.users === "object" &&
          "username" in pick.users
        ) {
          username =
            (pick.users as { username: string }).username || "Unknown User";
        }

        return {
          userId: pick.user_id,
          username,
        };
      }) || [];

    return NextResponse.json({
      gameId,
      pickedTeam,
      pickers,
      count: pickers.length,
    });
  } catch (error) {
    console.error("Error fetching team pickers:", error);
    return NextResponse.json(
      { error: "Failed to fetch team pickers" },
      { status: 500 }
    );
  }
}
