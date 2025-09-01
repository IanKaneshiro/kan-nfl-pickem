import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase credentials are not configured");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ isAdmin: false });
  }

  // Check if user exists and is admin
  const { data: user, error } = await supabase
    .from("users")
    .select("is_admin")
    .eq("id", userId)
    .single();

  if (error || !user) {
    return NextResponse.json({ isAdmin: false });
  }

  return NextResponse.json({ isAdmin: user.is_admin });
}
