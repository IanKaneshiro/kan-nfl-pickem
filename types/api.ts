export interface Team {
  id: string;
  name: string;
  alias: string;
}

export interface APIGame {
  id: string;
  scheduled: string;
  status: string;
  home: Team;
  away: Team;
  winner_team?: string | null;
}
