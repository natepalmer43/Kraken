export interface TeamInfo {
  abbrev: string
  city: string
  name: string
  /** primary, secondary */
  colors: [string, string]
  /** Divisional / regional rival or marquee draw. Drives game value. */
  draw: 'rival' | 'marquee' | 'regular'
}

export const TEAMS: Record<string, TeamInfo> = {
  ANA: { abbrev: 'ANA', city: 'Anaheim', name: 'Ducks', colors: ['#F47A38', '#B9975B'], draw: 'regular' },
  BOS: { abbrev: 'BOS', city: 'Boston', name: 'Bruins', colors: ['#FFB81C', '#000000'], draw: 'marquee' },
  BUF: { abbrev: 'BUF', city: 'Buffalo', name: 'Sabres', colors: ['#003087', '#FFB81C'], draw: 'regular' },
  CAR: { abbrev: 'CAR', city: 'Carolina', name: 'Hurricanes', colors: ['#CE1126', '#A2AAAD'], draw: 'marquee' },
  CBJ: { abbrev: 'CBJ', city: 'Columbus', name: 'Blue Jackets', colors: ['#002654', '#CE1126'], draw: 'regular' },
  CGY: { abbrev: 'CGY', city: 'Calgary', name: 'Flames', colors: ['#D2001C', '#FAAF19'], draw: 'rival' },
  CHI: { abbrev: 'CHI', city: 'Chicago', name: 'Blackhawks', colors: ['#CF0A2C', '#000000'], draw: 'marquee' },
  COL: { abbrev: 'COL', city: 'Colorado', name: 'Avalanche', colors: ['#6F263D', '#236192'], draw: 'marquee' },
  DAL: { abbrev: 'DAL', city: 'Dallas', name: 'Stars', colors: ['#006847', '#8F8F8C'], draw: 'marquee' },
  DET: { abbrev: 'DET', city: 'Detroit', name: 'Red Wings', colors: ['#CE1126', '#FFFFFF'], draw: 'regular' },
  EDM: { abbrev: 'EDM', city: 'Edmonton', name: 'Oilers', colors: ['#FF4C00', '#041E42'], draw: 'rival' },
  FLA: { abbrev: 'FLA', city: 'Florida', name: 'Panthers', colors: ['#C8102E', '#B9975B'], draw: 'marquee' },
  LAK: { abbrev: 'LAK', city: 'Los Angeles', name: 'Kings', colors: ['#111111', '#A2AAAD'], draw: 'regular' },
  MIN: { abbrev: 'MIN', city: 'Minnesota', name: 'Wild', colors: ['#154734', '#A6192E'], draw: 'regular' },
  MTL: { abbrev: 'MTL', city: 'Montréal', name: 'Canadiens', colors: ['#AF1E2D', '#192168'], draw: 'marquee' },
  NJD: { abbrev: 'NJD', city: 'New Jersey', name: 'Devils', colors: ['#CE1126', '#000000'], draw: 'regular' },
  NSH: { abbrev: 'NSH', city: 'Nashville', name: 'Predators', colors: ['#FFB81C', '#041E42'], draw: 'regular' },
  NYI: { abbrev: 'NYI', city: 'New York', name: 'Islanders', colors: ['#00539B', '#F47D30'], draw: 'regular' },
  NYR: { abbrev: 'NYR', city: 'New York', name: 'Rangers', colors: ['#0038A8', '#CE1126'], draw: 'marquee' },
  OTT: { abbrev: 'OTT', city: 'Ottawa', name: 'Senators', colors: ['#DA1A32', '#B79257'], draw: 'regular' },
  PHI: { abbrev: 'PHI', city: 'Philadelphia', name: 'Flyers', colors: ['#F74902', '#000000'], draw: 'regular' },
  PIT: { abbrev: 'PIT', city: 'Pittsburgh', name: 'Penguins', colors: ['#FCB514', '#000000'], draw: 'marquee' },
  SJS: { abbrev: 'SJS', city: 'San Jose', name: 'Sharks', colors: ['#006D75', '#EA7200'], draw: 'regular' },
  SEA: { abbrev: 'SEA', city: 'Seattle', name: 'Kraken', colors: ['#001628', '#99D9D9'], draw: 'regular' },
  STL: { abbrev: 'STL', city: 'St. Louis', name: 'Blues', colors: ['#002F87', '#FCB514'], draw: 'regular' },
  TBL: { abbrev: 'TBL', city: 'Tampa Bay', name: 'Lightning', colors: ['#002868', '#FFFFFF'], draw: 'marquee' },
  TOR: { abbrev: 'TOR', city: 'Toronto', name: 'Maple Leafs', colors: ['#00205B', '#FFFFFF'], draw: 'marquee' },
  UTA: { abbrev: 'UTA', city: 'Utah', name: 'Mammoth', colors: ['#6CACE4', '#010101'], draw: 'regular' },
  VAN: { abbrev: 'VAN', city: 'Vancouver', name: 'Canucks', colors: ['#00843D', '#00205B'], draw: 'rival' },
  VGK: { abbrev: 'VGK', city: 'Vegas', name: 'Golden Knights', colors: ['#B4975A', '#333F42'], draw: 'rival' },
  WSH: { abbrev: 'WSH', city: 'Washington', name: 'Capitals', colors: ['#041E42', '#C8102E'], draw: 'marquee' },
  WPG: { abbrev: 'WPG', city: 'Winnipeg', name: 'Jets', colors: ['#041E42', '#004C97'], draw: 'regular' },
}

export function teamInfo(abbrev: string): TeamInfo {
  return (
    TEAMS[abbrev] ?? {
      abbrev,
      city: abbrev,
      name: '',
      colors: ['#355464', '#68A2B9'],
      draw: 'regular',
    }
  )
}
