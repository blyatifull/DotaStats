"use client";

import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Item } from "@/lib/types";

interface ItemTooltipProps {
  item: Item;
  children: ReactNode;
  side?: "top" | "bottom" | "left" | "right";
}

function getItemImageUrl(itemShortName: string): string {
  return `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${itemShortName}.png`;
}

const STAT_LABELS: Record<string, string> = {
  bonus_strength: "Strength",
  bonus_agility: "Agility",
  bonus_intellect: "Intelligence",
  bonus_all_stats: "All Attributes",
  bonus_damage: "Attack Damage",
  bonus_attack_speed: "Attack Speed",
  bonus_armor: "Armor",
  bonus_health: "Health",
  bonus_mana: "Mana",
  bonus_health_regen: "Health Regen",
  bonus_mana_regen: "Mana Regen",
  bonus_movement_speed: "Movement Speed",
  bonus_spell_amp: "Spell Amplification",
  bonus_magic_resistance: "Magic Resistance",
  bonus_evasion: "Evasion",
  bonus_lifesteal: "Lifesteal",
  spell_lifesteal: "Spell Lifesteal",
  cooldown_reduction: "Cooldown Reduction",
  status_resistance: "Status Resistance",
};

const QUALITY_COLORS: Record<string, string> = {
  common: "text-slate-300",
  uncommon: "text-green-400",
  rare: "text-blue-400",
  epic: "text-purple-400",
  legendary: "text-orange-400",
  artifact: "text-red-400",
  consumable: "text-cyan-400",
};

export function ItemTooltip({ item, children, side = "top" }: ItemTooltipProps) {
  const stats = item.stats || {};
  const hasStats = Object.keys(stats).length > 0;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          className="w-72 bg-slate-900/95 border-slate-700 p-0 backdrop-blur-sm"
        >
          <div className="p-3">
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded border border-slate-600 bg-slate-800">
                <img
                  src={getItemImageUrl(item.shortName)}
                  alt={item.displayName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4
                  className={cn(
                    "font-semibold leading-tight",
                    QUALITY_COLORS[item.quality || "common"] || "text-foreground"
                  )}
                >
                  {item.displayName}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {item.cost && item.cost > 0 && (
                    <span className="flex items-center gap-1 text-xs text-yellow-500">
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                      {item.cost.toLocaleString()}
                    </span>
                  )}
                  {item.quality && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs capitalize px-1.5 py-0",
                        QUALITY_COLORS[item.quality]
                      )}
                    >
                      {item.quality}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            {hasStats && (
              <div className="space-y-1 mb-3 border-t border-slate-700 pt-3">
                {Object.entries(stats).map(([key, value]) => {
                  if (!value || value === 0) return null;
                  const label = STAT_LABELS[key] || key.replace(/_/g, " ");
                  const isPositive = value > 0;
                  return (
                    <div key={key} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground capitalize">{label}</span>
                      <span className={isPositive ? "text-green-400" : "text-red-400"}>
                        {isPositive ? "+" : ""}
                        {typeof value === "number" && value < 1 && value > -1
                          ? `${(value * 100).toFixed(0)}%`
                          : value}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Active ability */}
            {item.activeDescription && (
              <div className="mb-3 border-t border-slate-700 pt-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default" className="bg-blue-600 text-xs px-1.5 py-0">
                    Active
                  </Badge>
                  {item.cooldown && (
                    <span className="text-xs text-muted-foreground">
                      {item.cooldown}s cooldown
                    </span>
                  )}
                  {item.manaCost && (
                    <span className="text-xs text-blue-400">
                      {item.manaCost} mana
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.activeDescription}
                </p>
              </div>
            )}

            {/* Passive ability */}
            {item.passiveDescription && (
              <div className="mb-3 border-t border-slate-700 pt-3">
                <Badge variant="secondary" className="text-xs px-1.5 py-0 mb-1">
                  Passive
                </Badge>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.passiveDescription}
                </p>
              </div>
            )}

            {/* Description */}
            {item.description && !item.activeDescription && !item.passiveDescription && (
              <div className="border-t border-slate-700 pt-3">
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  {item.description}
                </p>
              </div>
            )}

            {/* Components */}
            {item.components && item.components.length > 0 && (
              <div className="border-t border-slate-700 pt-3">
                <p className="text-xs text-muted-foreground mb-2">Components:</p>
                <div className="flex flex-wrap gap-1">
                  {item.components.map((componentName, i) => (
                    <div
                      key={i}
                      className="h-6 w-6 overflow-hidden rounded border border-slate-700 bg-slate-800"
                    >
                      <img
                        src={getItemImageUrl(componentName)}
                        alt={componentName}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {item.lore && (
            <div className="bg-slate-800/50 px-3 py-2 border-t border-slate-700">
              <p className="text-xs text-slate-500 italic leading-relaxed">
                {item.lore}
              </p>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Simple wrapper for item icons with tooltips
interface ItemWithTooltipProps {
  item: Item;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ItemWithTooltip({
  item,
  size = "md",
  className,
}: ItemWithTooltipProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  return (
    <ItemTooltip item={item}>
      <div
        className={cn(
          "relative overflow-hidden rounded border border-border bg-muted cursor-pointer transition-transform hover:scale-110 hover:border-primary/50",
          sizeClasses[size],
          className
        )}
      >
        <img
          src={getItemImageUrl(item.shortName)}
          alt={item.displayName}
          className="h-full w-full object-cover"
        />
      </div>
    </ItemTooltip>
  );
}
