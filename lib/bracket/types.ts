export type RoundKey = 'R64' | 'R32' | 'S16' | 'E8' | 'F4' | 'CHAMP';

export type GameResult = {
  gameId: string;
  round: RoundKey;
  winner: string | null;
  loser: string | null;
  complete: boolean;
};

export type BracketPick = {
  player: string;
  picks: Record<string, string>;
  champion: string;
};

export type ScoreBreakdown = {
  player: string;
  currentPoints: number;
  maxPoints: number;
  correctByRound: Record<RoundKey, number>;
  missedByRound: Record<RoundKey, number>;
  aliveByRound: Record<RoundKey, number>;
  deadChampion: boolean;
};