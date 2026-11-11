import {
  BiomeId,
  ElementType,
  EnemyArchetypeId,
  HeroId,
  ParticleEntity,
  PickupEntity,
  PlayerEntity,
  ProjectileEntity,
  SlashArcEffect,
  TelegraphZone,
  WeaponId,
  EnemyEntity,
  FloatingTextEntity,
  LightningBoltEffect,
} from './game-types';

export interface HeroDefinition {
  id: HeroId;
  name: string;
  title: string;
  tagline: string;
  description: string;
  ultimateName: string;
  ultimateDescription: string;
  startingWeapon: WeaponId;
  accentColor: string;
  secondaryColor: string;
  baseHp: number;
  baseShield: number;
  baseSpeed: number;
  baseCritChance: number;
  baseDamageMult: number;
}

export interface WeaponDefinition {
  id: WeaponId;
  name: string;
  element: ElementType;
  description: string;
  color: string;
  baseDamage: number;
  baseCooldown: number;
  baseRange: number;
  basePierce: number;
  projectileSpeed: number;
}

export interface EnemyDefinition {
  id: EnemyArchetypeId;
  name: string;
  role: string;
  description: string;
  color: string;
  radius: number;
  baseHp: number;
  baseSpeed: number;
  contactDamage: number;
  xpValue: number;
  shardValue: number;
  shieldFront: boolean;
  isBoss: boolean;
}

export type UpgradeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type StatBoostKey =
  | 'maxHp'
  | 'maxShield'
  | 'speed'
  | 'damageMultiplier'
  | 'critChance'
  | 'cooldownHaste'
  | 'pickupRadius'
  | 'armor';

export interface UpgradeCardOption {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  rarity: UpgradeRarity;
  accentColor: string;
  kind: 'weapon-unlock' | 'weapon-upgrade' | 'stat-boost' | 'synergy';
  weaponId?: WeaponId;
  statKey?: StatBoostKey;
  statAmount?: number;
  healRatio?: number;
}

export interface BiomeDefinition {
  id: BiomeId;
  name: string;
  subtitle: string;
  description: string;
  difficultyMultiplier: number;
  bgPrimary: string;
  bgSecondary: string;
  gridColor: string;
  accentColor: string;
  hazardDescription: string;
}

export type MetaUpgradeId =
  | 'hull-plating'
  | 'plasma-core'
  | 'thruster-boost'
  | 'quantum-optics'
  | 'chrono-capacitor'
  | 'aether-magnet';

export interface MetaUpgradeDefinition {
  id: MetaUpgradeId;
  name: string;
  description: string;
  maxLevel: number;
  baseCost: number;
  costScale: number;
  bonusPerLevelLabel: string;
  statKey: StatBoostKey;
  bonusPerLevel: number;
}

export interface StarPoint {
  x: number;
  y: number;
  size: number;
  alpha: number;
  parallax: number;
  color: string;
}

export interface GridPulse {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

export interface GameWorldState {
  status: 'menu' | 'playing' | 'level-up' | 'paused' | 'victory' | 'defeat';
  biomeId: BiomeId;
  worldWidth: number;
  worldHeight: number;
  cameraX: number;
  cameraY: number;
  elapsedTime: number;
  wave: number;
  maxWaves: number;
  endlessMode: boolean;
  spawnTimer: number;
  eliteTimer: number;
  bossSpawnedForWave: number;
  kills: number;
  score: number;
  shardsEarned: number;
  comboCount: number;
  comboTimer: number;
  screenShake: number;
  hitStopTimer: number;
  damageFlashAlpha: number;
  timeScaleEnemy: number;
  nextEntityId: number;
  player: PlayerEntity;
  enemies: EnemyEntity[];
  projectiles: ProjectileEntity[];
  slashArcs: SlashArcEffect[];
  lightningBolts: LightningBoltEffect[];
  telegraphs: TelegraphZone[];
  particles: ParticleEntity[];
  floatingTexts: FloatingTextEntity[];
  pickups: PickupEntity[];
  upgradeChoices: UpgradeCardOption[];
  stars: StarPoint[];
  gridPulses: GridPulse[];
}
