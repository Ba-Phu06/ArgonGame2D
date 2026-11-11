export interface Vector2D {
  x: number;
  y: number;
}

export type HeroId = 'valkyrie' | 'technomancer' | 'ranger';

export type WeaponId =
  | 'plasma-katana'
  | 'aether-prism'
  | 'railgun-pistols'
  | 'tesla-coil'
  | 'aether-orbitals'
  | 'frost-nova'
  | 'solar-lance'
  | 'seeker-missiles';

export type ElementType = 'physical' | 'plasma' | 'arcane' | 'lightning' | 'cryo' | 'solar';

export type EnemyArchetypeId =
  | 'swarm-drone'
  | 'shield-juggernaut'
  | 'sniper-mech'
  | 'volatile-crawler'
  | 'necro-weaver'
  | 'phase-assassin'
  | 'chronos-titan';

export type BiomeId = 'neon-sanctum' | 'crimson-forge' | 'void-singularity';

export interface ActiveWeaponSlot {
  weaponId: WeaponId;
  level: number;
  cooldownTimer: number;
  orbitAngle: number;
  totalDamageDealt: number;
}

export interface AfterimageGhost {
  x: number;
  y: number;
  angle: number;
  alpha: number;
  color: string;
}

export interface PlayerEntity {
  heroId: HeroId;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  aimAngle: number;
  hp: number;
  maxHp: number;
  shield: number;
  maxShield: number;
  shieldRegenDelay: number;
  xp: number;
  xpToNext: number;
  level: number;
  speed: number;
  damageMultiplier: number;
  critChance: number;
  critMultiplier: number;
  cooldownHaste: number;
  pickupRadius: number;
  armor: number;
  dashCooldown: number;
  dashMaxCooldown: number;
  dashTimer: number;
  invulnerableTimer: number;
  ultimateEnergy: number;
  ultimateMaxEnergy: number;
  ultimateActiveTimer: number;
  autoAim: boolean;
  weapons: ActiveWeaponSlot[];
  afterimages: AfterimageGhost[];
}

export interface EnemyEntity {
  id: number;
  archetypeId: EnemyArchetypeId;
  name: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hp: number;
  maxHp: number;
  speed: number;
  contactDamage: number;
  xpValue: number;
  shardValue: number;
  color: string;
  isBoss: boolean;
  isElite: boolean;
  facingAngle: number;
  shieldFront: boolean;
  actionTimer: number;
  actionState: 'chase' | 'aiming' | 'charging' | 'summoning';
  targetX: number;
  targetY: number;
  chillTimer: number;
  burnTimer: number;
  burnDps: number;
  shockTimer: number;
  hitFlashTimer: number;
  bossPhase: number;
}

export interface ProjectileEntity {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  damage: number;
  element: ElementType;
  color: string;
  fromPlayer: boolean;
  pierceRemaining: number;
  hitEnemyIds: number[];
  lifetime: number;
  maxLifetime: number;
  homingStrength: number;
  explosiveRadius: number;
  isBeam: boolean;
  beamEndX: number;
  beamEndY: number;
  weaponId?: WeaponId;
}

export interface SlashArcEffect {
  x: number;
  y: number;
  angle: number;
  radius: number;
  arcSpread: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface LightningBoltEffect {
  points: Vector2D[];
  color: string;
  life: number;
  maxLife: number;
}

export interface TelegraphZone {
  id: number;
  kind: 'circle' | 'line';
  x: number;
  y: number;
  endX: number;
  endY: number;
  radius: number;
  timer: number;
  maxTimer: number;
  damage: number;
  color: string;
}

export interface ParticleEntity {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  glow: boolean;
}

export interface FloatingTextEntity {
  x: number;
  y: number;
  vy: number;
  text: string;
  color: string;
  scale: number;
  life: number;
  maxLife: number;
  isCrit: boolean;
}

export interface PickupEntity {
  id: number;
  kind: 'xp' | 'shard' | 'heal' | 'magnet';
  x: number;
  y: number;
  vx: number;
  vy: number;
  value: number;
  radius: number;
  magnetized: boolean;
}
