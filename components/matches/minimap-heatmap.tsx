"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Position {
  x: number;
  y: number;
  time: number;
  playerId?: number;
  playerName?: string;
  team?: "radiant" | "dire";
}

interface WardPosition {
  x: number;
  y: number;
  time: number;
  type: "observer" | "sentry";
  team: "radiant" | "dire";
  playerName?: string;
}

interface MinimapHeatmapProps {
  positions?: Position[];
  wards?: WardPosition[];
  radiantPositions?: Position[];
  direPositions?: Position[];
  className?: string;
}

const MINIMAP_SIZE = 400;
const GAME_MAP_SIZE = 16384;

function gameToMinimapCoord(gameCoord: number): number {
  return ((gameCoord + GAME_MAP_SIZE / 2) / GAME_MAP_SIZE) * MINIMAP_SIZE;
}

function HeatmapLayer({
  positions,
  color,
  opacity = 0.6,
}: {
  positions: Position[];
  color: string;
  opacity?: number;
}) {
  const heatmapData = useMemo(() => {
    const grid: number[][] = Array(40)
      .fill(null)
      .map(() => Array(40).fill(0));

    positions.forEach((pos) => {
      const x = Math.floor(gameToMinimapCoord(pos.x) / 10);
      const y = Math.floor(gameToMinimapCoord(pos.y) / 10);
      if (x >= 0 && x < 40 && y >= 0 && y < 40) {
        grid[y][x]++;
      }
    });

    const maxValue = Math.max(...grid.flat());
    return { grid, maxValue };
  }, [positions]);

  return (
    <svg
      className="absolute inset-0"
      viewBox={`0 0 ${MINIMAP_SIZE} ${MINIMAP_SIZE}`}
      style={{ opacity }}
    >
      {heatmapData.grid.map((row, y) =>
        row.map((value, x) => {
          if (value === 0) return null;
          const intensity = value / heatmapData.maxValue;
          return (
            <rect
              key={`${x}-${y}`}
              x={x * 10}
              y={y * 10}
              width={10}
              height={10}
              fill={color}
              opacity={intensity * 0.8}
              rx={2}
            />
          );
        })
      )}
    </svg>
  );
}

function WardMarker({ ward }: { ward: WardPosition }) {
  const x = gameToMinimapCoord(ward.x);
  const y = MINIMAP_SIZE - gameToMinimapCoord(ward.y);

  const isObserver = ward.type === "observer";
  const teamColor = ward.team === "radiant" ? "#22c55e" : "#ef4444";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <g className="cursor-pointer transition-transform hover:scale-125">
            <circle
              cx={x}
              cy={y}
              r={isObserver ? 8 : 6}
              fill={isObserver ? "#fbbf24" : "#3b82f6"}
              stroke={teamColor}
              strokeWidth={2}
              className="drop-shadow-lg"
            />
            {isObserver && (
              <circle cx={x} cy={y} r={3} fill={teamColor} />
            )}
          </g>
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-card border-border">
          <div className="text-sm">
            <p className="font-medium">
              {isObserver ? "Observer Ward" : "Sentry Ward"}
            </p>
            {ward.playerName && (
              <p className="text-muted-foreground">{ward.playerName}</p>
            )}
            <p className="text-muted-foreground">
              {Math.floor(ward.time / 60)}:{String(ward.time % 60).padStart(2, "0")}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function PositionMarker({ position }: { position: Position }) {
  const x = gameToMinimapCoord(position.x);
  const y = MINIMAP_SIZE - gameToMinimapCoord(position.y);
  const color = position.team === "radiant" ? "#22c55e" : "#ef4444";

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <circle
            cx={x}
            cy={y}
            r={4}
            fill={color}
            className="cursor-pointer transition-transform hover:scale-150"
            style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }}
          />
        </TooltipTrigger>
        <TooltipContent side="top" className="bg-card border-border">
          <div className="text-sm">
            {position.playerName && (
              <p className="font-medium">{position.playerName}</p>
            )}
            <p className="text-muted-foreground">
              {Math.floor(position.time / 60)}:
              {String(position.time % 60).padStart(2, "0")}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

type ViewMode = "heatmap" | "wards" | "positions";

export function MinimapHeatmap({
  positions = [],
  wards = [],
  radiantPositions = [],
  direPositions = [],
  className,
}: MinimapHeatmapProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("heatmap");
  const [showRadiant, setShowRadiant] = useState(true);
  const [showDire, setShowDire] = useState(true);

  const allRadiantPositions = useMemo(() => {
    return [
      ...radiantPositions,
      ...positions.filter((p) => p.team === "radiant"),
    ];
  }, [positions, radiantPositions]);

  const allDirePositions = useMemo(() => {
    return [...direPositions, ...positions.filter((p) => p.team === "dire")];
  }, [positions, direPositions]);

  const radiantWards = useMemo(
    () => wards.filter((w) => w.team === "radiant"),
    [wards]
  );
  const direWards = useMemo(
    () => wards.filter((w) => w.team === "dire"),
    [wards]
  );

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Tabs
          value={viewMode}
          onValueChange={(v) => setViewMode(v as ViewMode)}
        >
          <TabsList className="bg-muted/50">
            <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
            <TabsTrigger value="wards">Wards</TabsTrigger>
            <TabsTrigger value="positions">Positions</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showRadiant}
              onChange={(e) => setShowRadiant(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-green-500"
            />
            <span className="text-sm text-green-500">Radiant</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={showDire}
              onChange={(e) => setShowDire(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-red-500"
            />
            <span className="text-sm text-red-500">Dire</span>
          </label>
        </div>
      </div>

      <div
        className="relative mx-auto overflow-hidden rounded-lg border border-border"
        style={{
          width: MINIMAP_SIZE,
          height: MINIMAP_SIZE,
          background: `
            linear-gradient(135deg, 
              rgba(34, 197, 94, 0.1) 0%, 
              rgba(15, 23, 42, 0.9) 50%, 
              rgba(239, 68, 68, 0.1) 100%
            ),
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 40px,
              rgba(255,255,255,0.03) 40px,
              rgba(255,255,255,0.03) 41px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 40px,
              rgba(255,255,255,0.03) 40px,
              rgba(255,255,255,0.03) 41px
            )
          `,
        }}
      >
        {/* River line */}
        <svg
          className="absolute inset-0 pointer-events-none"
          viewBox={`0 0 ${MINIMAP_SIZE} ${MINIMAP_SIZE}`}
        >
          <path
            d={`M 0 ${MINIMAP_SIZE} Q ${MINIMAP_SIZE / 2} ${MINIMAP_SIZE / 2} ${MINIMAP_SIZE} 0`}
            stroke="rgba(59, 130, 246, 0.3)"
            strokeWidth={8}
            fill="none"
          />
        </svg>

        {/* Base indicators */}
        <div className="absolute bottom-2 left-2 h-8 w-8 rounded-full bg-green-500/30 border-2 border-green-500/50" />
        <div className="absolute top-2 right-2 h-8 w-8 rounded-full bg-red-500/30 border-2 border-red-500/50" />

        {viewMode === "heatmap" && (
          <>
            {showRadiant && allRadiantPositions.length > 0 && (
              <HeatmapLayer
                positions={allRadiantPositions}
                color="#22c55e"
                opacity={0.6}
              />
            )}
            {showDire && allDirePositions.length > 0 && (
              <HeatmapLayer
                positions={allDirePositions}
                color="#ef4444"
                opacity={0.6}
              />
            )}
          </>
        )}

        {viewMode === "wards" && (
          <svg
            className="absolute inset-0"
            viewBox={`0 0 ${MINIMAP_SIZE} ${MINIMAP_SIZE}`}
          >
            {showRadiant &&
              radiantWards.map((ward, i) => (
                <WardMarker key={`radiant-${i}`} ward={ward} />
              ))}
            {showDire &&
              direWards.map((ward, i) => (
                <WardMarker key={`dire-${i}`} ward={ward} />
              ))}
          </svg>
        )}

        {viewMode === "positions" && (
          <svg
            className="absolute inset-0"
            viewBox={`0 0 ${MINIMAP_SIZE} ${MINIMAP_SIZE}`}
          >
            {showRadiant &&
              allRadiantPositions.slice(-100).map((pos, i) => (
                <PositionMarker key={`radiant-${i}`} position={pos} />
              ))}
            {showDire &&
              allDirePositions.slice(-100).map((pos, i) => (
                <PositionMarker key={`dire-${i}`} position={pos} />
              ))}
          </svg>
        )}

        {/* Legend */}
        <div className="absolute bottom-2 right-2 rounded bg-background/80 p-2 text-xs backdrop-blur-sm">
          {viewMode === "wards" && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span>Observer</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500" />
                <span>Sentry</span>
              </div>
            </div>
          )}
          {viewMode === "heatmap" && (
            <div className="flex items-center gap-2">
              <div className="h-2 w-16 rounded bg-gradient-to-r from-transparent via-white/50 to-white" />
              <span>Density</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
