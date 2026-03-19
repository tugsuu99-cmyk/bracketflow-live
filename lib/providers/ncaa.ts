import * as cheerio from 'cheerio';
import { normalizeTeamName } from '@/lib/teams';
import type { LiveGame, ScoreProviderResult } from './types';

const NCAA_SCOREBOARD_URL = 'https://www.ncaa.com/scoreboard/basketball-men/d1';

function inferStatus(text: string): 'PRE' | 'LIVE' | 'FINAL' {
  const value = text.toLowerCase();
  if (value.includes('final')) return 'FINAL';
  if (
    value.includes('live') ||
    value.includes(':') ||
    value.includes('1st') ||
    value.includes('2nd')
  ) {
    return 'LIVE';
  }
  return 'PRE';
}

function safeNumber(input?: string | null): number | null {
  if (!input) return null;
  const n = Number(String(input).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(n) ? n : null;
}

export async function fetchNcaaScores(): Promise<ScoreProviderResult> {
  const response = await fetch(NCAA_SCOREBOARD_URL, {
    headers: {
      'user-agent': 'BracketFlowLive/1.0',
      accept: 'text/html,application/xhtml+xml',
    },
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`NCAA scoreboard fetch failed: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  const games: LiveGame[] = [];

  $('[class*="game"], [class*="Game"], article').each((index, el) => {
    const blockText = $(el).text().replace(/\s+/g, ' ').trim();
    if (!blockText) return;

    const rawTeams = $(el)
      .find('[class*="team"], [class*="Team"], h3, h4, span, div')
      .map((_, node) => $(node).text().trim())
      .get()
      .filter(Boolean);

    const uniqueNames = [...new Set(rawTeams)].filter((name) => /[A-Za-z]/.test(name));
    if (uniqueNames.length < 2) return;

    const away = normalizeTeamName(uniqueNames[0]);
    const home = normalizeTeamName(uniqueNames[1]);

    const scores = $(el)
      .find('[class*="score"], [class*="Score"]')
      .map((_, node) => $(node).text().trim())
      .get()
      .map((value) => safeNumber(value))
      .filter((value): value is number => value !== null);

    const status = inferStatus(blockText);

    games.push({
      id: `ncaa-${index}-${away}-${home}`,
      provider: 'ncaa',
      status,
      round: blockText.includes('Elite')
        ? 'Elite 8'
        : blockText.includes('Sweet')
          ? 'Sweet 16'
          : 'Tournament',
      startTime: null,
      clock: status === 'LIVE' ? blockText : null,
      period: null,
      away,
      home,
      awayScore: scores[0] ?? null,
      homeScore: scores[1] ?? null,
      winner:
        status === 'FINAL' && scores.length >= 2
          ? scores[0] > scores[1]
            ? away
            : home
          : null,
    });
  });

  const deduped = Array.from(
    new Map(games.map((game) => [`${game.away}-${game.home}`, game])).values()
  );

  return {
    games: deduped,
    fetchedAt: new Date().toISOString(),
    sourceLabel: 'NCAA scoreboard',
  };
}