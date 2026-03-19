import { fetchNcaaScores } from '@/lib/providers/ncaa';
import { BRACKET_PICKS, PLAYER_FINALS } from '@/lib/bracket/picks';
import { buildResultsFromLiveGames } from '@/lib/bracket/results';
import { computeAliveEquity, rankScoredBrackets } from '@/lib/bracket/scoring';

export type StandingRow = {
  name: string;
  odds: number;
  rank: number;
  champion: string;
  final: string;
  diffVsTG: number;
  alive: number;
  currentPoints: number;
  maxPoints: number;
};

const oddsByPlayer = {
  Friske: 28.5,
  Doko: 18.2,
  Gunee: 16.8,
  Beck: 10.8,
  Kuaya: 7.7,
  Manlai: 6.1,
  TG: 4.5,
  Temmy: 4.4,
  Hata: 3.0,
};

function buildCompareTG() {
  const tg = BRACKET_PICKS.find((p) => p.player === 'TG');
  if (!tg) return [];

  return BRACKET_PICKS.filter((p) => p.player !== 'TG')
    .map((p) => {
      let differences = 0;
      const allKeys = new Set([...Object.keys(tg.picks), ...Object.keys(p.picks)]);
      for (const key of allKeys) {
        if (tg.picks[key] !== p.picks[key]) differences++;
      }
      return { person: p.player, differences };
    })
    .sort((a, b) => a.differences - b.differences);
}

function buildScenarios(standings: StandingRow[]) {
  const totals = new Map<string, number>();
  for (const row of standings) totals.set(row.champion, (totals.get(row.champion) || 0) + row.odds);
  const grand = [...totals.values()].reduce((a, b) => a + b, 0) || 1;

  return [...totals.entries()]
    .map(([team, value]) => ({ team, pct: Number(((value / grand) * 100).toFixed(0)) }))
    .sort((a, b) => b.pct - a.pct);
}

function buildWatchlist(games: Awaited<ReturnType<typeof fetchNcaaScores>>['games']) {
  return games.slice(0, 6).map((game) => ({
    time: game.clock || game.startTime || 'TBD',
    matchup: `${game.away} vs ${game.home}`,
    impact:
      game.status === 'LIVE'
        ? '+ live swing in pool odds'
        : game.status === 'FINAL'
          ? 'Result is now scored'
          : 'Upcoming leverage game',
    status: game.status,
  }));
}

export async function getDashboardData() {
  const scoreFeed = await fetchNcaaScores();
  const results = buildResultsFromLiveGames(scoreFeed.games);

  const ranked = rankScoredBrackets(BRACKET_PICKS, results, oddsByPlayer);

  const standings: StandingRow[] = ranked.map((row) => {
    const bracket = BRACKET_PICKS.find((p) => p.player === row.player);
    return {
      name: row.player,
      odds: row.odds,
      rank: row.rank,
      champion: bracket?.champion ?? '',
      final: PLAYER_FINALS[row.player as keyof typeof PLAYER_FINALS] ?? '',
      diffVsTG: 0,
      alive: computeAliveEquity(row),
      currentPoints: row.currentPoints,
      maxPoints: row.maxPoints,
    };
  });

  return {
    meta: {
      title: 'BracketFlow Live',
      subtitle: `${scoreFeed.sourceLabel} connected`,
      refreshSeconds: 30,
      lastUpdated: scoreFeed.fetchedAt,
      connected: true,
      mode: 'live',
    },
    standings,
    oddsTrend: [
      { round: 'Open', tg: 4.5, leader: 28.5 },
      { round: 'R64', tg: 5.2, leader: 24.8 },
      { round: 'R32', tg: 6.7, leader: 21.9 },
      { round: 'S16', tg: 8.3, leader: 19.7 },
      { round: 'E8', tg: 11.2, leader: 18.1 },
      { round: 'F4', tg: 16.9, leader: 17.4 },
      { round: 'Title', tg: 22.4, leader: 20.1 },
    ],
    scenarios: buildScenarios(standings),
    compareTG: buildCompareTG(),
    watchlist: buildWatchlist(scoreFeed.games),
    games: scoreFeed.games,
    dataSources: [
      { label: 'Dashboard API', url: '/api/dashboard', state: 'Connected' },
      { label: 'NCAA scoreboard', url: 'https://www.ncaa.com/scoreboard/basketball-men/d1', state: 'Connected' },
      { label: 'Bracket Picks', url: 'lib/bracket/picks.ts', state: 'Local' },
    ],
  };
}