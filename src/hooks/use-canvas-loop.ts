import { useEffect } from 'react';
import { buildRunHistoryRecord, updateGameWorld } from '../services/game-engine';
import { PlayerInputSnapshot } from '../services/player-service';
import { renderGameWorld } from '../services/renderer-fx';
import { GameWorldState, UpgradeCardOption } from '../types/content-types';
import { RunHistoryRecord } from '../types/data-types';
import { BiomeId, EnemyEntity, PlayerEntity } from '../types/game-types';

export interface HudSnapshot {
  status: GameWorldState['status'];
  biomeId: BiomeId;
  wave: number;
  maxWaves: number;
  endlessMode: boolean;
  elapsedTime: number;
  kills: number;
  score: number;
  shardsEarned: number;
  comboCount: number;
  player: PlayerEntity;
  activeBoss: EnemyEntity | null;
  upgradeChoices: UpgradeCardOption[];
}

export function extractHudSnapshot(world: GameWorldState): HudSnapshot {
  const activeBoss = world.enemies.find((enemy) => enemy.isBoss && enemy.hp > 0) ?? null;
  return {
    status: world.status,
    biomeId: world.biomeId,
    wave: world.wave,
    maxWaves: world.maxWaves,
    endlessMode: world.endlessMode,
    elapsedTime: world.elapsedTime,
    kills: world.kills,
    score: world.score,
    shardsEarned: world.shardsEarned,
    comboCount: world.comboCount,
    player: { ...world.player, weapons: [...world.player.weapons] },
    activeBoss: activeBoss ? { ...activeBoss } : null,
    upgradeChoices: [...world.upgradeChoices],
  };
}

function stepCanvasWorldFrame(
  canvas: HTMLCanvasElement,
  world: GameWorldState,
  dt: number,
  consumeSnapshot: (
    camX: number,
    camY: number,
    viewW: number,
    viewH: number
  ) => PlayerInputSnapshot
): boolean {
  if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) return false;
  const input = consumeSnapshot(world.cameraX, world.cameraY, canvas.width, canvas.height);
  const prevStatus = world.status;
  updateGameWorld(world, input, dt, canvas.width, canvas.height);
  renderGameWorld(ctx, world, canvas.width, canvas.height);
  return world.status !== prevStatus;
}

export interface CanvasLoopParams {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  worldRef: React.RefObject<GameWorldState | null>;
  runSavedRef: React.RefObject<boolean>;
  consumeSnapshot: (
    camX: number,
    camY: number,
    viewW: number,
    viewH: number
  ) => PlayerInputSnapshot;
  setHudSnapshot: React.Dispatch<React.SetStateAction<HudSnapshot | null>>;
  setLastCompletedRun: React.Dispatch<React.SetStateAction<RunHistoryRecord | null>>;
  onRunFinished: (record: RunHistoryRecord) => Promise<void>;
}

export function useCanvasAnimationEffect(params: CanvasLoopParams): void {
  const {
    canvasRef,
    worldRef,
    runSavedRef,
    consumeSnapshot,
    setHudSnapshot,
    setLastCompletedRun,
    onRunFinished,
  } = params;

  useEffect(() => {
    let frameId = 0;
    let lastTime = performance.now();
    let syncTimer = 0;

    const tick = (now: number): void => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      const canvas = canvasRef.current;
      const world = worldRef.current;
      if (canvas && world) {
        const changed = stepCanvasWorldFrame(canvas, world, dt, consumeSnapshot);
        syncTimer += dt;
        if (syncTimer >= 0.08 || changed) {
          syncTimer = 0;
          setHudSnapshot(extractHudSnapshot(world));
        }
        if ((world.status === 'victory' || world.status === 'defeat') && !runSavedRef.current) {
          runSavedRef.current = true;
          const record = buildRunHistoryRecord(world);
          setLastCompletedRun(record);
          void onRunFinished(record);
        }
      }
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frameId);
  }, [
    canvasRef,
    consumeSnapshot,
    onRunFinished,
    runSavedRef,
    setHudSnapshot,
    setLastCompletedRun,
    worldRef,
  ]);
}
