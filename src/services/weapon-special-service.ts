import { getWeaponById } from '../data/weapons-catalog';
import { GameWorldState } from '../types/content-types';
import { ActiveWeaponSlot, EnemyEntity } from '../types/game-types';
import { audioSynth } from './audio-synth';
import { distanceBetween, distanceToSegment } from './math-utils';
import { spawnFloatingText, spawnParticleBurst } from './particle-system';

export function computeSlotDamage(
  world: GameWorldState,
  slot: ActiveWeaponSlot
): {
  damage: number;
  isCrit: boolean;
} {
  const { player } = world;
  const def = getWeaponById(slot.weaponId);
  const levelScale = 1 + (slot.level - 1) * 0.28;
  const raw = def.baseDamage * levelScale * player.damageMultiplier;
  const bonusCrit = player.heroId === 'ranger' && player.ultimateActiveTimer > 0 ? 0.25 : 0;
  const isCrit = Math.random() < player.critChance + bonusCrit;
  const damage = isCrit ? raw * player.critMultiplier : raw;
  return { damage, isCrit };
}

export function inflictDirectWeaponHit(
  world: GameWorldState,
  slot: ActiveWeaponSlot,
  enemy: EnemyEntity,
  damage: number,
  isCrit: boolean,
  color: string
): void {
  enemy.hp -= damage;
  enemy.hitFlashTimer = 0.1;
  slot.totalDamageDealt += damage;
  spawnParticleBurst(world, enemy.x, enemy.y, color, 5, 140, 3);
  spawnFloatingText(
    world,
    enemy.x,
    enemy.y,
    `${Math.round(damage)}${isCrit ? '!' : ''}`,
    isCrit ? '#ffbe0b' : color,
    isCrit
  );
}

export function fireFrostNova(world: GameWorldState, slot: ActiveWeaponSlot): void {
  const { player } = world;
  const { damage } = computeSlotDamage(world, slot);
  world.projectiles.push({
    id: world.nextEntityId++,
    x: player.x,
    y: player.y,
    vx: Math.cos(player.aimAngle) * 460,
    vy: Math.sin(player.aimAngle) * 460,
    radius: 9,
    damage,
    element: 'cryo',
    color: '#90e0ef',
    fromPlayer: true,
    pierceRemaining: 1,
    hitEnemyIds: [],
    lifetime: 1.3,
    maxLifetime: 1.3,
    homingStrength: 0,
    explosiveRadius: 85 + slot.level * 14,
    isBeam: false,
    beamEndX: 0,
    beamEndY: 0,
    weaponId: slot.weaponId,
  });
}

export function fireSolarLance(world: GameWorldState, slot: ActiveWeaponSlot): void {
  const { player } = world;
  const range = 620;
  const endX = player.x + Math.cos(player.aimAngle) * range;
  const endY = player.y + Math.sin(player.aimAngle) * range;
  const { damage, isCrit } = computeSlotDamage(world, slot);

  world.projectiles.push({
    id: world.nextEntityId++,
    x: player.x,
    y: player.y,
    vx: 0,
    vy: 0,
    radius: 14 + slot.level * 2,
    damage: 0,
    element: 'solar',
    color: '#ff5400',
    fromPlayer: true,
    pierceRemaining: 99,
    hitEnemyIds: [],
    lifetime: 0.18,
    maxLifetime: 0.18,
    homingStrength: 0,
    explosiveRadius: 0,
    isBeam: true,
    beamEndX: endX,
    beamEndY: endY,
    weaponId: slot.weaponId,
  });

  for (const enemy of world.enemies) {
    const dist = distanceToSegment(enemy.x, enemy.y, player.x, player.y, endX, endY);
    if (dist <= enemy.radius + 16) {
      enemy.burnTimer = 3.0;
      enemy.burnDps = 16 * slot.level * player.damageMultiplier;
      inflictDirectWeaponHit(world, slot, enemy, damage, isCrit, '#ff5400');
    }
  }
  audioSynth.playSfx('laser');
}

export function fireSeekerMissiles(world: GameWorldState, slot: ActiveWeaponSlot): void {
  const { player } = world;
  const count = 2 + Math.floor(slot.level / 2);
  for (let i = 0; i < count; i += 1) {
    const angle = player.aimAngle + (i - (count - 1) / 2) * 0.45;
    const { damage } = computeSlotDamage(world, slot);
    world.projectiles.push({
      id: world.nextEntityId++,
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * 420,
      vy: Math.sin(angle) * 420,
      radius: 7,
      damage,
      element: 'plasma',
      color: '#ff4d6d',
      fromPlayer: true,
      pierceRemaining: 1,
      hitEnemyIds: [],
      lifetime: 1.8,
      maxLifetime: 1.8,
      homingStrength: 6.2,
      explosiveRadius: 65 + slot.level * 10,
      isBeam: false,
      beamEndX: 0,
      beamEndY: 0,
      weaponId: slot.weaponId,
    });
  }
}

export function tickOrbitalBlades(world: GameWorldState, slot: ActiveWeaponSlot): void {
  if (slot.cooldownTimer > 0) {
    return;
  }
  slot.cooldownTimer = 0.24;
  const { player } = world;
  const bladeCount = 2 + Math.floor(slot.level / 2);
  const orbitDist = 92 + slot.level * 6;

  for (let i = 0; i < bladeCount; i += 1) {
    const angle = slot.orbitAngle + (Math.PI * 2 * i) / bladeCount;
    const bx = player.x + Math.cos(angle) * orbitDist;
    const by = player.y + Math.sin(angle) * orbitDist;

    for (const enemy of world.enemies) {
      if (distanceBetween(bx, by, enemy.x, enemy.y) <= enemy.radius + 16) {
        const { damage, isCrit } = computeSlotDamage(world, slot);
        inflictDirectWeaponHit(world, slot, enemy, damage, isCrit, '#72efdd');
      }
    }
  }
}
