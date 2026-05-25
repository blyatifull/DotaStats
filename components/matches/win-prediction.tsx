"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeroMatchup {
  heroId: number;
  heroName: string;
  winRate: number;
  matchups: {
    againstHeroId: number;
    againstHeroName: string;
    advantage: number;
  }[];
}

interface WinPredictionProps {
  radiantHeroes: {
    id: number;
    name: string;
    localizedName: string;
    winRate?: number;
  }[];
  direHeroes: {
    id: number;
    name: string;
    localizedName: string;
    winRate?: number;
  }[];
  matchupData?: HeroMatchup[];
  className?: string;
}

function getHeroImageUrl(heroName: string): string {
  const formattedName = heroName.replace("npc_dota_hero_", "");
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${formattedName}.png`;
}

interface MatchupFactor {
  description: string;
  advantage: number;
  team: "radiant" | "dire";
}

export function WinPrediction({
  radiantHeroes,
  direHeroes,
  matchupData = [],
  className,
}: WinPredictionProps) {
  const prediction = useMemo(() => {
    let radiantAdvantage = 0;
    const factors: MatchupFactor[] = [];

    // Calculate based on individual hero win rates
    const radiantWinRateAvg =
      radiantHeroes.reduce((sum, h) => sum + (h.winRate || 50), 0) /
      radiantHeroes.length;
    const direWinRateAvg =
      direHeroes.reduce((sum, h) => sum + (h.winRate || 50), 0) /
      direHeroes.length;

    const winRateDiff = radiantWinRateAvg - direWinRateAvg;
    radiantAdvantage += winRateDiff * 0.5;

    if (Math.abs(winRateDiff) > 2) {
      factors.push({
        description: `${winRateDiff > 0 ? "Radiant" : "Dire"} has higher average hero win rates`,
        advantage: Math.abs(winRateDiff) * 0.5,
        team: winRateDiff > 0 ? "radiant" : "dire",
      });
    }

    // Calculate matchup advantages
    matchupData.forEach((heroMatchup) => {
      const isRadiant = radiantHeroes.some((h) => h.id === heroMatchup.heroId);
      const enemyTeam = isRadiant ? direHeroes : radiantHeroes;

      heroMatchup.matchups.forEach((matchup) => {
        if (enemyTeam.some((h) => h.id === matchup.againstHeroId)) {
          const advantage = isRadiant ? matchup.advantage : -matchup.advantage;
          radiantAdvantage += advantage * 0.1;

          if (Math.abs(matchup.advantage) > 3) {
            factors.push({
              description: `${heroMatchup.heroName} ${matchup.advantage > 0 ? "counters" : "is countered by"} ${matchup.againstHeroName}`,
              advantage: Math.abs(matchup.advantage),
              team:
                matchup.advantage > 0
                  ? isRadiant
                    ? "radiant"
                    : "dire"
                  : isRadiant
                    ? "dire"
                    : "radiant",
            });
          }
        }
      });
    });

    // Normalize to percentage
    const baseWinRate = 50;
    const radiantWinChance = Math.max(
      15,
      Math.min(85, baseWinRate + radiantAdvantage)
    );
    const direWinChance = 100 - radiantWinChance;

    return {
      radiantWinChance,
      direWinChance,
      factors: factors.slice(0, 6),
      confidence:
        Math.abs(radiantWinChance - 50) > 10 ? "high" : factors.length > 3 ? "medium" : "low",
    };
  }, [radiantHeroes, direHeroes, matchupData]);

  return (
    <Card className={cn("bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Win Prediction</CardTitle>
          <Badge
            variant={
              prediction.confidence === "high"
                ? "default"
                : prediction.confidence === "medium"
                  ? "secondary"
                  : "outline"
            }
          >
            {prediction.confidence} confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Win probability bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span className="text-green-500">
              Radiant {prediction.radiantWinChance.toFixed(1)}%
            </span>
            <span className="text-red-500">
              Dire {prediction.direWinChance.toFixed(1)}%
            </span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-500"
              style={{ width: `${prediction.radiantWinChance}%` }}
            />
          </div>
        </div>

        {/* Hero matchups visualization */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Radiant</p>
            <div className="flex flex-wrap gap-1">
              {radiantHeroes.map((hero) => (
                <TooltipProvider key={hero.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative h-8 w-14 overflow-hidden rounded border border-green-500/30">
                        <img
                          src={getHeroImageUrl(hero.name)}
                          alt={hero.localizedName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{hero.localizedName}</p>
                      {hero.winRate && (
                        <p className="text-xs text-muted-foreground">
                          {hero.winRate.toFixed(1)}% win rate
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Dire</p>
            <div className="flex flex-wrap justify-end gap-1">
              {direHeroes.map((hero) => (
                <TooltipProvider key={hero.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative h-8 w-14 overflow-hidden rounded border border-red-500/30">
                        <img
                          src={getHeroImageUrl(hero.name)}
                          alt={hero.localizedName}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{hero.localizedName}</p>
                      {hero.winRate && (
                        <p className="text-xs text-muted-foreground">
                          {hero.winRate.toFixed(1)}% win rate
                        </p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          </div>
        </div>

        {/* Key factors */}
        {prediction.factors.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Key Factors
            </p>
            <div className="space-y-1">
              {prediction.factors.map((factor, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-xs"
                >
                  <div
                    className={cn(
                      "h-2 w-2 rounded-full",
                      factor.team === "radiant" ? "bg-green-500" : "bg-red-500"
                    )}
                  />
                  <span className="text-muted-foreground">
                    {factor.description}
                  </span>
                  <span
                    className={cn(
                      "ml-auto font-medium",
                      factor.team === "radiant"
                        ? "text-green-500"
                        : "text-red-500"
                    )}
                  >
                    +{factor.advantage.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Based on hero win rates and matchup advantages. Actual results may
          vary based on player skill and game circumstances.
        </p>
      </CardContent>
    </Card>
  );
}
