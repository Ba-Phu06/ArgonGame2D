import {
  MetaUpgradeLevels,
  PlayerProfile,
  RunHistoryRecord,
  StoragePayload,
} from '../types/data-types';
import { executeWithTimeoutAndRetry } from './http-client';

const STORAGE_KEY = 'aetherium_chrono_survivors_v1';

export function createDefaultMetaLevels(): MetaUpgradeLevels {
  return {
    'hull-plating': 0,
    'plasma-core': 0,
    'thruster-boost': 0,
    'quantum-optics': 0,
    'chrono-capacitor': 0,
    'aether-magnet': 0,
  };
}

export function createDefaultProfile(): PlayerProfile {
  return {
    aetherShards: 35,
    totalRuns: 0,
    totalVictories: 0,
    totalKills: 0,
    highestScore: 0,
    highestWave: 0,
    selectedHeroId: 'valkyrie',
    selectedBiomeId: 'neon-sanctum',
    metaLevels: createDefaultMetaLevels(),
    audioSettings: {
      masterVolume: 0.65,
      musicEnabled: true,
      sfxEnabled: true,
    },
  };
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseMetaLevels(rawMeta: Record<string, unknown>): MetaUpgradeLevels {
  return {
    'hull-plating': typeof rawMeta['hull-plating'] === 'number' ? rawMeta['hull-plating'] : 0,
    'plasma-core': typeof rawMeta['plasma-core'] === 'number' ? rawMeta['plasma-core'] : 0,
    'thruster-boost': typeof rawMeta['thruster-boost'] === 'number' ? rawMeta['thruster-boost'] : 0,
    'quantum-optics': typeof rawMeta['quantum-optics'] === 'number' ? rawMeta['quantum-optics'] : 0,
    'chrono-capacitor':
      typeof rawMeta['chrono-capacitor'] === 'number' ? rawMeta['chrono-capacitor'] : 0,
    'aether-magnet': typeof rawMeta['aether-magnet'] === 'number' ? rawMeta['aether-magnet'] : 0,
  };
}

function parseProfileRecord(rawProfile: Record<string, unknown>): PlayerProfile {
  const defaults = createDefaultProfile();
  const rawMeta = isObjectRecord(rawProfile.metaLevels) ? rawProfile.metaLevels : {};
  const rawAudio = isObjectRecord(rawProfile.audioSettings) ? rawProfile.audioSettings : {};

  return {
    aetherShards:
      typeof rawProfile.aetherShards === 'number'
        ? rawProfile.aetherShards
        : defaults.aetherShards,
    totalRuns: typeof rawProfile.totalRuns === 'number' ? rawProfile.totalRuns : 0,
    totalVictories: typeof rawProfile.totalVictories === 'number' ? rawProfile.totalVictories : 0,
    totalKills: typeof rawProfile.totalKills === 'number' ? rawProfile.totalKills : 0,
    highestScore: typeof rawProfile.highestScore === 'number' ? rawProfile.highestScore : 0,
    highestWave: typeof rawProfile.highestWave === 'number' ? rawProfile.highestWave : 0,
    selectedHeroId:
      rawProfile.selectedHeroId === 'valkyrie' ||
      rawProfile.selectedHeroId === 'technomancer' ||
      rawProfile.selectedHeroId === 'ranger'
        ? rawProfile.selectedHeroId
        : 'valkyrie',
    selectedBiomeId:
      rawProfile.selectedBiomeId === 'neon-sanctum' ||
      rawProfile.selectedBiomeId === 'crimson-forge' ||
      rawProfile.selectedBiomeId === 'void-singularity'
        ? rawProfile.selectedBiomeId
        : 'neon-sanctum',
    metaLevels: parseMetaLevels(rawMeta),
    audioSettings: {
      masterVolume:
        typeof rawAudio.masterVolume === 'number'
          ? rawAudio.masterVolume
          : defaults.audioSettings.masterVolume,
      musicEnabled: typeof rawAudio.musicEnabled === 'boolean' ? rawAudio.musicEnabled : true,
      sfxEnabled: typeof rawAudio.sfxEnabled === 'boolean' ? rawAudio.sfxEnabled : true,
    },
  };
}

function parseStoragePayload(rawJson: string | null): StoragePayload {
  if (!rawJson) {
    return { profile: createDefaultProfile(), runHistory: [] };
  }
  const parsed: unknown = JSON.parse(rawJson);
  if (!isObjectRecord(parsed)) {
    return { profile: createDefaultProfile(), runHistory: [] };
  }
  const rawProfile = isObjectRecord(parsed.profile) ? parsed.profile : {};
  const runHistory: RunHistoryRecord[] = Array.isArray(parsed.runHistory)
    ? (parsed.runHistory as RunHistoryRecord[])
    : [];

  return { profile: parseProfileRecord(rawProfile), runHistory };
}

export async function loadStorageData(): Promise<StoragePayload> {
  return executeWithTimeoutAndRetry(async () => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return parseStoragePayload(raw);
  });
}

export async function saveStorageData(payload: StoragePayload): Promise<StoragePayload> {
  return executeWithTimeoutAndRetry(async () => {
    const serialized = JSON.stringify(payload);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    return payload;
  });
}

export async function recordCompletedRun(
  currentPayload: StoragePayload,
  runRecord: RunHistoryRecord
): Promise<StoragePayload> {
  const updatedProfile: PlayerProfile = {
    ...currentPayload.profile,
    aetherShards: currentPayload.profile.aetherShards + runRecord.shardsEarned,
    totalRuns: currentPayload.profile.totalRuns + 1,
    totalVictories:
      currentPayload.profile.totalVictories + (runRecord.outcome === 'victory' ? 1 : 0),
    totalKills: currentPayload.profile.totalKills + runRecord.kills,
    highestScore: Math.max(currentPayload.profile.highestScore, runRecord.score),
    highestWave: Math.max(currentPayload.profile.highestWave, runRecord.waveReached),
  };

  const nextHistory = [runRecord, ...currentPayload.runHistory].slice(0, 30);
  return saveStorageData({ profile: updatedProfile, runHistory: nextHistory });
}
