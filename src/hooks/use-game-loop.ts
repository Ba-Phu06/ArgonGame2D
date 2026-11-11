import { useCallback, useRef, useState } from 'react';
import { createGameWorldState } from '../services/game-engine';
import {
  applyUpgradeChoice,
  triggerPlayerDash,
  triggerPlayerUltimate,
} from '../services/player-service';
import { GameWorldState, UpgradeCardOption } from '../types/content-types';
import { MetaUpgradeLevels, RunHistoryRecord } from '../types/data-types';
import { BiomeId, HeroId } from '../types/game-types';
import {
  extractHudSnapshot,
  HudSnapshot,
  useCanvasAnimationEffect,
} from './use-canvas-loop';
import { useGameInput } from './use-game-input';

export type { HudSnapshot };

export interface UseGameLoopResult {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  hudSnapshot: HudSnapshot | null;
  lastCompletedRun: RunHistoryRecord | null;
  startNewGame: (heroId: HeroId, biomeId: BiomeId, metaLevels: MetaUpgradeLevels) => void;
  chooseUpgradeCard: (option: UpgradeCardOption) => void;
  togglePause: () => void;
  toggleAutoAim: () => void;
  triggerDashAction: () => void;
  triggerUltimateAction: () => void;
  enterEndlessMode: () => void;
  returnToMenu: () => void;
  mouseHandlers: {
    onMouseMove: (event: React.MouseEvent<HTMLCanvasElement>) => void;
    onMouseDown: (event: React.MouseEvent<HTMLCanvasElement>) => void;
  };
}

function useWorldActionCallbacks(
  worldRef: React.RefObject<GameWorldState | null>,
  setHudSnapshot: React.Dispatch<React.SetStateAction<HudSnapshot | null>>
): {
  chooseUpgradeCard: (option: UpgradeCardOption) => void;
  triggerDashAction: () => void;
  triggerUltimateAction: () => void;
  enterEndlessMode: () => void;
  returnToMenu: () => void;
} {
  const chooseUpgradeCard = useCallback(
    (option: UpgradeCardOption): void => {
      if (worldRef.current && worldRef.current.status === 'level-up') {
        applyUpgradeChoice(worldRef.current, option);
        worldRef.current.upgradeChoices = [];
        worldRef.current.status = 'playing';
        setHudSnapshot(extractHudSnapshot(worldRef.current));
      }
    },
    [setHudSnapshot, worldRef]
  );
  const triggerDashAction = useCallback((): void => {
    if (worldRef.current?.status === 'playing') triggerPlayerDash(worldRef.current, 0, 0);
  }, [worldRef]);
  const triggerUltimateAction = useCallback((): void => {
    if (worldRef.current?.status === 'playing') triggerPlayerUltimate(worldRef.current);
  }, [worldRef]);
  const enterEndlessMode = useCallback((): void => {
    if (worldRef.current) {
      worldRef.current.endlessMode = true;
      worldRef.current.status = 'playing';
      setHudSnapshot(extractHudSnapshot(worldRef.current));
    }
  }, [setHudSnapshot, worldRef]);
  const returnToMenu = useCallback((): void => {
    worldRef.current = null;
    setHudSnapshot(null);
  }, [setHudSnapshot, worldRef]);

  return {
    chooseUpgradeCard,
    triggerDashAction,
    triggerUltimateAction,
    enterEndlessMode,
    returnToMenu,
  };
}

export function useGameLoop(
  onRunFinished: (record: RunHistoryRecord) => Promise<void>
): UseGameLoopResult {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const worldRef = useRef<GameWorldState | null>(null);
  const runSavedRef = useRef<boolean>(false);
  const [hudSnapshot, setHudSnapshot] = useState<HudSnapshot | null>(null);
  const [lastCompletedRun, setLastCompletedRun] = useState<RunHistoryRecord | null>(null);

  const togglePause = useCallback((): void => {
    const w = worldRef.current;
    if (w && (w.status === 'playing' || w.status === 'paused')) {
      w.status = w.status === 'playing' ? 'paused' : 'playing';
      setHudSnapshot(extractHudSnapshot(w));
    }
  }, []);

  const toggleAutoAim = useCallback((): void => {
    if (worldRef.current) {
      worldRef.current.player.autoAim = !worldRef.current.player.autoAim;
      setHudSnapshot(extractHudSnapshot(worldRef.current));
    }
  }, []);

  const { consumeSnapshot, bindMouseHandlers } = useGameInput(togglePause, toggleAutoAim);
  const actions = useWorldActionCallbacks(worldRef, setHudSnapshot);

  const startNewGame = useCallback(
    (heroId: HeroId, biomeId: BiomeId, metaLevels: MetaUpgradeLevels): void => {
      const nextWorld = createGameWorldState(heroId, biomeId, metaLevels);
      worldRef.current = nextWorld;
      runSavedRef.current = false;
      setLastCompletedRun(null);
      setHudSnapshot(extractHudSnapshot(nextWorld));
    },
    []
  );

  useCanvasAnimationEffect({
    canvasRef,
    worldRef,
    runSavedRef,
    consumeSnapshot,
    setHudSnapshot,
    setLastCompletedRun,
    onRunFinished,
  });

  return { canvasRef, hudSnapshot, lastCompletedRun, startNewGame, togglePause, toggleAutoAim, mouseHandlers: bindMouseHandlers, ...actions };
}
