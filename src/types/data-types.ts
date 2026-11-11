import { BiomeId, HeroId, WeaponId } from './game-types';
import { MetaUpgradeId } from './content-types';

export type AsyncStatus = 'loading' | 'error' | 'empty' | 'success';

export interface AsyncState<T> {
  status: AsyncStatus;
  data: T | null;
  errorMessage: string | null;
}

export interface WeaponDamageStat {
  weaponId: WeaponId;
  weaponName: string;
  damageDealt: number;
  level: number;
}

export interface RunHistoryRecord {
  id: string;
  timestamp: string;
  heroId: HeroId;
  heroName: string;
  biomeId: BiomeId;
  biomeName: string;
  outcome: 'victory' | 'defeat';
  waveReached: number;
  durationSeconds: number;
  kills: number;
  score: number;
  shardsEarned: number;
  levelReached: number;
  weaponStats: WeaponDamageStat[];
}

export type MetaUpgradeLevels = Record<MetaUpgradeId, number>;

export interface AudioSettings {
  masterVolume: number;
  musicEnabled: boolean;
  sfxEnabled: boolean;
}

export interface PlayerProfile {
  aetherShards: number;
  totalRuns: number;
  totalVictories: number;
  totalKills: number;
  highestScore: number;
  highestWave: number;
  selectedHeroId: HeroId;
  selectedBiomeId: BiomeId;
  metaLevels: MetaUpgradeLevels;
  audioSettings: AudioSettings;
}

export interface StoragePayload {
  profile: PlayerProfile;
  runHistory: RunHistoryRecord[];
}
