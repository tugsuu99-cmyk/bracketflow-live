import * as cheerio from 'cheerio';
import { normalizeTeamName } from '@/lib/teams';
import type { LiveGame, ScoreProviderResult } from './types';

const CBS_SCOREBOARD_URL = 'https://www.cbssports.com/college-basketball/scoreboard/';
const CBS_BRACKET_URL = 'https://www.cbssports.com/college-basketball/ncaa-tournament/bracket/';

function inferStatus(text: string): 'PRE' | 'LIVE' | 'FINAL' {
  const value = text.toLowerCase();
  if (value.includes('final')) return 'FINAL';
  if (
    value.includes('live') ||
    value.includes('halftime') ||
    value.includes('1st') ||
    value.includes('2nd') ||
    value.includes(':')
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

function cleanText(input: string) {
  return input.replace(/\s+/g, ' ').trim();
}

function buildGameId(away: string, home: string, index: number) {
  return `cbs-${index}-${away}-${home}`
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\-_.]/g, '');
}

async function fetchHtml(url: string) {
  const response = await fetch(url, {
    headers: {
      'user-agent': 'BracketFlowLive/1.0',
      accept: 'text/html,application/xhtml+xml',
    },
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`CBS fetch failed: ${response.status} for ${url}`);
  }

  return response.text();
}

function parseGamesFromHtml(html: string, source: 'scoreboard' | 'bracket'): LiveGame[] {
  const $ = cheerio.load(html);
  const games: LiveGame[] = [];

  $('article, section, div').each((index, el) => {
    const blockText = cleanText($(el).text());
    if (!blockText) return;

    const lower = blockText.toLowerCase();
    const looksRelevant =
      lower.includes('final') ||
      lower.includes('live') ||
      lower.includes('vs') ||
      lower.includes('matchup') ||
      lower.includes('score');

    if (!looksRelevant) return;

    const rawTexts = $(el)
      .find('h2, h3, h4, span, div, a')
      .map((_, node) => cleanText($(node).text()))
      .get()
      .filter(Boolean);

    const possibleTeams = [...new Set(rawTexts)].filter(
      (text) =>
        /[A-Za-z]/.test(text) &&
        text.length > 1 &&
        text.length < 40 &&
        !/final|live|watch|preview|recap|box score|odds|spread|total/i.test(text)
    );

    if (possibleTeams.length < 2) return;

    const away = normalizeTeamName(possibleTeams[0]);
    const home = normalizeTeamName(possibleTeams[1]);

    if (!away || !home || away === home) return;

    const numericTexts = rawTexts
      .map((text) => safeNumber(text))
      .filter((n): n is number => n !== null);

    const awayScore = numericTexts[0] ?? null;
    const homeScore = numericTexts[1] ?? null;

    const status = inferStatus(blockText);

    games.push({
      id: buildGameId(away, home, index),
      provider: 'ncaa', // keep existing type contract unchanged
      status,
      round:
        blockText.includes('Elite') ? 'Elite 8' :
        blockText.includes('Sweet') ? 'Sweet 16' :
        blockText.includes('Final Four') ? 'Final Four' :
        blockText.includes('Championship') ? 'Championship' :
        source === 'bracket' ? 'Tournament' : 'Scoreboard',
      startTime: null,
      clock: status === 'LIVE' ? blockText : null,
      period: null,
      away,
      home,
      awayScore,
      homeScore,
      winner:
        status === 'FINAL' && awayScore !== null && homeScore !== null
          ? awayScore > homeScore
            ? away
            : home
          : null,
    });
  });

  const deduped = Array.from(
    new Map(games.map((game) => [`${game.away}-${game.home}`, game])).values()
  );

  return deduped.filter(
    (game) =>
      game.home &&
      game.away &&
      game.home !== game.away &&
      game.home.length > 1 &&
      game.away.length > 1
  );
}

export async function fetchCbsScores(): Promise<ScoreProviderResult> {
  const [scoreboardHtml, bracketHtml] = await Promise.all([
    fetchHtml(CBS_SCOREBOARD_URL),
    fetchHtml(CBS_BRACKET_URL),
  ]);

  const scoreboardGames = parseGamesFromHtml(scoreboardHtml, 'scoreboard');
  const bracketGames = parseGamesFromHtml(bracketHtml, 'bracket');

  const merged = Array.from(
    new Map(
      [...scoreboardGames, ...bracketGames].map((game) => [`${game.away}-${game.home}`, game])
    ).values()
  );

  return {
    games: merged,
    fetchedAt: new Date().toISOString(),
    sourceLabel: 'CBS Sports',
  };
}