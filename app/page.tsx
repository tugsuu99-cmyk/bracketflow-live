'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Bell,
  UserCircle2,
  Trophy,
  Medal,
  ChevronRight,
  RefreshCw,
  Wifi,
  WifiOff,
  Activity,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

type Standing = {
  rank: number;
  name: string;
  currentPoints: number;
  maxPoints: number;
  odds: number;
};

type Game = {
  id: number;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
};

type DashboardData = {
  meta: {
    lastUpdated: string;
  };
  standings: Standing[];
  games: Game[];
};

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

function Panel({
  className = '',
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-gradient-to-br from-white/10 via-white/5 to-transparent" />
      <div className="relative">{children}</div>
    </div>
  );
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [selected, setSelected] = useState('TG');
  const [refreshing, setRefreshing] = useState(false);
  const [connected, setConnected] = useState(true);

  async function fetchData(silent = false) {
    try {
      if (silent) setRefreshing(true);
      const res = await fetch('/api/dashboard', { cache: 'no-store' });
      const json = await res.json();
      setData(json);
      setConnected(true);
    } catch (e) {
      console.error(e);
      setConnected(false);
    } finally {
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(true), 30000);
    return () => clearInterval(interval);
  }, []);

  const selectedPlayer = useMemo(() => {
    return data?.standings?.find((p) => p.name === selected) || data?.standings?.[0];
  }, [data, selected]);

  if (!data) {
    return (
      <div className="grid min-h-screen place-items-center bg-black text-white">
        <div className="text-center">
          <RefreshCw className="mx-auto h-10 w-10 animate-spin text-blue-300" />
          <div className="mt-4 text-xl">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-black text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.35),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.20),transparent_30%),linear-gradient(135deg,#030712,#05070d_35%,#070b15_60%,#02040a)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:48px_48px]" />
      <div className="absolute -left-32 top-12 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

      <main className="relative mx-auto max-w-[1600px] p-6 md:p-8">
        <Panel className="mb-7 px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/20 ring-1 ring-blue-400/30">
                <Trophy className="h-6 w-6 text-blue-300" />
              </div>
              <div>
                <div className="text-3xl font-semibold tracking-tight">BracketFlow Live</div>
                <div className="text-sm text-white/55">March Madness pool dashboard</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-white/60">
              <button
                onClick={() => fetchData(true)}
                className="flex items-center gap-2 rounded-2xl bg-black/20 px-4 py-3 ring-1 ring-white/10 hover:bg-white/10"
              >
                <RefreshCw className={cn('h-4 w-4', refreshing ? 'animate-spin' : '')} />
                Refresh
              </button>

              <div className="flex items-center gap-2 rounded-2xl bg-black/20 px-4 py-3 ring-1 ring-white/10">
                {connected ? (
                  <Wifi className="h-4 w-4 text-green-300" />
                ) : (
                  <WifiOff className="h-4 w-4 text-amber-300" />
                )}
                <span>{connected ? 'Connected' : 'Disconnected'}</span>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/20 ring-1 ring-white/10">
                <Search className="h-5 w-5" />
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black/20 ring-1 ring-white/10">
                <Bell className="h-5 w-5" />
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/20 ring-1 ring-blue-400/30">
                <UserCircle2 className="h-6 w-6 text-blue-200" />
              </div>
            </div>
          </div>
        </Panel>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Panel className="p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-6xl font-semibold leading-[1.05] tracking-tight">
                  Pool Odds
                  <br />
                  Overview
                </div>
                <div className="mt-4 max-w-xl text-base text-white/60">
                  Your live March Madness dashboard with standings, current rank, and game tracking.
                </div>
              </div>
              <div className="rounded-full bg-green-400/10 px-3 py-2 text-sm text-green-300 ring-1 ring-green-400/20">
                ● Updated
              </div>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="relative min-h-[380px] rounded-[28px] bg-black/20 p-6 ring-1 ring-white/10">
                <div className="absolute left-8 top-8">
                  <div className="text-sm uppercase tracking-[0.25em] text-white/40">Spotlight bracket</div>
                  <div className="mt-2 text-3xl font-semibold">{selectedPlayer?.name}</div>
                </div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="absolute left-1/2 top-1/2 flex h-56 w-56 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-red-400/30 bg-[radial-gradient(circle,rgba(255,0,0,0.22),rgba(255,0,0,0.06),transparent_72%)] shadow-[0_0_80px_rgba(239,68,68,0.35)]"
                >
                  <div className="text-center">
                    <div className="text-sm uppercase tracking-[0.35em] text-red-200/60">Win odds</div>
                    <div className="mt-2 text-6xl font-semibold text-white">{selectedPlayer?.odds}%</div>
                    <div className="mt-3 text-sm text-white/60">Current rank #{selectedPlayer?.rank}</div>
                  </div>
                </motion.div>

                <div className="absolute left-10 bottom-12 text-sm text-white/70">
                  <div className="text-white/50">Current points</div>
                  <div className="mt-1 text-2xl font-semibold">{selectedPlayer?.currentPoints}</div>
                </div>

                <div className="absolute bottom-12 right-10 text-right text-sm text-white/70">
                  <div className="text-white/50">Max possible</div>
                  <div className="mt-1 text-2xl font-semibold">{selectedPlayer?.maxPoints}</div>
                </div>
              </div>

              <div className="space-y-4">
                <Panel className="p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/45">Last updated</div>
                  <div className="mt-2 text-xl font-semibold break-words">{data.meta.lastUpdated}</div>
                </Panel>
                <Panel className="p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/45">Your rank</div>
                  <div className="mt-2 text-3xl font-semibold">
                    #{data.standings.find((p) => p.name === 'TG')?.rank}
                  </div>
                </Panel>
                <Panel className="p-4">
                  <div className="text-xs uppercase tracking-[0.22em] text-white/45">Your odds</div>
                  <div className="mt-2 text-3xl font-semibold text-green-300">
                    {data.standings.find((p) => p.name === 'TG')?.odds}%
                  </div>
                </Panel>
              </div>
            </div>
          </Panel>

          <Panel className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-3xl font-semibold">Pool Rank Odds</div>
                <div className="text-sm text-white/50">Who is most likely to win the pool</div>
              </div>
            </div>
            <div className="h-[420px] rounded-[24px] bg-black/20 p-3 ring-1 ring-white/10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.standings} barCategoryGap={18}>
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.35)" tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15,23,42,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 18,
                    }}
                  />
                  <Bar dataKey="odds" radius={[14, 14, 14, 14]} fill="rgba(255,255,255,0.95)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Panel>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <Panel className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-4xl font-semibold">Live Games</div>
                <div className="text-sm text-white/50">Current scoreboard feed</div>
              </div>
            </div>
           <div className="space-y-3">
  {data.games && data.games.length > 0 ? (
    data.games.map((game) => (
      <div
        key={game.id}
        className="flex items-center justify-between rounded-2xl bg-black/20 p-4 ring-1 ring-white/10"
      >
        <div>
          <div className="text-lg font-medium">
            {game.away} vs {game.home}
          </div>
          <div className="mt-1 text-sm text-cyan-200">
            {game.awayScore == null || game.homeScore == null
              ? 'Upcoming'
              : `${game.away} ${game.awayScore} · ${game.home} ${game.homeScore}`}
          </div>
        </div>
        <div className="rounded-full bg-blue-500/15 px-3 py-2 text-sm text-blue-200 ring-1 ring-blue-400/20">
          <Activity className="mr-2 inline-block h-4 w-4" />
          {game.status}
        </div>
      </div>
    ))
  ) : (
    <div className="rounded-2xl bg-black/20 p-4 ring-1 ring-white/10 text-white/60">
      No live games detected from feed
    </div>
  )}
</div>
          </Panel>

          <Panel className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-4xl font-semibold">Standings</div>
                <div className="text-sm text-white/50">Click a player to spotlight their bracket</div>
              </div>
            </div>

            <div className="space-y-3">
              {data.standings.map((row, i) => (
                <button
                  key={row.name}
                  onClick={() => setSelected(row.name)}
                  className={cn(
                    'w-full rounded-[24px] p-4 text-left transition duration-200',
                    selected === row.name
                      ? 'bg-blue-500/15 ring-1 ring-blue-400/30'
                      : 'bg-black/20 ring-1 ring-white/10 hover:bg-white/10'
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          'flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-semibold',
                          i === 0
                            ? 'bg-amber-400/15 text-amber-200 ring-1 ring-amber-300/20'
                            : 'bg-white/10 text-white/80 ring-1 ring-white/10'
                        )}
                      >
                        {i === 0 ? <Medal className="h-5 w-5" /> : row.rank}
                      </div>
                      <div>
                        <div className="text-lg font-semibold">{row.name}</div>
                        <div className="text-sm text-white/45">
                          {row.currentPoints} pts · max {row.maxPoints}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-white/45">Win odds</div>
                        <div className="text-2xl font-semibold">{row.odds}%</div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-white/35" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Panel>
        </div>
      </main>
    </div>
  );
}