import React, { useCallback, useState } from 'react';
import { createDefaultProfile } from './data/profile-repository';
import { useAsyncProfile, UseAsyncProfileResult } from './hooks/use-async-profile';
import { useGameLoop, UseGameLoopResult } from './hooks/use-game-loop';
import { CodexModal } from './ui/codex-modal';
import { HistoryModal } from './ui/history-modal';
import { HudOverlay } from './ui/hud-overlay';
import { LevelUpModal } from './ui/level-up-modal';
import { MainMenu } from './ui/main-menu';
import { PauseEndModal } from './ui/pause-end-modal';
import { WorkshopModal } from './ui/workshop-modal';

type ActiveMenuModal = 'none' | 'workshop' | 'codex' | 'history';

function renderGameOverlays(
  gameLoop: UseGameLoopResult,
  soundEnabled: boolean,
  onToggleSound: () => void,
  onLaunchGame: () => void
): React.ReactElement | null {
  const { hudSnapshot, lastCompletedRun } = gameLoop;
  if (!hudSnapshot) {
    return null;
  }
  const showPauseOrEnd =
    hudSnapshot.status === 'paused' ||
    hudSnapshot.status === 'victory' ||
    hudSnapshot.status === 'defeat';

  return (
    <>
      <HudOverlay
        hud={hudSnapshot}
        soundEnabled={soundEnabled}
        onTogglePause={gameLoop.togglePause}
        onToggleAutoAim={gameLoop.toggleAutoAim}
        onToggleSound={onToggleSound}
        onTriggerDash={gameLoop.triggerDashAction}
        onTriggerUltimate={gameLoop.triggerUltimateAction}
      />
      {hudSnapshot.status === 'level-up' && (
        <LevelUpModal
          level={hudSnapshot.player.level}
          choices={hudSnapshot.upgradeChoices}
          onSelect={gameLoop.chooseUpgradeCard}
        />
      )}
      {showPauseOrEnd && (
        <PauseEndModal
          hud={hudSnapshot}
          completedRun={lastCompletedRun}
          onResume={gameLoop.togglePause}
          onRestart={onLaunchGame}
          onEnterEndless={gameLoop.enterEndlessMode}
          onReturnMenu={gameLoop.returnToMenu}
        />
      )}
    </>
  );
}

function renderLobbyModals(
  activeModal: ActiveMenuModal,
  profileHook: UseAsyncProfileResult,
  onClose: () => void
): React.ReactElement | null {
  if (activeModal === 'workshop') {
    return (
      <WorkshopModal
        storageState={profileHook.storageState}
        onBuyUpgrade={(id) => void profileHook.buyMetaUpgrade(id)}
        onResetUpgrades={() => void profileHook.resetMetaUpgrades()}
        onRetryLoad={() => void profileHook.reloadProfile()}
        onClose={onClose}
      />
    );
  }
  if (activeModal === 'codex') {
    return <CodexModal onClose={onClose} />;
  }
  if (activeModal === 'history') {
    return (
      <HistoryModal
        storageState={profileHook.storageState}
        onRetry={() => void profileHook.reloadProfile()}
        onClearHistory={() => void profileHook.clearRunHistory()}
        onClose={onClose}
      />
    );
  }
  return null;
}

export function App(): React.ReactElement {
  const profileHook = useAsyncProfile();
  const gameLoop = useGameLoop(profileHook.saveRunResult);
  const [activeModal, setActiveModal] = useState<ActiveMenuModal>('none');
  const profile = profileHook.storageState.data?.profile ?? createDefaultProfile();

  const handleLaunchGame = useCallback((): void => {
    setActiveModal('none');
    gameLoop.startNewGame(profile.selectedHeroId, profile.selectedBiomeId, profile.metaLevels);
  }, [gameLoop, profile.metaLevels, profile.selectedBiomeId, profile.selectedHeroId]);

  const handleToggleSound = useCallback((): void => {
    const cur = profile.audioSettings;
    const nextEnabled = !(cur.musicEnabled || cur.sfxEnabled);
    void profileHook.updateAudio({ ...cur, musicEnabled: nextEnabled, sfxEnabled: nextEnabled });
  }, [profile.audioSettings, profileHook]);

  const soundEnabled = profile.audioSettings.sfxEnabled || profile.audioSettings.musicEnabled;

  return (
    <div className="app-root" onContextMenu={(event) => event.preventDefault()}>
      <canvas
        ref={gameLoop.canvasRef}
        className={`game-canvas ${gameLoop.hudSnapshot ? 'canvas-active' : 'canvas-hidden'}`}
        onMouseMove={gameLoop.mouseHandlers.onMouseMove}
        onMouseDown={gameLoop.mouseHandlers.onMouseDown}
      />
      {!gameLoop.hudSnapshot && (
        <MainMenu
          storageState={profileHook.storageState}
          onSelectHero={(heroId) => void profileHook.selectHero(heroId)}
          onSelectBiome={(biomeId) => void profileHook.selectBiome(biomeId)}
          onLaunchGame={handleLaunchGame}
          onOpenWorkshop={() => setActiveModal('workshop')}
          onOpenCodex={() => setActiveModal('codex')}
          onOpenHistory={() => setActiveModal('history')}
          onRetryLoad={() => void profileHook.reloadProfile()}
        />
      )}
      {renderGameOverlays(gameLoop, soundEnabled, handleToggleSound, handleLaunchGame)}
      {renderLobbyModals(activeModal, profileHook, () => setActiveModal('none'))}
    </div>
  );
}
