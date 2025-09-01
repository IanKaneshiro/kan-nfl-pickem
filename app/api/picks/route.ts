import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const week = searchParams.get("week");
  const authInfo = await auth();
  const userId = authInfo.userId;

  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!week || !userId) {
    return NextResponse.json(
      { error: "Week and userId are required" },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      { error: "Database configuration error" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    const { data: picks, error } = await supabase
      .from("picks")
      .select("game_id, picked_team")
      .eq("user_id", userId)
      .eq("week", week);

    if (error) throw error;

    // Convert the picks array to an object format that matches the frontend state
    const picksObject = picks.reduce(
      (acc: { [key: string]: string }, pick: { game_id: string; picked_team: string }) => {
        acc[pick.game_id] = pick.picked_team;
        return acc;
      },
      {}
    );

    return NextResponse.json({ picks: picksObject });
  } catch (error) {
    console.error("Error fetching picks:", error);
    return NextResponse.json(
      { error: "Failed to fetch picks" },
      { status: 500 }
    );
  }
}
