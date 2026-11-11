import { useCallback, useEffect, useState } from 'react';
import { formatErrorMessage } from '../data/http-client';
import {
  createDefaultMetaLevels,
  createDefaultProfile,
  loadStorageData,
  recordCompletedRun,
  saveStorageData,
} from '../data/profile-repository';
import { getMetaUpgradeCost, META_UPGRADES_CATALOG } from '../data/upgrades-catalog';
import { audioSynth } from '../services/audio-synth';
import { MetaUpgradeId } from '../types/content-types';
import {
  AsyncState,
  AudioSettings,
  RunHistoryRecord,
  StoragePayload,
} from '../types/data-types';
import { BiomeId, HeroId } from '../types/game-types';

export interface UseAsyncProfileResult {
  storageState: AsyncState<StoragePayload>;
  reloadProfile: () => Promise<void>;
  selectHero: (heroId: HeroId) => void;
  selectBiome: (biomeId: BiomeId) => void;
  buyMetaUpgrade: (upgradeId: MetaUpgradeId) => void;
  resetMetaUpgrades: () => void;
  updateAudio: (nextAudio: AudioSettings) => void;
  saveRunResult: (record: RunHistoryRecord) => Promise<void>;
  clearRunHistory: () => void;
}

function getFallbackPayload(data: StoragePayload | null): StoragePayload {
  return data ?? { profile: createDefaultProfile(), runHistory: [] };
}

function computeNextMetaPurchase(
  payload: StoragePayload,
  upgradeId: MetaUpgradeId
): StoragePayload | null {
  const def = META_UPGRADES_CATALOG.find((item) => item.id === upgradeId);
  if (!def) return null;
  const currentLv = payload.profile.metaLevels[upgradeId] ?? 0;
  const cost = getMetaUpgradeCost(def, currentLv);
  if (currentLv >= def.maxLevel || payload.profile.aetherShards < cost) return null;
  return {
    ...payload,
    profile: {
      ...payload.profile,
      aetherShards: payload.profile.aetherShards - cost,
      metaLevels: { ...payload.profile.metaLevels, [upgradeId]: currentLv + 1 },
    },
  };
}

function computeMetaRefundPayload(payload: StoragePayload): StoragePayload {
  let refunded = 0;
  for (const def of META_UPGRADES_CATALOG) {
    const lv = payload.profile.metaLevels[def.id] ?? 0;
    for (let i = 0; i < lv; i += 1) {
      refunded += getMetaUpgradeCost(def, i);
    }
  }
  return {
    ...payload,
    profile: {
      ...payload.profile,
      aetherShards: payload.profile.aetherShards + refunded,
      metaLevels: createDefaultMetaLevels(),
    },
  };
}

function useStoragePersistence(
  setStorageState: React.Dispatch<React.SetStateAction<AsyncState<StoragePayload>>>
): {
  reloadProfile: () => Promise<void>;
  persistPayload: (nextPayload: StoragePayload) => Promise<void>;
} {
  const reloadProfile = useCallback(async (): Promise<void> => {
    setStorageState((prev) => ({ ...prev, status: 'loading', errorMessage: null }));
    try {
      const payload = await loadStorageData();
      audioSynth.updateSettings(payload.profile.audioSettings);
      const isEmpty = payload.runHistory.length === 0 && payload.profile.totalRuns === 0;
      setStorageState({ status: isEmpty ? 'empty' : 'success', data: payload, errorMessage: null });
    } catch (error: unknown) {
      setStorageState({
        status: 'error',
        data: null,
        errorMessage: formatErrorMessage(error, 'Không thể tải hồ sơ người chơi.'),
      });
    }
  }, [setStorageState]);

  const persistPayload = useCallback(
    async (nextPayload: StoragePayload): Promise<void> => {
      try {
        const saved = await saveStorageData(nextPayload);
        const isEmpty = saved.runHistory.length === 0 && saved.profile.totalRuns === 0;
        setStorageState({ status: isEmpty ? 'empty' : 'success', data: saved, errorMessage: null });
      } catch (error: unknown) {
        setStorageState((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: formatErrorMessage(error, 'Lỗi lưu dữ liệu hồ sơ người chơi.'),
        }));
      }
    },
    [setStorageState]
  );

  return { reloadProfile, persistPayload };
}

function useMetaAndAudioActions(
  data: StoragePayload | null,
  persistPayload: (nextPayload: StoragePayload) => Promise<void>
): {
  buyMetaUpgrade: (upgradeId: MetaUpgradeId) => void;
  resetMetaUpgrades: () => void;
  updateAudio: (nextAudio: AudioSettings) => void;
} {
  const buyMetaUpgrade = useCallback(
    (upgradeId: MetaUpgradeId): void => {
      if (!data) return;
      const next = computeNextMetaPurchase(data, upgradeId);
      if (next) {
        audioSynth.playSfx('level-up');
        void persistPayload(next);
      }
    },
    [data, persistPayload]
  );

  const resetMetaUpgrades = useCallback((): void => {
    if (data) void persistPayload(computeMetaRefundPayload(data));
  }, [data, persistPayload]);

  const updateAudio = useCallback(
    (nextAudio: AudioSettings): void => {
      audioSynth.updateSettings(nextAudio);
      if (data) {
        void persistPayload({ ...data, profile: { ...data.profile, audioSettings: nextAudio } });
      }
    },
    [data, persistPayload]
  );

  return { buyMetaUpgrade, resetMetaUpgrades, updateAudio };
}

export function useAsyncProfile(): UseAsyncProfileResult {
  const [storageState, setStorageState] = useState<AsyncState<StoragePayload>>({
    status: 'loading',
    data: null,
    errorMessage: null,
  });
  const { reloadProfile, persistPayload } = useStoragePersistence(setStorageState);
  const metaAudio = useMetaAndAudioActions(storageState.data, persistPayload);

  useEffect(() => {
    void reloadProfile();
  }, [reloadProfile]);

  const selectHero = useCallback(
    (heroId: HeroId): void => {
      const cur = getFallbackPayload(storageState.data);
      void persistPayload({ ...cur, profile: { ...cur.profile, selectedHeroId: heroId } });
    },
    [persistPayload, storageState.data]
  );

  const selectBiome = useCallback(
    (biomeId: BiomeId): void => {
      const cur = getFallbackPayload(storageState.data);
      void persistPayload({ ...cur, profile: { ...cur.profile, selectedBiomeId: biomeId } });
    },
    [persistPayload, storageState.data]
  );

  const saveRunResult = useCallback(
    async (record: RunHistoryRecord): Promise<void> => {
      try {
        const updated = await recordCompletedRun(getFallbackPayload(storageState.data), record);
        setStorageState({ status: 'success', data: updated, errorMessage: null });
      } catch (err: unknown) {
        const errorMessage = formatErrorMessage(err, 'Không thể lưu kết quả trận đấu.');
        setStorageState((prev) => ({ ...prev, status: 'error', errorMessage }));
      }
    },
    [storageState.data]
  );

  const clearRunHistory = useCallback((): void => {
    if (storageState.data) void persistPayload({ ...storageState.data, runHistory: [] });
  }, [persistPayload, storageState.data]);

  return { storageState, reloadProfile, selectHero, selectBiome, saveRunResult, clearRunHistory, ...metaAudio };
}
