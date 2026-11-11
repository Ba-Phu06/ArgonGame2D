import { getHeroById } from '../data/heroes-catalog';
import { META_UPGRADES_CATALOG } from '../data/upgrades-catalog';
import { GameWorldState } from '../types/content-types';
import { MetaUpgradeLevels } from '../types/data-types';
import { HeroId, PlayerEntity } from '../types/game-types';
import { audioSynth } from './audio-synth';
import { clampNumber, findNearestEnemy, normalizeVector } from './math-utils';
import { spawnFloatingText } from './particle-system';
import {
  applyUpgradeChoice,
  triggerPlayerDash,
  triggerPlayerUltimate,
} from './player-skills-service';

export { applyUpgradeChoice, triggerPlayerDash, triggerPlayerUltimate };

export interface PlayerInputSnapshot {
  moveX: number;
  moveY: number;
  mouseWorldX: number;
  mouseWorldY: number;
  dashPressed: boolean;
  ultimatePressed: boolean;
}

function getBonus(meta: MetaUpgradeLevels, idx: number): number {
  const def = META_UPGRADES_CATALOG[idx];
  return (meta[def.id] ?? 0) * def.bonusPerLevel;
}

export function createInitialPlayer(
  heroId: HeroId,
  metaLevels: MetaUpgradeLevels,
  startX: number,
  startY: number
): PlayerEntity {
  const hero = getHeroById(heroId);
  const maxHp = hero.baseHp + getBonus(metaLevels, 0);
  const starterSlot = {
    weaponId: hero.startingWeapon,
    level: 1,
    cooldownTimer: 0.1,
    orbitAngle: 0,
    totalDamageDealt: 0,
  };
  return {
    heroId,
    x: startX,
    y: startY,
    vx: 0,
    vy: 0,
    radius: 18,
    aimAngle: 0,
    hp: maxHp,
    maxHp,
    shield: hero.baseShield,
    maxShield: hero.baseShield,
    shieldRegenDelay: 0,
    xp: 0,
    xpToNext: 65,
    level: 1,
    speed: hero.baseSpeed + getBonus(metaLevels, 2),
    damageMultiplier: hero.baseDamageMult + getBonus(metaLevels, 1),
    critChance: hero.baseCritChance + getBonus(metaLevels, 3),
    critMultiplier: 1.85,
    cooldownHaste: 1 + getBonus(metaLevels, 4),
    pickupRadius: 110 + getBonus(metaLevels, 5),
    armor: 0,
    dashCooldown: 0,
    dashMaxCooldown: 2.2,
    dashTimer: 0,
    invulnerableTimer: 0,
    ultimateEnergy: 100,
    ultimateMaxEnergy: 100,
    ultimateActiveTimer: 0,
    autoAim: true,
    weapons: [starterSlot],
    afterimages: [],
  };
}

export function updatePlayerState(
  world: GameWorldState,
  input: PlayerInputSnapshot,
  dt: number
): void {
  const { player } = world;
  if (input.dashPressed) triggerPlayerDash(world, input.moveX, input.moveY);
  if (input.ultimatePressed) triggerPlayerUltimate(world);

  player.dashCooldown = Math.max(0, player.dashCooldown - dt);
  player.invulnerableTimer = Math.max(0, player.invulnerableTimer - dt);
  player.shieldRegenDelay = Math.max(0, player.shieldRegenDelay - dt);

  if (player.ultimateActiveTimer > 0) {
    player.ultimateActiveTimer = Math.max(0, player.ultimateActiveTimer - dt);
    if (player.ultimateActiveTimer <= 0 && player.heroId === 'ranger') {
      world.timeScaleEnemy = 1.0;
    }
  } else {
    player.ultimateEnergy = Math.min(player.ultimateMaxEnergy, player.ultimateEnergy + dt * 4.5);
  }
  if (player.shieldRegenDelay <= 0 && player.shield < player.maxShield) {
    player.shield = Math.min(player.maxShield, player.shield + dt * 9.5);
  }
  updatePlayerMovementAndAim(world, input, dt);
}

function updatePlayerMovementAndAim(
  world: GameWorldState,
  input: PlayerInputSnapshot,
  dt: number
): void {
  const { player } = world;
  if (player.dashTimer > 0) {
    player.dashTimer -= dt;
    player.afterimages.push({
      x: player.x,
      y: player.y,
      angle: player.aimAngle,
      alpha: 0.65,
      color: getHeroById(player.heroId).accentColor,
    });
  } else {
    const dir = normalizeVector(input.moveX, input.moveY);
    player.vx = dir.x * player.speed;
    player.vy = dir.y * player.speed;
  }
  player.x = clampNumber(player.x + player.vx * dt, 40, world.worldWidth - 40);
  player.y = clampNumber(player.y + player.vy * dt, 40, world.worldHeight - 40);

  for (let i = player.afterimages.length - 1; i >= 0; i -= 1) {
    player.afterimages[i].alpha -= dt * 3.2;
    if (player.afterimages[i].alpha <= 0) player.afterimages.splice(i, 1);
  }
  if (player.autoAim) {
    const target = findNearestEnemy(player.x, player.y, world.enemies, 680);
    if (target) {
      player.aimAngle = Math.atan2(target.y - player.y, target.x - player.x);
      return;
    }
  }
  player.aimAngle = Math.atan2(input.mouseWorldY - player.y, input.mouseWorldX - player.x);
}

export function applyDamageToPlayer(world: GameWorldState, rawDamage: number): void {
  const { player } = world;
  if (player.invulnerableTimer > 0 || world.status !== 'playing') return;
  const mitigated = Math.max(2, rawDamage * (1 - clampNumber(player.armor, 0, 0.65)));
  player.invulnerableTimer = 0.45;
  player.shieldRegenDelay = 3.6;
  world.screenShake = Math.max(world.screenShake, 8);
  world.damageFlashAlpha = 0.42;
  audioSynth.playSfx('hit-player');

  const absorbed = Math.min(player.shield, mitigated);
  player.shield -= absorbed;
  player.hp = Math.max(0, player.hp - (mitigated - absorbed));
  spawnFloatingText(world, player.x, player.y - 16, `-${Math.round(mitigated)}`, '#ff4d6d', true);
}
