export type LiveGame = {
  id: string;
  provider: 'ncaa';
  status: 'PRE' | 'LIVE' | 'FINAL';
  round: string;
  startTime: string | null;
  clock: string | null;
  period: string | null;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  winner: string | null;
};

export type ScoreProviderResult = {
  games: LiveGame[];
  fetchedAt: string;
  sourceLabel: string;
};