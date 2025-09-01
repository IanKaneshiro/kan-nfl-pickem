export interface Game {
  id: string;
  week: number;
  scheduled: string;
  home_team: string;
  away_team: string;
  winner_team: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}
