import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    meta: {
      title: 'BracketFlow Live',
      subtitle: 'March Madness pool dashboard',
      lastUpdated: new Date().toISOString(),
      connected: true,
      refreshSeconds: 30,
    },
    standings: [
      { rank: 1, name: 'Friske', currentPoints: 118, maxPoints: 186, odds: 28.5 },
      { rank: 2, name: 'Doko', currentPoints: 116, maxPoints: 182, odds: 18.2 },
      { rank: 3, name: 'Gunee', currentPoints: 114, maxPoints: 180, odds: 16.8 },
      { rank: 4, name: 'Beck', currentPoints: 112, maxPoints: 176, odds: 10.8 },
      { rank: 5, name: 'Kuaya', currentPoints: 109, maxPoints: 172, odds: 7.7 },
      { rank: 6, name: 'Manlai', currentPoints: 107, maxPoints: 166, odds: 6.1 },
      { rank: 7, name: 'TG', currentPoints: 105, maxPoints: 164, odds: 4.5 },
      { rank: 8, name: 'Temmy', currentPoints: 103, maxPoints: 161, odds: 4.4 },
      { rank: 9, name: 'Hata', currentPoints: 98, maxPoints: 154, odds: 3.0 },
    ],
    games: [
      { id: 1, home: 'Arizona', away: 'Iowa St.', homeScore: 71, awayScore: 66, status: 'LIVE' },
      { id: 2, home: 'Houston', away: 'Duke', homeScore: 78, awayScore: 72, status: 'FINAL' },
      { id: 3, home: 'Florida', away: 'Michigan', homeScore: null, awayScore: null, status: 'UP NEXT' },
    ],
  });
}