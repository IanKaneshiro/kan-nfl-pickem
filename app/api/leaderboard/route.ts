import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials are not configured");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

type Pick = {
  user_id: string;
  is_correct: boolean | null;
  users: {
    username: string;
  };
};

export async function GET() {
  try {
    // Fetch all picks in batches to overcome 1000 row limit
    let allPicks: Pick[] = [];
    let from = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: batch, error } = await supabase
        .from("picks")
        .select("user_id, is_correct, users(username)")
        .range(from, from + batchSize - 1)
        .returns<Pick[]>();

      if (error) {
        console.error("Error fetching picks:", error);
        return NextResponse.json(
          { error: "Failed to fetch leaderboard" },
          { status: 500 }
        );
      }

      if (!batch || batch.length === 0) {
        hasMore = false;
      } else {
        allPicks = allPicks.concat(batch);
        from += batchSize;

        // If we got less than batchSize, we've reached the end
        if (batch.length < batchSize) {
          hasMore = false;
        }
      }
    }

    if (!allPicks || allPicks.length === 0) {
      return NextResponse.json([]);
    }

    // Aggregate stats by user
    const userStats = allPicks.reduce(
      (acc, pick) => {
        // Skip picks where user doesn't exist (shouldn't happen, but be defensive)
        if (!pick.users || !pick.users.username) {
          console.warn(
            `Pick with user_id ${pick.user_id} has no username, skipping`
          );
          return acc;
        }

        const username = pick.users.username;

        if (!acc[username]) {
          acc[username] = {
            username,
            totalPicks: 0,
            correctPicks: 0,
            incorrectPicks: 0,
            pendingPicks: 0,
          };
        }

        acc[username].totalPicks++;

        if (pick.is_correct === true) {
          acc[username].correctPicks++;
        } else if (pick.is_correct === false) {
          acc[username].incorrectPicks++;
        } else {
          acc[username].pendingPicks++;
        }

        return acc;
      },
      {} as Record<
        string,
        {
          username: string;
          totalPicks: number;
          correctPicks: number;
          incorrectPicks: number;
          pendingPicks: number;
        }
      >
    );

    // Convert to leaderboard format with additional stats
    const leaderboard = Object.values(userStats)
      .map((user) => ({
        username: user.username,
        points: user.correctPicks,
        totalPicks: user.totalPicks,
        correctPicks: user.correctPicks,
        incorrectPicks: user.incorrectPicks,
        pendingPicks: user.pendingPicks,
        accuracy:
          user.totalPicks > 0
            ? Math.round(
                (user.correctPicks /
                  (user.correctPicks + user.incorrectPicks)) *
                  100
              )
            : 0,
      }))
      .sort((a, b) => {
        // Sort by points first, then by accuracy if tied
        if (b.points === a.points) {
          return b.accuracy - a.accuracy;
        }
        return b.points - a.points;
      });

    return NextResponse.json(leaderboard, { status: 200 });
  } catch (error) {
    console.error("Error in leaderboard API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
