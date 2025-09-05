export interface GameData {
  gameID: string;
  seasonType: string;
  away: string;
  gameDate: string;
  espnID: string;
  teamIDHome: string;
  gameStatus: string;
  gameWeek: string;
  teamIDAway: string;
  home: string;
  espnLink: string;
  cbsLink: string;
  gameTime: string;
  gameTime_epoch: string;
  season: string;
  neutralSite: string;
  gameStatusCode: string;
}

export interface Team {
  id: string;
  name: string;
  alias: string;
}

export interface Game {
  id: string;
  scheduled: string;
  status: string;
  home: Team;
  away: Team;
  winner_team?: string | null;
}
