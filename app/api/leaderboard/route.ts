import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Pick = {
  user_id: string;
  users: {
    username: string;
  };
};

export async function GET() {
  const { data, error } = await supabase
    .from("picks")
    .select("user_id, users!inner(username)")
    .eq("is_correct", true)
    .returns<Pick[]>();

  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }

  // Aggregate points by user
  const pointsByUser = data.reduce((acc, pick) => {
    const username = pick.users.username;
    console.log(username, "usernname");
    acc[username] = (acc[username] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert to leaderboard format
  console.log(pointsByUser);
  const leaderboard = Object.entries(pointsByUser)
    .map(([username, points]) => ({ username, points }))
    .sort((a, b) => b.points - a.points);

  return NextResponse.json(leaderboard, { status: 200 });
}
