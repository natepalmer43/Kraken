import type { GameBlurb } from '../lib/types'

/**
 * Scouting reports for every game on the plan. Edit freely through the season:
 * push to main and GitHub Pages redeploys. Keys are `${date}|${opponent}` so
 * they survive schedule refreshes. Keep `updated` current so the app can show
 * how fresh a report is.
 *
 * Kraken context for 2026-27: Lane Lambert's second year behind the bench,
 * Jordan Eberle captains. Seattle missed the playoffs in 2025-26 (34-37-11,
 * 79 pts, 6th in the Pacific). The big summer move was trading a first-round
 * pick to Florida for Mackie Samoskevich; Jaden Schwartz (COL), Eeli Tolvanen
 * (NYR) and Jamie Oleksiak (VAN) all left in free agency and come back to
 * Climate Pledge this year. The league moved to an 84-game schedule.
 */
export const BLURBS: Record<string, GameBlurb> = {
  '2026-10-04|CGY': {
    headline: 'Home opener: Samoskevich scores twice in a 6-1 rout',
    story:
      'Seattle opened Climate Pledge with a 3-0 first period and never looked back, beating Calgary 6-1 for the second time in four days (same score in Calgary on Oct. 1). Berkly Catton opened the scoring, Mackie Samoskevich had two in his first home game as a Kraken, and Joey Daccord stopped 32 of 33.',
    rivalry:
      'Pacific Division rival. The Flames are in a full teardown after dealing Kadri, Andersson and Weegar last season, and this is their final year in the Saddledome.',
    stars: [
      { name: 'Mackie Samoskevich', team: 'SEA', note: 'Two goals; the summer trade from Florida paying off immediately' },
      { name: 'Berkly Catton', team: 'SEA', note: 'Goal and an assist; the 2024 first-rounder is a full-time NHLer now' },
      { name: 'Matt Coronato', team: 'OPP', note: 'Led Calgary with 45 points last year on the lowest-scoring team in the league' },
      { name: 'Dustin Wolf', team: 'OPP', note: 'The one reason the Flames stay in games' },
    ],
    updated: '2026-10-10',
  },
  '2026-10-20|DET': {
    headline: 'The Larkin soap opera comes to town',
    story:
      'Detroit is trying to end a playoff drought that just hit ten years, and it is doing so while its captain Dylan Larkin has a trade request on the table and the front office is run by an interim GM (Shawn Horcoff) after Steve Yzerman stepped aside. Whether Larkin is still a Red Wing on Oct. 20, and whether he is dressed, is the thing to check that morning. This is the second meeting in eleven days after Seattle visited Detroit on Oct. 9.',
    rivalry: 'Once-a-year visitor from the Atlantic. No history to speak of, which is why the Larkin drama is the draw.',
    stars: [
      { name: 'Lucas Raymond', team: 'OPP', note: "Detroit's best forward and the one actually carrying the offense" },
      { name: 'Moritz Seider', team: 'OPP', note: 'Big-minute No. 1 defenseman' },
      { name: 'Viktor Arvidsson', team: 'OPP', note: 'Two-year, $10M summer signing' },
      { name: 'John Gibson', team: 'OPP', note: 'Veteran starter in goal' },
    ],
    updated: '2026-10-10',
  },
  '2026-10-28|TOR': {
    headline: 'Leafs Nation travels. Resale this one if you can bear to.',
    story:
      'Toronto blew it up after a 32-36-14 season: John Chayka is the new GM with Mats Sundin advising, Jim Hiller is behind the bench, and the summer brought Darren Raddysh (eight-year sign-and-trade from Tampa), Sergei Bobrovsky in goal and No. 1 overall pick Gavin McKenna. Matthews, Nylander and Knies are still the engine. Leafs games are always among the priciest on the calendar because half the building wears blue.',
    rivalry: 'No hockey rivalry, but a resale rivalry: Toronto fans fill west-coast buildings every year.',
    stars: [
      { name: 'Auston Matthews', team: 'OPP', note: 'Projected for another 40-goal year' },
      { name: 'Gavin McKenna', team: 'OPP', note: 'The 2026 first overall pick, fighting for a top-six spot as a rookie' },
      { name: 'Darren Raddysh', team: 'OPP', note: '70 points from the blue line last year; runs the power play' },
      { name: 'Sergei Bobrovsky', team: 'OPP', note: 'Two Cups in Florida, now a Leaf on a three-year deal' },
    ],
    updated: '2026-10-10',
  },
  '2026-11-07|NYR': {
    headline: 'Tolvanen comes back. Saturday matinee.',
    story:
      'Eeli Tolvanen took a one-year, $1.5M deal with the Rangers after five seasons in Seattle (12 goals, 36 points last year), so expect a video tribute. New York retooled around Igor Shesterkin and Adam Fox: Vincent Trocheck went to Utah, Artemi Panarin left for Los Angeles, and Pavel Dorofeyev arrived from Vegas for a pile of picks. A 2 PM Saturday start makes this one of the easiest games on the plan to bring kids to.',
    rivalry: 'Original Six draw. The Rangers missed the playoffs last year (34-39-9) and are trying to prove the retool worked.',
    stars: [
      { name: 'Eeli Tolvanen', team: 'OPP', note: 'Ex-Kraken, first game back at Climate Pledge' },
      { name: 'Igor Shesterkin', team: 'OPP', note: 'Still the best reason to watch New York' },
      { name: 'Adam Fox', team: 'OPP', note: 'Norris-calibre defenseman' },
      { name: 'Pavel Dorofeyev', team: 'OPP', note: 'Sniper acquired from Vegas in the summer' },
    ],
    updated: '2026-10-10',
  },
  '2026-11-19|VAN': {
    headline: 'The I-5 rivalry, with Oleksiak on the other side',
    story:
      'Vancouver finished dead last in the NHL at 58 points, traded Quinn Hughes to Minnesota in December, and is openly rebuilding under new coach Manny Malhotra with an eye on the 2027 draft. Jamie Oleksiak signed there for two years at $5M, so the big man returns. The Canucks still send a loud travelling crowd down the highway, which keeps resale strong even in a down year.',
    rivalry:
      "Seattle's closest geographic rival and its first-ever home opponent (Oct. 23, 2021). The only building where the visiting fans sing back.",
    stars: [
      { name: 'Jamie Oleksiak', team: 'OPP', note: 'Ex-Kraken shutdown defenseman, now a Canuck' },
      { name: 'Elias Pettersson', team: 'OPP', note: 'Led Vancouver with 51 points in a rough year; needs a bounce-back' },
      { name: 'Brendan Gallagher', team: 'OPP', note: 'Veteran pest added to the rebuild' },
      { name: 'Matty Beniers', team: 'SEA', note: 'Seattle usually matches its top centre against whatever Vancouver has' },
    ],
    updated: '2026-10-10',
  },
  '2026-11-28|EDM': {
    headline: 'McDavid, in a contract year, on a Saturday night',
    story:
      'Connor McDavid put up 138 points last season and is playing out the final year of his deal, which will be the story every night Edmonton plays. Mike Babcock is the new head coach, Darnell Nurse was traded to San Jose, and the goalie room (Tristan Jarry, Frederik Andersen, Devon Levi) is the deepest the Oilers have had in years. Edmonton beat Seattle 3-1 on Oct. 3 in the second game of the season.',
    rivalry: 'Pacific heavyweight. The Oilers finished second in the division last year (93 points) and are built to win now.',
    stars: [
      { name: 'Connor McDavid', team: 'OPP', note: '138 points; best player alive, contract expiring' },
      { name: 'Leon Draisaitl', team: 'OPP', note: '97 points in 65 games last season' },
      { name: 'Tristan Jarry', team: 'OPP', note: 'The goalie Edmonton is betting the season on' },
      { name: 'Joey Daccord', team: 'SEA', note: 'Seattle needs him stealing one against this lineup' },
    ],
    updated: '2026-10-10',
  },
  '2026-12-01|DAL': {
    headline: 'The 2023 second-round rematch, every year',
    story:
      'Dallas kept its stars on a tight cap: Jason Robertson took a one-year, $12M deal after leading the team with 96 points, Wyatt Johnston scored 45, and Mikko Rantanen is on the top line. Roope Hintz is back after tearing his hamstring twice in March. The Stars are the class of the Central again, which makes this a tough Tuesday.',
    rivalry: "Dallas beat Seattle in seven games in the 2023 second round, the Kraken's deepest playoff run.",
    stars: [
      { name: 'Jason Robertson', team: 'OPP', note: '96 points, playing for a new contract' },
      { name: 'Wyatt Johnston', team: 'OPP', note: '45 goals last season' },
      { name: 'Mikko Rantanen', team: 'OPP', note: 'Elite winger on the top line' },
      { name: 'Jared McCann', team: 'SEA', note: "Seattle's leading scorer; the power play goes through him" },
    ],
    updated: '2026-10-10',
  },
  '2026-12-06|BUF': {
    headline: 'The Sabres after the sell-off',
    story:
      'Buffalo piled up 109 points last season and then spent the summer shipping out Alex Tuch (sign-and-trade to Washington) and Bowen Byram (to Chicago for the No. 4 pick). What is left is still dangerous: Tage Thompson had 40 goals, Rasmus Dahlin 74 points, and Owen Power and Zach Benson keep improving. Olen Zellweger came in from Anaheim to replace some of Byram\'s offense. Sunday 5 PM start.',
    rivalry: 'Once-a-year Atlantic visitor. Buffalo is a long trip for its fans, so the building will be mostly Kraken.',
    stars: [
      { name: 'Tage Thompson', team: 'OPP', note: '40 goals, 81 points; 6-foot-6 with a cannon' },
      { name: 'Rasmus Dahlin', team: 'OPP', note: '74 points from the blue line' },
      { name: 'Ukko-Pekka Luukkonen', team: 'OPP', note: 'Starter who has to repeat last year' },
      { name: 'Zach Benson', team: 'OPP', note: 'Young winger on the rise' },
    ],
    updated: '2026-10-10',
  },
  '2026-12-29|PHI': {
    headline: 'Holiday-week game against a real Flyers team',
    story:
      'Philadelphia went 43-27-12, finished third in the Metro and won a playoff round last spring under Rick Tocchet. Matvei Michkov had a disappointing 51-point second season and is on the top line to fix it, Trevor Zegras and Porter Martone give them skill, and Dan Vladar starts with Joseph Woll (from Toronto) behind him. The Flyers also tried to steal Leo Carlsson with a $90M offer sheet; Anaheim matched. Seattle picked up Devin Kaplan from the Flyers on Oct. 1.',
    rivalry: 'None, but Flyers crowds travel better than you would think and the holiday week fills the building regardless.',
    stars: [
      { name: 'Matvei Michkov', team: 'OPP', note: 'Bounce-back year on the top line' },
      { name: 'Travis Konecny', team: 'OPP', note: 'Captain-type energy, always in your face' },
      { name: 'Dan Vladar', team: 'OPP', note: 'Established No. 1 goalie' },
      { name: 'Shane Wright', team: 'SEA', note: 'Scored in the home opener; the second line runs through him' },
    ],
    updated: '2026-10-10',
  },
  '2027-01-02|NYI': {
    headline: 'Schaefer, the unanimous Calder winner, on a Saturday',
    story:
      'Matthew Schaefer scored 23 goals as a rookie defenseman and won the Calder unanimously; he is the reason to go. Bo Horvat is the new captain (31 goals), Mathew Barzal led the team with 72 points and moves back to centre under Peter DeBoer, and Ilya Sorokin is still elite. The Islanders missed the playoffs twice running and their power play was 30th, so DeBoer\'s first full season is a prove-it year.',
    rivalry: "Lane Lambert and Jordan Eberle both spent years on Long Island; it's a homecoming game for the coach and captain.",
    stars: [
      { name: 'Matthew Schaefer', team: 'OPP', note: '23 goals as a rookie D; Calder Trophy' },
      { name: 'Ilya Sorokin', team: 'OPP', note: 'One of the best goalies in the league' },
      { name: 'Bo Horvat', team: 'OPP', note: 'New captain, 31 goals' },
      { name: 'Jordan Eberle', team: 'SEA', note: 'Seven seasons as an Islander before Seattle' },
    ],
    updated: '2026-10-10',
  },
  '2027-01-12|FLA': {
    headline: 'The Tkachuk brothers, and Samoskevich vs. his old team',
    story:
      'Florida missed the playoffs last year (40-38-4) after back-to-back Cups because Aleksander Barkov missed the whole season with a knee injury and Matthew Tkachuk was hurt too. The response was to trade two first-round picks to Ottawa for Brady Tkachuk, putting both brothers on one line. Bobrovsky left for Toronto, so Jacob Markstrom has to carry the net. Mackie Samoskevich, who Seattle got from Florida for a first, faces his old team.',
    rivalry: 'Samoskevich revenge game. Two-time champs rebuilding their swagger.',
    stars: [
      { name: 'Matthew Tkachuk', team: 'OPP', note: 'Back healthy, now with his brother on the wing' },
      { name: 'Brady Tkachuk', team: 'OPP', note: 'The blockbuster summer acquisition' },
      { name: 'Aleksander Barkov', team: 'OPP', note: 'Best two-way centre in hockey, back from a lost year' },
      { name: 'Mackie Samoskevich', team: 'SEA', note: 'First game against the team that drafted him' },
    ],
    updated: '2026-10-10',
  },
  '2027-01-16|SJS': {
    headline: 'Celebrini. That is the whole blurb.',
    story:
      'Macklin Celebrini had 115 points last season, a Sharks franchise record, and his $18.8M-a-year contract starts now. Will Smith (59 points at 21) and Michael Misa (2025 No. 2 pick) are the next wave, Ivar Stenberg went second overall in 2026, and the Sharks added Darnell Nurse, Jacob Trouba and Mason Marchment to grow up fast. San Jose finished four points out of the playoffs and ahead of Seattle; this is a direct Pacific rival now, not a bottom-feeder.',
    rivalry: 'Pacific Division. The Sharks leapfrogged the Kraken last year and the two teams are fighting for the same wild-card spot.',
    stars: [
      { name: 'Macklin Celebrini', team: 'OPP', note: '115 points; the best young player in the game' },
      { name: 'Will Smith', team: 'OPP', note: "Celebrini's running mate; 59 points" },
      { name: 'Michael Misa', team: 'OPP', note: 'Second-year forward, second overall pick in 2025' },
      { name: 'Darnell Nurse', team: 'OPP', note: 'Ex-Oiler, now the veteran on the Sharks blue line' },
    ],
    updated: '2026-10-10',
  },
  '2027-01-31|NJD': {
    headline: 'Sunday matinee with Jack Hughes',
    story:
      'Jack Hughes is the show when healthy, Nico Hischier re-signed for five years at $11.7M, and Anthony Mantha (33 goals in Pittsburgh) signed for two years to fill out the top six with Timo Meier and Jesper Bratt. The question is the net: Jacob Markstrom was traded to Florida, so 36-year-old Jake Allen and Nico Daws are holding it down. New GM Sunny Mehta runs the show. A 1 PM start on a Sunday is a rare daytime game.',
    rivalry: 'None. Pure skill-watching game.',
    stars: [
      { name: 'Jack Hughes', team: 'OPP', note: 'The Devils go as he goes' },
      { name: 'Nico Hischier', team: 'OPP', note: 'Captain, freshly extended' },
      { name: 'Luke Hughes', team: 'OPP', note: "Jack's brother and the top defenseman" },
      { name: 'Anthony Mantha', team: 'OPP', note: 'Summer signing, 33-goal season last year' },
    ],
    updated: '2026-10-10',
  },
  '2027-02-13|STL': {
    headline: 'The post-Kyrou Blues, the night before Valentine\'s',
    story:
      'St. Louis traded Jordan Kyrou to Washington for Connor McMichael, Milton Gastrin and a first, then swung a draft-day deal for Mason McTavish from Anaheim. Robert Thomas is the new captain on a line with Jimmy Snuggerud and Dylan Holloway, Jordan Binnington stayed despite all the rumours, and Alex Steen is running the roster day to day under Doug Armstrong. It is a team in between, so by mid-February they are either in the hunt or selling.',
    rivalry: 'Central visitor. Saturday night, which keeps the resale value up regardless of opponent.',
    stars: [
      { name: 'Robert Thomas', team: 'OPP', note: 'New captain and the best playmaker on the team' },
      { name: 'Mason McTavish', team: 'OPP', note: 'Acquired from Anaheim at the draft' },
      { name: 'Jordan Binnington', team: 'OPP', note: 'Still in St. Louis, still unpredictable' },
      { name: 'Jimmy Snuggerud', team: 'OPP', note: 'Young winger on the top line' },
    ],
    updated: '2026-10-10',
  },
  '2027-02-27|WPG': {
    headline: 'Will Hellebuyck still be a Jet?',
    story:
      'Connor Hellebuyck asked out of Winnipeg, skipped training camp and was suspended without pay; as of early October he still had not been traded, with Carolina, Buffalo and three-team ideas all floated. Stuart Skinner signed for two years to start in the meantime. Mark Scheifele (103 points) and Kyle Connor (92) are still elite, but the team fell from 116 points to 82 and missed the playoffs. Check the goalie situation the week of this game. Saturday 4 PM start.',
    rivalry: 'Central visitor, once a year. Otherwise just a good Saturday game.',
    stars: [
      { name: 'Mark Scheifele', team: 'OPP', note: '103 points last season' },
      { name: 'Kyle Connor', team: 'OPP', note: '39 goals, 92 points' },
      { name: 'Stuart Skinner', team: 'OPP', note: 'Starting while the Hellebuyck saga plays out' },
      { name: 'Cole Perfetti', team: 'OPP', note: 'Bounce-back candidate' },
    ],
    updated: '2026-10-10',
  },
  '2027-03-11|LAK': {
    headline: 'First visit from the post-Kopitar Kings',
    story:
      'Anze Kopitar retired after 20 seasons as the franchise leader in everything, and Peter Laviolette was hired to loosen up a team that played an NHL-record 28 overtime games last year and lost 22 of them. Artemi Panarin signed to run the offense with Adrian Kempe and Kevin Fiala, Quinton Byfield is the No. 1 centre now, and the summer brought Mats Zuccarello, Corey Perry and Erik Haula. March Pacific games are where the wild-card race gets decided.',
    rivalry: 'Pacific Division. The Kings took the last wild-card spot last year with 90 points; Seattle was eleven back.',
    stars: [
      { name: 'Artemi Panarin', team: 'OPP', note: 'New in LA after years as a Ranger' },
      { name: 'Quinton Byfield', team: 'OPP', note: "Kopitar's successor at centre" },
      { name: 'Adrian Kempe', team: 'OPP', note: 'Goal scorer on the top line' },
      { name: 'Drew Doughty', team: 'OPP', note: 'The last of the old guard' },
    ],
    updated: '2026-10-10',
  },
  '2027-03-19|COL': {
    headline: 'Schwartz comes home, and the 2023 first-round rematch',
    story:
      'Jaden Schwartz was an original Kraken for five seasons before signing a three-year deal in Colorado on July 2, so this is his tribute-video night. The Avalanche scored the most goals in the league last year (298) and allowed the fewest (197), Nathan MacKinnon won the Rocket Richard with 53, and Cale Makar is Cale Makar. Friday night in March against the best team in the West is a premium ticket.',
    rivalry: "The 2023 first round: Seattle beat the defending-champion Avalanche in seven games, the franchise's first playoff series win.",
    stars: [
      { name: 'Jaden Schwartz', team: 'OPP', note: 'Ex-Kraken, first game back' },
      { name: 'Nathan MacKinnon', team: 'OPP', note: '53 goals; Rocket Richard winner' },
      { name: 'Cale Makar', team: 'OPP', note: 'Best defenseman in the world' },
      { name: 'Vince Dunn', team: 'SEA', note: "Seattle's answer on the blue line; big minutes against MacKinnon" },
    ],
    updated: '2026-10-10',
  },
  '2027-03-23|VGK': {
    headline: 'The Western champs, with a new coach and a grudge',
    story:
      'Vegas lost the Stanley Cup Final in six to Carolina after leading the series, fired John Tortorella two days later and hired Ryan Craig, its third coach in three months. Jack Eichel (90 points), Mitch Marner (29 playoff points in his first Vegas spring) and Mark Stone are still the core, with Shea Theodore and Noah Hanifin on the back end. The Golden Knights beat Seattle 6-2 at Climate Pledge on Oct. 6; late March is playoff-positioning time for both.',
    rivalry: "Expansion cousins. Vegas was the Kraken's first-ever opponent (Oct. 12, 2021) and the Pacific's team to beat ever since.",
    stars: [
      { name: 'Jack Eichel', team: 'OPP', note: 'Two best scoring seasons in franchise history, back to back' },
      { name: 'Mitch Marner', team: 'OPP', note: '80 points plus a historic playoff run in year one' },
      { name: 'Mark Stone', team: 'OPP', note: 'Captain; the guy who always finds the puck' },
      { name: 'Shea Theodore', team: 'OPP', note: 'Elite skating defenseman' },
    ],
    updated: '2026-10-10',
  },
  '2027-03-25|ANA': {
    headline: 'Carlsson at $18M a year, two nights after Vegas',
    story:
      'Anaheim matched a five-year, $90M offer sheet from Philadelphia to keep Leo Carlsson, then had to move Mason McTavish and let John Carlson, Radko Gudas, Olen Zellweger and Jacob Trouba walk to fit it. Cutter Gauthier led the Ducks with 41 goals, and the team finished third in the Pacific at 92 points, 13 points ahead of Seattle. If both teams are chasing the same wild card, this Thursday is a four-point game.',
    rivalry: 'Pacific Division. Anaheim jumped Seattle in the standings last year; the Kraken want it back.',
    stars: [
      { name: 'Leo Carlsson', team: 'OPP', note: 'Franchise centre, $18M AAV' },
      { name: 'Cutter Gauthier', team: 'OPP', note: '41 goals, 69 points' },
      { name: 'Lukas Dostal', team: 'OPP', note: 'Starting goalie' },
      { name: 'Chandler Stephenson', team: 'SEA', note: 'Matchup centre for nights like this' },
    ],
    updated: '2026-10-10',
  },
  '2027-03-30|UTA': {
    headline: 'Last home game of the plan: Keller, Guenther and Trocheck',
    story:
      'Utah made the playoffs last season and took a 2-1 series lead on Vegas before losing in six, then added Vincent Trocheck from the Rangers and Anders Lee to push further. Clayton Keller captains with 88 points, Dylan Guenther led the team with 40 goals, and Logan Cooley is the breakout pick after an injury-shortened year. This is the final game on the ticket plan, so whoever has it gets the closing-night sendoff.',
    rivalry: 'Central contender, and the last home date on the plan. Fan-appreciation energy whether or not Seattle is still alive.',
    stars: [
      { name: 'Clayton Keller', team: 'OPP', note: 'Captain, 88 points' },
      { name: 'Dylan Guenther', team: 'OPP', note: '40 goals' },
      { name: 'Logan Cooley', team: 'OPP', note: 'Breakout candidate' },
      { name: 'Vincent Trocheck', team: 'OPP', note: 'Summer trade from New York' },
    ],
    updated: '2026-10-10',
  },
}

export function blurbFor(game: { date: string; opponent: string }): GameBlurb | undefined {
  return BLURBS[`${game.date}|${game.opponent}`]
}
