import type { BracketPick, GameResult, RoundKey, ScoreBreakdown } from './types';

export const ROUND_POINTS: Record<RoundKey, number> = {
  R64: 1,
  R32: 2,
  S16: 4,
  E8: 8,
  F4: 16,
  CHAMP: 32,
};

const EMPTY_ROUND_COUNTS = (): Record<RoundKey, number> => ({
  R64: 0,
  R32: 0,
  S16: 0,
  E8: 0,
  F4: 0,
  CHAMP: 0,
});

export function scoreBracket(pick: BracketPick, results: GameResult[]): ScoreBreakdown {
  const correctByRound = EMPTY_ROUND_COUNTS();
  const missedByRound = EMPTY_ROUND_COUNTS();
  const aliveByRound = EMPTY_ROUND_COUNTS();

  let currentPoints = 0;
  let maxPoints = 0;

  for (const game of results) {
    const chosen = pick.picks[game.gameId];
    const pts = ROUND_POINTS[game.round];

    if (!chosen) continue;

    if (game.complete) {
      if (game.winner === chosen) {
        correctByRound[game.round] += 1;
        currentPoints += pts;
        maxPoints += pts;
      } else {
        missedByRound[game.round] += 1;
      }
    } else {
      aliveByRound[game.round] += 1;
      maxPoints += pts;
    }
  }

  const deadChampion = Boolean(
    pick.champion &&
      results.some(
        (game) => game.complete && game.winner !== pick.champion && game.loser === pick.champion
      )
  );

  return {
    player: pick.player,
    currentPoints,
    maxPoints,
    correctByRound,
    missedByRound,
    aliveByRound,
    deadChampion,
  };
}

export function scoreAllBrackets(picks: BracketPick[], results: GameResult[]) {
  return picks.map((pick) => scoreBracket(pick, results));
}

export function rankScoredBrackets(
  picks: BracketPick[],
  results: GameResult[],
  oddsByPlayer: Record<string, number>
) {
  const scored = scoreAllBrackets(picks, results);

  return scored
    .map((row) => ({
      ...row,
      odds: oddsByPlayer[row.player] ?? 0,
    }))
    .sort((a, b) => {
      if (b.currentPoints !== a.currentPoints) return b.currentPoints - a.currentPoints;
      if (b.maxPoints !== a.maxPoints) return b.maxPoints - a.maxPoints;
      return (b.odds ?? 0) - (a.odds ?? 0);
    })
    .map((row, index) => ({
      ...row,
      rank: index + 1,
    }));
}

export function computeAliveEquity(score: ScoreBreakdown): number {
  const totalRemaining = Object.entries(score.aliveByRound).reduce(
    (sum, [round, count]) => sum + count * ROUND_POINTS[round as RoundKey],
    0
  );

  if (score.maxPoints === 0) return 0;
  return Number((((score.currentPoints + totalRemaining) / score.maxPoints) * 100).toFixed(1));
}