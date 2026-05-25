import type { Team, TeamWithRoster, PlayerProfile } from '@/lib/types/team'
import type { Match, League } from '@/lib/types/match'
import type { HeroMatchup } from '@/lib/types/hero'

const OPENDOTA_API_URL = 'https://api.opendota.com/api'

async function openDotaFetch<T>(endpoint: string): Promise<T> {
  const apiKey = process.env.OPENDOTA_API_KEY
  const url = `${OPENDOTA_API_URL}${endpoint}${apiKey ? `?api_key=${apiKey}` : ''}`

  const response = await fetch(url, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  })

  if (!response.ok) {
    throw new Error(`OpenDota API error: ${response.status}`)
  }

  return response.json()
}

export async function getTeams(): Promise<Team[]> {
  const data = await openDotaFetch<
    Array<{
      team_id: number
      name: string
      tag: string
      logo_url: string | null
      rating: number
      wins: number
      losses: number
      last_match_time: number
    }>
  >('/teams')

  return data.slice(0, 100).map((t) => ({
    id: t.team_id,
    name: t.name,
    tag: t.tag,
    logoUrl: t.logo_url,
    rating: t.rating,
    wins: t.wins,
    losses: t.losses,
    lastMatchTime: t.last_match_time,
    region: null,
  }))
}

export async function getTeam(teamId: number): Promise<TeamWithRoster | null> {
  try {
    const [teamData, playersData, matchesData] = await Promise.all([
      openDotaFetch<{
        team_id: number
        name: string
        tag: string
        logo_url: string | null
        rating: number
        wins: number
        losses: number
        last_match_time: number
      }>(`/teams/${teamId}`),
      openDotaFetch<
        Array<{
          account_id: number
          name: string
          games_played: number
          wins: number
          is_current_team_member: boolean
        }>
      >(`/teams/${teamId}/players`),
      openDotaFetch<
        Array<{
          match_id: number
          radiant_win: boolean
          duration: number
          start_time: number
          radiant_team_id: number
          dire_team_id: number
          radiant_score: number
          dire_score: number
        }>
      >(`/teams/${teamId}/matches`),
    ])

    return {
      id: teamData.team_id,
      name: teamData.name,
      tag: teamData.tag,
      logoUrl: teamData.logo_url,
      rating: teamData.rating,
      wins: teamData.wins,
      losses: teamData.losses,
      lastMatchTime: teamData.last_match_time,
      region: null,
      roster: playersData
        .filter((p) => p.is_current_team_member)
        .map((p) => ({
          accountId: p.account_id,
          name: p.name,
          personaName: p.name,
          avatar: '',
          avatarFull: '',
          countryCode: null,
          team: null,
          role: 'unknown' as const,
          isCurrentMember: p.is_current_team_member,
          joinDate: null,
          leaveDate: null,
          gamesPlayed: p.games_played,
          wins: p.wins,
        })),
      recentMatches: matchesData.slice(0, 20).map((m) => ({
        id: m.match_id,
        didRadiantWin: m.radiant_win,
        durationSeconds: m.duration,
        startDateTime: m.start_time,
        endDateTime: m.start_time + m.duration,
        gameMode: 2,
        lobbyType: 2,
        radiantTeam:
          m.radiant_team_id === teamId
            ? { id: teamId, name: teamData.name, tag: teamData.tag, logoUrl: teamData.logo_url }
            : null,
        direTeam:
          m.dire_team_id === teamId
            ? { id: teamId, name: teamData.name, tag: teamData.tag, logoUrl: teamData.logo_url }
            : null,
        players: [],
        radiantGoldAdvantage: [],
        radiantXpAdvantage: [],
        pickBans: [],
        league: null,
      })),
    }
  } catch {
    return null
  }
}

export async function getPlayer(accountId: number): Promise<PlayerProfile | null> {
  try {
    const [playerData, wlData, heroesData, matchesData] = await Promise.all([
      openDotaFetch<{
        profile: {
          account_id: number
          personaname: string
          name: string | null
          avatar: string
          avatarfull: string
          loccountrycode: string | null
        }
        rank_tier: number | null
      }>(`/players/${accountId}`),
      openDotaFetch<{ win: number; lose: number }>(`/players/${accountId}/wl`),
      openDotaFetch<
        Array<{
          hero_id: number
          games: number
          win: number
        }>
      >(`/players/${accountId}/heroes`),
      openDotaFetch<
        Array<{
          match_id: number
          radiant_win: boolean
          duration: number
          start_time: number
          hero_id: number
          kills: number
          deaths: number
          assists: number
        }>
      >(`/players/${accountId}/recentMatches`),
    ])

    const totalGames = wlData.win + wlData.lose

    return {
      accountId: playerData.profile.account_id,
      name: playerData.profile.name || playerData.profile.personaname,
      personaName: playerData.profile.personaname,
      avatar: playerData.profile.avatar,
      avatarFull: playerData.profile.avatarfull,
      countryCode: playerData.profile.loccountrycode,
      team: null,
      rank: playerData.rank_tier,
      wins: wlData.win,
      losses: wlData.lose,
      winRate: totalGames > 0 ? (wlData.win / totalGames) * 100 : 0,
      bestHeroes: heroesData.slice(0, 10).map((h) => ({
        heroId: h.hero_id,
        games: h.games,
        wins: h.win,
        winRate: h.games > 0 ? (h.win / h.games) * 100 : 0,
        kda: 0,
      })),
      recentMatches: matchesData.map((m) => ({
        id: m.match_id,
        didRadiantWin: m.radiant_win,
        durationSeconds: m.duration,
        startDateTime: m.start_time,
        endDateTime: m.start_time + m.duration,
        gameMode: 2,
        lobbyType: 2,
        radiantTeam: null,
        direTeam: null,
        players: [
          {
            steamAccountId: accountId,
            heroId: m.hero_id,
            isRadiant: true,
            playerSlot: 0,
            kills: m.kills,
            deaths: m.deaths,
            assists: m.assists,
            networth: 0,
            goldPerMinute: 0,
            experiencePerMinute: 0,
            heroDamage: 0,
            heroHealing: 0,
            towerDamage: 0,
            lastHits: 0,
            denies: 0,
            level: 1,
            items: { item0: null, item1: null, item2: null, item3: null, item4: null, item5: null },
            backpack: [],
            neutralItem: null,
            abilityBuild: [],
            goldTimeline: [],
            xpTimeline: [],
            wards: [],
            observerWards: 0,
            sentryWards: 0,
            smokeUsed: 0,
            gemsPurchased: 0,
            lanePositions: [],
            player: null,
          },
        ],
        radiantGoldAdvantage: [],
        radiantXpAdvantage: [],
        pickBans: [],
        league: null,
      })),
    }
  } catch {
    return null
  }
}

export async function getHeroMatchups(heroId: number): Promise<HeroMatchup[]> {
  try {
    const data = await openDotaFetch<
      Array<{
        hero_id: number
        games_played: number
        wins: number
      }>
    >(`/heroes/${heroId}/matchups`)

    return data.map((m) => ({
      heroId,
      vsHeroId: m.hero_id,
      gamesPlayed: m.games_played,
      wins: m.wins,
      winRate: m.games_played > 0 ? (m.wins / m.games_played) * 100 : 50,
    }))
  } catch {
    return []
  }
}

export async function getLeagues(): Promise<League[]> {
  try {
    const data = await openDotaFetch<
      Array<{
        leagueid: number
        name: string
        tier: string
      }>
    >('/leagues')

    return data.slice(0, 100).map((l) => ({
      id: l.leagueid,
      name: l.name,
      tier: mapTier(l.tier),
      prizePool: null,
      startDate: null,
      endDate: null,
      imageUrl: null,
    }))
  } catch {
    return []
  }
}

export async function getLeagueMatches(leagueId: number): Promise<Match[]> {
  try {
    const data = await openDotaFetch<
      Array<{
        match_id: number
        radiant_win: boolean
        duration: number
        start_time: number
        radiant_team_id: number
        dire_team_id: number
        radiant_name: string
        dire_name: string
        radiant_score: number
        dire_score: number
        series_id: number
        series_type: number
      }>
    >(`/leagues/${leagueId}/matches`)

    return data.map((m) => ({
      id: m.match_id,
      didRadiantWin: m.radiant_win,
      durationSeconds: m.duration,
      startDateTime: m.start_time,
      endDateTime: m.start_time + m.duration,
      gameMode: 2,
      lobbyType: 2,
      radiantTeam: {
        id: m.radiant_team_id,
        name: m.radiant_name || 'Radiant',
        tag: '',
        logoUrl: null,
      },
      direTeam: {
        id: m.dire_team_id,
        name: m.dire_name || 'Dire',
        tag: '',
        logoUrl: null,
      },
      players: [],
      radiantGoldAdvantage: [],
      radiantXpAdvantage: [],
      pickBans: [],
      league: { id: leagueId, name: '', tier: 'unknown', prizePool: null, startDate: null, endDate: null, imageUrl: null },
    }))
  } catch {
    return []
  }
}

export async function getProMatches(): Promise<Match[]> {
  try {
    const data = await openDotaFetch<
      Array<{
        match_id: number
        radiant_win: boolean
        duration: number
        start_time: number
        radiant_team_id: number
        dire_team_id: number
        radiant_name: string
        dire_name: string
        radiant_score: number
        dire_score: number
        league_name: string
        leagueid: number
      }>
    >('/proMatches')

    return data.slice(0, 50).map((m) => ({
      id: m.match_id,
      didRadiantWin: m.radiant_win,
      durationSeconds: m.duration,
      startDateTime: m.start_time,
      endDateTime: m.start_time + m.duration,
      gameMode: 2,
      lobbyType: 2,
      radiantTeam: {
        id: m.radiant_team_id,
        name: m.radiant_name || 'Radiant',
        tag: '',
        logoUrl: null,
      },
      direTeam: {
        id: m.dire_team_id,
        name: m.dire_name || 'Dire',
        tag: '',
        logoUrl: null,
      },
      players: [],
      radiantGoldAdvantage: [],
      radiantXpAdvantage: [],
      pickBans: [],
      league: {
        id: m.leagueid,
        name: m.league_name,
        tier: 'professional',
        prizePool: null,
        startDate: null,
        endDate: null,
        imageUrl: null,
      },
    }))
  } catch {
    return []
  }
}

export async function getMatchFromOpenDota(matchId: number): Promise<Match | null> {
  try {
    const data = await openDotaFetch<{
      match_id: number
      radiant_win: boolean
      duration: number
      start_time: number
      radiant_team_id: number
      dire_team_id: number
      radiant_name: string
      dire_name: string
      radiant_score: number
      dire_score: number
      radiant_gold_adv: number[]
      radiant_xp_adv: number[]
      players: Array<{
        account_id: number
        hero_id: number
        isRadiant: boolean
        player_slot: number
        kills: number
        deaths: number
        assists: number
        net_worth: number
        gold_per_min: number
        xp_per_min: number
        hero_damage: number
        hero_healing: number
        tower_damage: number
        last_hits: number
        denies: number
        level: number
        item_0: number
        item_1: number
        item_2: number
        item_3: number
        item_4: number
        item_5: number
        backpack_0: number
        backpack_1: number
        backpack_2: number
        item_neutral: number
        gold_t: number[]
        xp_t: number[]
        obs_placed: number
        sen_placed: number
        personaname: string
      }>
      picks_bans: Array<{
        is_pick: boolean
        hero_id: number
        team: number
        order: number
      }>
      league: {
        leagueid: number
        name: string
        tier: string
      } | null
    }>(`/matches/${matchId}`)

    return {
      id: data.match_id,
      didRadiantWin: data.radiant_win,
      durationSeconds: data.duration,
      startDateTime: data.start_time,
      endDateTime: data.start_time + data.duration,
      gameMode: 2,
      lobbyType: 2,
      radiantTeam: {
        id: data.radiant_team_id || 0,
        name: data.radiant_name || 'Radiant',
        tag: '',
        logoUrl: null,
      },
      direTeam: {
        id: data.dire_team_id || 0,
        name: data.dire_name || 'Dire',
        tag: '',
        logoUrl: null,
      },
      players: data.players.map((p) => ({
        steamAccountId: p.account_id,
        heroId: p.hero_id,
        isRadiant: p.player_slot < 128,
        playerSlot: p.player_slot,
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
        networth: p.net_worth,
        goldPerMinute: p.gold_per_min,
        experiencePerMinute: p.xp_per_min,
        heroDamage: p.hero_damage,
        heroHealing: p.hero_healing,
        towerDamage: p.tower_damage,
        lastHits: p.last_hits,
        denies: p.denies,
        level: p.level,
        items: {
          item0: p.item_0 || null,
          item1: p.item_1 || null,
          item2: p.item_2 || null,
          item3: p.item_3 || null,
          item4: p.item_4 || null,
          item5: p.item_5 || null,
        },
        backpack: [p.backpack_0, p.backpack_1, p.backpack_2].filter((i) => i > 0),
        neutralItem: p.item_neutral || null,
        abilityBuild: [],
        goldTimeline: p.gold_t || [],
        xpTimeline: p.xp_t || [],
        wards: [],
        observerWards: p.obs_placed || 0,
        sentryWards: p.sen_placed || 0,
        smokeUsed: 0,
        gemsPurchased: 0,
        lanePositions: [],
        player: {
          accountId: p.account_id,
          name: p.personaname || 'Unknown',
          personaName: p.personaname || 'Unknown',
          avatar: '',
          avatarFull: '',
          countryCode: null,
          team: null,
        },
      })),
      radiantGoldAdvantage: data.radiant_gold_adv || [],
      radiantXpAdvantage: data.radiant_xp_adv || [],
      pickBans: (data.picks_bans || []).map((pb) => ({
        isPick: pb.is_pick,
        heroId: pb.hero_id,
        team: pb.team === 0 ? 'radiant' : 'dire',
        order: pb.order,
        isBan: !pb.is_pick,
      })),
      league: data.league
        ? {
            id: data.league.leagueid,
            name: data.league.name,
            tier: mapTier(data.league.tier),
            prizePool: null,
            startDate: null,
            endDate: null,
            imageUrl: null,
          }
        : null,
    }
  } catch {
    return null
  }
}

function mapTier(tier: string): 'premium' | 'professional' | 'amateur' | 'unknown' {
  switch (tier?.toLowerCase()) {
    case 'premium':
    case 'professional':
      return 'premium'
    case 'amateur':
      return 'amateur'
    default:
      return 'unknown'
  }
}

// Hero endpoints using OpenDota
import type { Hero, HeroStatistics } from '@/lib/types/hero'

export async function getHeroes(): Promise<Hero[]> {
  const [heroesData, statsData] = await Promise.all([
    openDotaFetch<
      Array<{
        id: number
        name: string
        localized_name: string
        primary_attr: string
        attack_type: string
        roles: string[]
        base_health: number
        base_mana: number
        base_armor: number
        base_mr: number
        base_attack_min: number
        base_attack_max: number
        base_str: number
        base_agi: number
        base_int: number
        str_gain: number
        agi_gain: number
        int_gain: number
        attack_range: number
        move_speed: number
        legs: number
      }>
    >('/heroes'),
    openDotaFetch<
      Array<{
        id: number
        '1_pick': number
        '1_win': number
        '2_pick': number
        '2_win': number
        '3_pick': number
        '3_win': number
        '4_pick': number
        '4_win': number
        '5_pick': number
        '5_win': number
        '6_pick': number
        '6_win': number
        '7_pick': number
        '7_win': number
        '8_pick': number
        '8_win': number
      }>
    >('/heroStats'),
  ])

  // Aggregate stats across all ranks
  const statsMap = new Map<number, { picks: number; wins: number }>()
  for (const stat of statsData) {
    const picks =
      (stat['1_pick'] || 0) +
      (stat['2_pick'] || 0) +
      (stat['3_pick'] || 0) +
      (stat['4_pick'] || 0) +
      (stat['5_pick'] || 0) +
      (stat['6_pick'] || 0) +
      (stat['7_pick'] || 0) +
      (stat['8_pick'] || 0)
    const wins =
      (stat['1_win'] || 0) +
      (stat['2_win'] || 0) +
      (stat['3_win'] || 0) +
      (stat['4_win'] || 0) +
      (stat['5_win'] || 0) +
      (stat['6_win'] || 0) +
      (stat['7_win'] || 0) +
      (stat['8_win'] || 0)
    statsMap.set(stat.id, { picks, wins })
  }

  return heroesData.map((h) => {
    const stat = statsMap.get(h.id)
    const shortName = h.name.replace('npc_dota_hero_', '')

    return {
      id: h.id,
      name: h.name,
      shortName,
      displayName: h.localized_name,
      primaryAttribute: mapAttribute(h.primary_attr),
      attackType: h.attack_type.toLowerCase() as 'melee' | 'ranged',
      roles: h.roles.map((r) => r.toLowerCase()),
      complexity: 1,
      stats: {
        strength: h.base_str,
        strengthGain: h.str_gain,
        agility: h.base_agi,
        agilityGain: h.agi_gain,
        intelligence: h.base_int,
        intelligenceGain: h.int_gain,
        baseArmor: h.base_armor,
        baseMoveSpeed: h.move_speed,
        baseAttackMin: h.base_attack_min,
        baseAttackMax: h.base_attack_max,
        attackRange: h.attack_range,
        baseHealthRegen: 0,
        baseManaRegen: 0,
      },
      abilities: [],
      winRate: stat && stat.picks > 0 ? (stat.wins / stat.picks) * 100 : 50,
      pickRate: stat ? stat.picks / statsData.length : 0,
    }
  })
}

function mapAttribute(attr: string): 'strength' | 'agility' | 'intelligence' | 'universal' {
  switch (attr) {
    case 'str':
      return 'strength'
    case 'agi':
      return 'agility'
    case 'int':
      return 'intelligence'
    default:
      return 'universal'
  }
}

export async function getHeroStats(heroId: number): Promise<HeroStatistics | null> {
  try {
    const [matchupsData, heroesData] = await Promise.all([
      openDotaFetch<
        Array<{
          hero_id: number
          games_played: number
          wins: number
        }>
      >(`/heroes/${heroId}/matchups`),
      openDotaFetch<
        Array<{
          id: number
          localized_name: string
        }>
      >('/heroes'),
    ])

    const heroMap = new Map(heroesData.map((h) => [h.id, h.localized_name]))
    const totalGames = matchupsData.reduce((sum, m) => sum + m.games_played, 0)
    const totalWins = matchupsData.reduce((sum, m) => sum + m.wins, 0)

    return {
      heroId,
      winRate: totalGames > 0 ? (totalWins / totalGames) * 100 : 50,
      pickRate: 0,
      banRate: 0,
      matchCount: totalGames,
      avgKills: 0,
      avgDeaths: 0,
      avgAssists: 0,
      avgGpm: 0,
      avgXpm: 0,
      avgLastHits: 0,
      avgDenies: 0,
      avgHeroDamage: 0,
      avgTowerDamage: 0,
      avgHeroHealing: 0,
      bestAgainst: matchupsData
        .filter((m) => m.games_played > 10)
        .sort((a, b) => b.wins / b.games_played - a.wins / a.games_played)
        .slice(0, 5)
        .map((m) => ({
          heroId: m.hero_id,
          heroName: heroMap.get(m.hero_id) || 'Unknown',
          winRate: (m.wins / m.games_played) * 100,
          matchCount: m.games_played,
        })),
      worstAgainst: matchupsData
        .filter((m) => m.games_played > 10)
        .sort((a, b) => a.wins / a.games_played - b.wins / b.games_played)
        .slice(0, 5)
        .map((m) => ({
          heroId: m.hero_id,
          heroName: heroMap.get(m.hero_id) || 'Unknown',
          winRate: (m.wins / m.games_played) * 100,
          matchCount: m.games_played,
        })),
    }
  } catch {
    return null
  }
}
