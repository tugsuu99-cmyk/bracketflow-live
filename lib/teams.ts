const TEAM_ALIASES: Record<string, string[]> = {
  Arizona: ['Arizona', 'Arizona Wildcats'],
  'Iowa St.': ['Iowa State', 'Iowa St.', 'Iowa State Cyclones'],
  Houston: ['Houston', 'Houston Cougars'],
  Duke: ['Duke', 'Duke Blue Devils'],
  Florida: ['Florida', 'Florida Gators'],
  Michigan: ['Michigan', 'Michigan Wolverines'],
  UConn: ['UConn', 'Connecticut', 'UConn Huskies'],
  "St. John's": ["St. John's", 'St Johns', "St. John's Red Storm"],
};

export function normalizeTeamName(input: string): string {
  const cleaned = input.trim().toLowerCase();

  for (const [canonical, aliases] of Object.entries(TEAM_ALIASES)) {
    if ([canonical, ...aliases].some((name) => name.toLowerCase() === cleaned)) {
      return canonical;
    }
  }

  return input.trim();
}