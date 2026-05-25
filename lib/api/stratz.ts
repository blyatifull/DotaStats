import type { Hero, HeroStatistics, HeroMatchup, HeroBuild, Ability } from '@/lib/types/hero'
import type { Match, MatchPlayer, WardPlacement } from '@/lib/types/match'
import type { Item } from '@/lib/types/item'

const STRATZ_API_URL = 'https://api.stratz.com/graphql'

async function stratzQuery<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const token = process.env.STRATZ_API_TOKEN
  
  const response = await fetch(STRATZ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 },
  })

  if (!response.ok) {
    throw new Error(`Stratz API error: ${response.status}`)
  }

  const data = await response.json()
  if (data.errors) {
    console.error('Stratz GraphQL errors:', data.errors)
    throw new Error(data.errors[0]?.message || 'GraphQL error')
  }

  return data.data as T
}

export async function getHeroes(): Promise<Hero[]> {
  const query = `
    query GetHeroes {
      constants {
        heroes {
          id
          name
          shortName
          displayName
          stats {
            primaryAttribute
            attackType
            startingArmor
            startingDamageMin
            startingDamageMax
            attackRange
            moveSpeed
            strengthBase
            strengthGain
            agilityBase
            agilityGain
            intelligenceBase
            intelligenceGain
            hpRegen
            mpRegen
          }
          roles {
            roleId
            level
          }
        }
      }
    }
  `

  const data = await stratzQuery<{
    constants: {
      heroes: Array<{
        id: number
        name: string
        shortName: string
        displayName: string
        stats: {
          primaryAttribute: string
          attackType: string
          startingArmor: number
          startingDamageMin: number
          startingDamageMax: number
          attackRange: number
          moveSpeed: number
          strengthBase: number
          strengthGain: number
          agilityBase: number
          agilityGain: number
          intelligenceBase: number
          intelligenceGain: number
          hpRegen: number
          mpRegen: number
        }
        roles: Array<{ roleId: string; level: number }>
      }>
    }
  }>(query)

  return data.constants.heroes.map((h) => ({
    id: h.id,
    name: h.name,
    shortName: h.shortName,
    displayName: h.displayName,
    primaryAttribute: mapAttribute(h.stats?.primaryAttribute),
    attackType: h.stats?.attackType === 'Melee' ? 'Melee' : 'Ranged',
    roles: h.roles?.map((r) => mapRole(r.roleId)) || [],
    stats: {
      baseStrength: h.stats?.strengthBase || 0,
      strengthGain: h.stats?.strengthGain || 0,
      baseAgility: h.stats?.agilityBase || 0,
      agilityGain: h.stats?.agilityGain || 0,
      baseIntelligence: h.stats?.intelligenceBase || 0,
      intelligenceGain: h.stats?.intelligenceGain || 0,
      baseHealth: 120 + (h.stats?.strengthBase || 0) * 22,
      baseMana: 75 + (h.stats?.intelligenceBase || 0) * 12,
      moveSpeed: h.stats?.moveSpeed || 300,
      armor: h.stats?.startingArmor || 0,
      attackRange: h.stats?.attackRange || 150,
      attackRate: 1.7,
      baseDamageMin: h.stats?.startingDamageMin || 0,
      baseDamageMax: h.stats?.startingDamageMax || 0,
    },
  }))
}

export async function getHeroStats(): Promise<HeroStatistics[]> {
  const query = `
    query GetHeroStats {
      heroStats {
        winWeek {
          heroId
          winCount
          matchCount
          banCount
        }
      }
    }
  `

  const data = await stratzQuery<{
    heroStats: {
      winWeek: Array<{
        heroId: number
        winCount: number
        matchCount: number
        banCount: number
      }>
    }
  }>(query)

  const totalMatches = data.heroStats.winWeek.reduce((sum, h) => sum + h.matchCount, 0) / 10

  return data.heroStats.winWeek.map((h) => ({
    heroId: h.heroId,
    winCount: h.winCount,
    pickCount: h.matchCount,
    banCount: h.banCount,
    winRate: h.matchCount > 0 ? (h.winCount / h.matchCount) * 100 : 0,
    pickRate: totalMatches > 0 ? (h.matchCount / totalMatches) * 100 : 0,
    banRate: totalMatches > 0 ? (h.banCount / totalMatches) * 100 : 0,
  }))
}

export async function getHero(heroId: number): Promise<Hero | null> {
  const heroes = await getHeroes()
  return heroes.find((h) => h.id === heroId) || null
}

export async function getHeroBuild(heroId: number): Promise<HeroBuild | null> {
  const query = `
    query GetHeroBuild($heroId: Short!) {
      heroStats {
        guide(heroId: $heroId, take: 1) {
          startingItems
          earlyGameItems
          midGameItems
          lateGameItems
        }
      }
    }
  `

  try {
    const data = await stratzQuery<{
      heroStats: {
        guide: Array<{
          startingItems: number[]
          earlyGameItems: number[]
          midGameItems: number[]
          lateGameItems: number[]
        }>
      }
    }>(query, { heroId })

    const guide = data.heroStats.guide[0]
    if (!guide) return null

    return {
      heroId,
      startingItems: guide.startingItems || [],
      earlyGameItems: guide.earlyGameItems || [],
      coreItems: guide.midGameItems || [],
      lateGameItems: guide.lateGameItems || [],
      abilityBuild: [],
      talents: [],
    }
  } catch {
    return null
  }
}

export async function getRecentProMatches(take: number = 20): Promise<Match[]> {
  const query = `
    query GetProMatches($take: Int!) {
      live {
        matches(take: $take) {
          matchId
          gameTime
          radiantScore
          direScore
          radiantTeam {
            teamId
            name
            tag
          }
          direTeam {
            teamId
            name
            tag
          }
          players {
            heroId
            isRadiant
          }
        }
      }
    }
  `

  try {
    const data = await stratzQuery<{
      live: {
        matches: Array<{
          matchId: number
          gameTime: number
          radiantScore: number
          direScore: number
          radiantTeam: { teamId: number; name: string; tag: string } | null
          direTeam: { teamId: number; name: string; tag: string } | null
          players: Array<{ heroId: number; isRadiant: boolean }>
        }>
      }
    }>(query, { take })

    return data.live.matches.map((m) => ({
      id: m.matchId,
      didRadiantWin: m.radiantScore > m.direScore,
      durationSeconds: m.gameTime,
      startDateTime: Date.now() / 1000,
      endDateTime: Date.now() / 1000,
      gameMode: 2,
      lobbyType: 2,
      radiantTeam: m.radiantTeam
        ? {
            id: m.radiantTeam.teamId,
            name: m.radiantTeam.name,
            tag: m.radiantTeam.tag,
            logoUrl: null,
          }
        : null,
      direTeam: m.direTeam
        ? {
            id: m.direTeam.teamId,
            name: m.direTeam.name,
            tag: m.direTeam.tag,
            logoUrl: null,
          }
        : null,
      players: m.players.map((p, i) => ({
        steamAccountId: 0,
        heroId: p.heroId,
        isRadiant: p.isRadiant,
        playerSlot: i,
        kills: 0,
        deaths: 0,
        assists: 0,
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
      })),
      radiantGoldAdvantage: [],
      radiantXpAdvantage: [],
      pickBans: [],
      league: null,
    }))
  } catch {
    return []
  }
}

export async function getMatchDetails(matchId: number): Promise<Match | null> {
  const query = `
    query GetMatch($matchId: Long!) {
      match(id: $matchId) {
        id
        didRadiantWin
        durationSeconds
        startDateTime
        endDateTime
        gameMode
        lobbyType
        radiantTeam {
          id
          name
          tag
          logo
        }
        direTeam {
          id
          name
          tag
          logo
        }
        players {
          steamAccountId
          heroId
          isRadiant
          playerSlot
          kills
          deaths
          assists
          networth
          goldPerMinute
          experiencePerMinute
          heroDamage
          heroHealing
          towerDamage
          numLastHits
          numDenies
          level
          item0Id
          item1Id
          item2Id
          item3Id
          item4Id
          item5Id
          backpack0Id
          backpack1Id
          backpack2Id
          neutral0Id
          gold
          goldSpent
          playbackData {
            goldEvents {
              time
              gold
            }
            experienceEvents {
              time
              xp
            }
            wardEvents {
              time
              positionX
              positionY
              wardType
            }
            deathEvents {
              time
            }
          }
          steamAccount {
            id
            name
            avatar
            proSteamAccount {
              name
              team {
                id
                name
                tag
              }
            }
          }
        }
        pickBans {
          isPick
          heroId
          isRadiant
          order
        }
        radiantNetworthLeads
        radiantExperienceLeads
        league {
          id
          displayName
          tier
          prizePool
          startDateTime
          endDateTime
        }
      }
    }
  `

  try {
    const data = await stratzQuery<{
      match: {
        id: number
        didRadiantWin: boolean
        durationSeconds: number
        startDateTime: number
        endDateTime: number
        gameMode: number
        lobbyType: number
        radiantTeam: { id: number; name: string; tag: string; logo: string } | null
        direTeam: { id: number; name: string; tag: string; logo: string } | null
        players: Array<{
          steamAccountId: number
          heroId: number
          isRadiant: boolean
          playerSlot: number
          kills: number
          deaths: number
          assists: number
          networth: number
          goldPerMinute: number
          experiencePerMinute: number
          heroDamage: number
          heroHealing: number
          towerDamage: number
          numLastHits: number
          numDenies: number
          level: number
          item0Id: number | null
          item1Id: number | null
          item2Id: number | null
          item3Id: number | null
          item4Id: number | null
          item5Id: number | null
          backpack0Id: number | null
          backpack1Id: number | null
          backpack2Id: number | null
          neutral0Id: number | null
          gold: number
          goldSpent: number
          playbackData: {
            goldEvents: Array<{ time: number; gold: number }>
            experienceEvents: Array<{ time: number; xp: number }>
            wardEvents: Array<{
              time: number
              positionX: number
              positionY: number
              wardType: string
            }>
            deathEvents: Array<{ time: number }>
          } | null
          steamAccount: {
            id: number
            name: string
            avatar: string
            proSteamAccount: {
              name: string
              team: { id: number; name: string; tag: string } | null
            } | null
          } | null
        }>
        pickBans: Array<{
          isPick: boolean
          heroId: number
          isRadiant: boolean
          order: number
        }>
        radiantNetworthLeads: number[]
        radiantExperienceLeads: number[]
        league: {
          id: number
          displayName: string
          tier: string
          prizePool: number
          startDateTime: number
          endDateTime: number
        } | null
      }
    }>(query, { matchId })

    const match = data.match
    if (!match) return null

    return {
      id: match.id,
      didRadiantWin: match.didRadiantWin,
      durationSeconds: match.durationSeconds,
      startDateTime: match.startDateTime,
      endDateTime: match.endDateTime,
      gameMode: match.gameMode,
      lobbyType: match.lobbyType,
      radiantTeam: match.radiantTeam
        ? {
            id: match.radiantTeam.id,
            name: match.radiantTeam.name,
            tag: match.radiantTeam.tag,
            logoUrl: match.radiantTeam.logo,
          }
        : null,
      direTeam: match.direTeam
        ? {
            id: match.direTeam.id,
            name: match.direTeam.name,
            tag: match.direTeam.tag,
            logoUrl: match.direTeam.logo,
          }
        : null,
      players: match.players.map((p) => ({
        steamAccountId: p.steamAccountId,
        heroId: p.heroId,
        isRadiant: p.isRadiant,
        playerSlot: p.playerSlot,
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
        networth: p.networth,
        goldPerMinute: p.goldPerMinute,
        experiencePerMinute: p.experiencePerMinute,
        heroDamage: p.heroDamage,
        heroHealing: p.heroHealing,
        towerDamage: p.towerDamage,
        lastHits: p.numLastHits,
        denies: p.numDenies,
        level: p.level,
        items: {
          item0: p.item0Id,
          item1: p.item1Id,
          item2: p.item2Id,
          item3: p.item3Id,
          item4: p.item4Id,
          item5: p.item5Id,
        },
        backpack: [p.backpack0Id, p.backpack1Id, p.backpack2Id].filter((i): i is number => i !== null),
        neutralItem: p.neutral0Id,
        abilityBuild: [],
        goldTimeline: p.playbackData?.goldEvents.map((e) => e.gold) || [],
        xpTimeline: p.playbackData?.experienceEvents.map((e) => e.xp) || [],
        wards: (p.playbackData?.wardEvents || []).map((w) => ({
          time: w.time,
          x: w.positionX,
          y: w.positionY,
          type: w.wardType === 'observer' ? 'observer' : 'sentry',
          isRadiant: p.isRadiant,
        })) as WardPlacement[],
        observerWards: (p.playbackData?.wardEvents || []).filter((w) => w.wardType === 'observer').length,
        sentryWards: (p.playbackData?.wardEvents || []).filter((w) => w.wardType === 'sentry').length,
        smokeUsed: 0,
        gemsPurchased: 0,
        lanePositions: [],
        player: p.steamAccount
          ? {
              accountId: p.steamAccount.id,
              name: p.steamAccount.proSteamAccount?.name || p.steamAccount.name,
              personaName: p.steamAccount.name,
              avatar: p.steamAccount.avatar,
              avatarFull: p.steamAccount.avatar,
              countryCode: null,
              team: p.steamAccount.proSteamAccount?.team
                ? {
                    id: p.steamAccount.proSteamAccount.team.id,
                    name: p.steamAccount.proSteamAccount.team.name,
                    tag: p.steamAccount.proSteamAccount.team.tag,
                    logoUrl: null,
                    rating: 0,
                    wins: 0,
                    losses: 0,
                    lastMatchTime: 0,
                  }
                : null,
            }
          : null,
      })),
      radiantGoldAdvantage: match.radiantNetworthLeads || [],
      radiantXpAdvantage: match.radiantExperienceLeads || [],
      pickBans: match.pickBans.map((pb) => ({
        isPick: pb.isPick,
        heroId: pb.heroId,
        team: pb.isRadiant ? 'radiant' : 'dire',
        order: pb.order,
        isBan: !pb.isPick,
      })),
      league: match.league
        ? {
            id: match.league.id,
            name: match.league.displayName,
            tier: mapTier(match.league.tier),
            prizePool: match.league.prizePool,
            startDate: match.league.startDateTime,
            endDate: match.league.endDateTime,
            imageUrl: null,
          }
        : null,
    }
  } catch (error) {
    console.error('Error fetching match details:', error)
    return null
  }
}

export async function getItems(): Promise<Item[]> {
  const query = `
    query GetItems {
      constants {
        items {
          id
          name
          shortName
          displayName
          language {
            description
            lore
            notes
            attributes
          }
          stat {
            cost
            isNeutralDrop
            neutralItemTier
            isRecipe
            isSideShop
            isSecretShop
          }
          components
        }
      }
    }
  `

  try {
    const data = await stratzQuery<{
      constants: {
        items: Array<{
          id: number
          name: string
          shortName: string
          displayName: string
          language: {
            description: string
            lore: string
            notes: string[]
            attributes: string[]
          } | null
          stat: {
            cost: number
            isNeutralDrop: boolean
            neutralItemTier: number | null
            isRecipe: boolean
            isSideShop: boolean
            isSecretShop: boolean
          } | null
          components: number[] | null
        }>
      }
    }>(query)

    return data.constants.items.map((item) => ({
      id: item.id,
      name: item.name,
      shortName: item.shortName,
      displayName: item.displayName,
      cost: item.stat?.cost || 0,
      description: item.language?.description || '',
      lore: item.language?.lore || '',
      notes: item.language?.notes || [],
      attributes: [],
      components: item.components || [],
      isNeutral: item.stat?.isNeutralDrop || false,
      neutralTier: item.stat?.neutralItemTier || null,
      isRecipe: item.stat?.isRecipe || false,
      isSideShop: item.stat?.isSideShop || false,
      isSecretShop: item.stat?.isSecretShop || false,
    }))
  } catch {
    return []
  }
}

export async function getAbilities(): Promise<Ability[]> {
  const query = `
    query GetAbilities {
      constants {
        abilities {
          id
          name
          language {
            displayName
            description
          }
          stat {
            cooldown
            manaCost
            isUltimate
          }
        }
      }
    }
  `

  try {
    const data = await stratzQuery<{
      constants: {
        abilities: Array<{
          id: number
          name: string
          language: {
            displayName: string
            description: string
          } | null
          stat: {
            cooldown: number[]
            manaCost: number[]
            isUltimate: boolean
          } | null
        }>
      }
    }>(query)

    return data.constants.abilities.map((ability, index) => ({
      id: ability.id,
      name: ability.name,
      displayName: ability.language?.displayName || ability.name,
      description: ability.language?.description || '',
      cooldown: ability.stat?.cooldown || [],
      manaCost: ability.stat?.manaCost || [],
      isUltimate: ability.stat?.isUltimate || false,
      slot: index % 6,
    }))
  } catch {
    return []
  }
}

// Helper functions
function mapAttribute(attr: string | undefined): 'str' | 'agi' | 'int' | 'all' {
  switch (attr?.toLowerCase()) {
    case 'strength':
    case 'str':
      return 'str'
    case 'agility':
    case 'agi':
      return 'agi'
    case 'intelligence':
    case 'int':
      return 'int'
    default:
      return 'all'
  }
}

function mapRole(roleId: string): string {
  const roleMap: Record<string, string> = {
    '0': 'Carry',
    '1': 'Escape',
    '2': 'Nuker',
    '3': 'Initiator',
    '4': 'Durable',
    '5': 'Disabler',
    '6': 'Support',
    '7': 'Pusher',
    '8': 'Jungler',
  }
  return roleMap[roleId] || 'Unknown'
}

function mapTier(tier: string): 'premium' | 'professional' | 'amateur' | 'unknown' {
  switch (tier?.toLowerCase()) {
    case 'premium':
    case 'dpc_qualifier':
    case 'dpc_league_qualifier':
    case 'dpc_league':
    case 'dpc_finals':
    case 'international':
      return 'premium'
    case 'professional':
      return 'professional'
    case 'amateur':
      return 'amateur'
    default:
      return 'unknown'
  }
}
