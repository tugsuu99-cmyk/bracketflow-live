import type { GameResult, RoundKey } from './types';
import type { LiveGame } from '@/lib/providers/types';

function mapRound(input: string): RoundKey {
  const value = input.toLowerCase();
  if (value.includes('round of 64')) return 'R64';
  if (value.includes('round of 32')) return 'R32';
  if (value.includes('sweet')) return 'S16';
  if (value.includes('elite')) return 'E8';
  if (value.includes('final four')) return 'F4';
  if (value.includes('champ')) return 'CHAMP';
  return 'R64';
}

export function buildResultsFromLiveGames(games: LiveGame[]): GameResult[] {
  return games.map((game) => ({
    gameId: game.id,
    round: mapRound(game.round),
    winner: game.status === 'FINAL' ? game.winner : null,
    loser:
      game.status === 'FINAL'
        ? game.winner === game.home
          ? game.away
          : game.home
        : null,
    complete: game.status === 'FINAL',
  }));
}