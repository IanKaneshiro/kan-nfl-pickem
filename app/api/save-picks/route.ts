import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { currentUser } from "@clerk/nextjs/server";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  // Get the authenticated user from Clerk
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse the request body
  const { week, picks } = await request.json();

  if (!week || !picks || !Array.isArray(picks)) {
    return NextResponse.json(
      { error: "Invalid request data" },
      { status: 400 }
    );
  }

  // Ensure the user exists in the users table (create if not)
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id")
    .eq("id", user.id)
    .single();

  if (userError && userError.code !== "PGRST116") {
    // PGRST116 = no rows found

    return NextResponse.json(
      { error: "Failed to verify user" },
      { status: 500 }
    );
  }

  if (!userData) {
    // Insert the user with a default username (could be updated later)
    const { error: insertUserError } = await supabase
      .from("users")
      .insert({ id: user.id, username: user?.firstName });

    console.log(insertUserError);

    if (insertUserError) {
      return NextResponse.json(
        { error: "Failed to create user" },
        { status: 500 }
      );
    }
  }

  // Prepare picks data for insertion
  const picksData = picks.map((pick: { gameId: string; teamId: string }) => ({
    user_id: user.id,
    week,
    game_id: pick.gameId,
    picked_team: pick.teamId,
    is_correct: null, // Default to null until game results are known
  }));
  console.log(picksData, "picks data");
  // Insert picks into the database
  const { error } = await supabase.from("picks").upsert(picksData, {
    onConflict: "user_id,game_id", // Changed from 'user_id,week,game_id'
  });

  if (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to save picks" },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { message: "Picks saved successfully" },
    { status: 200 }
  );
}
