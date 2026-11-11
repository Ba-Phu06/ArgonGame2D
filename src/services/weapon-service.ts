import { getWeaponById } from '../data/weapons-catalog';
import { GameWorldState } from '../types/content-types';
import { ActiveWeaponSlot, Vector2D } from '../types/game-types';
import { audioSynth } from './audio-synth';
import { angleDifference, distanceBetween, findNearestEnemy } from './math-utils';
import { spawnLightningChain, spawnSlashArc } from './particle-system';
import {
  computeSlotDamage,
  fireFrostNova,
  fireSeekerMissiles,
  fireSolarLance,
  inflictDirectWeaponHit,
  tickOrbitalBlades,
} from './weapon-special-service';

export function updatePlayerWeapons(world: GameWorldState, dt: number): void {
  const { player } = world;
  const rangerOverclock =
    player.heroId === 'ranger' && player.ultimateActiveTimer > 0 ? 1.85 : 1.0;
  const effectiveHaste = player.cooldownHaste * rangerOverclock;

  for (const slot of player.weapons) {
    slot.orbitAngle += dt * (2.6 + slot.level * 0.35);
    slot.cooldownTimer -= dt * effectiveHaste;

    if (slot.weaponId === 'aether-orbitals') {
      tickOrbitalBlades(world, slot);
      continue;
    }

    if (slot.cooldownTimer <= 0 && world.enemies.length > 0) {
      const def = getWeaponById(slot.weaponId);
      const levelSpeedBonus = Math.max(0.55, 1 - (slot.level - 1) * 0.07);
      slot.cooldownTimer = def.baseCooldown * levelSpeedBonus;
      fireWeaponBySlot(world, slot);
    }
  }
}

function fireWeaponBySlot(world: GameWorldState, slot: ActiveWeaponSlot): void {
  switch (slot.weaponId) {
    case 'plasma-katana':
      firePlasmaKatana(world, slot);
      break;
    case 'aether-prism':
      fireAetherPrism(world, slot);
      break;
    case 'railgun-pistols':
      fireRailgunPistols(world, slot);
      break;
    case 'tesla-coil':
      fireTeslaCoil(world, slot);
      break;
    case 'frost-nova':
      fireFrostNova(world, slot);
      break;
    case 'solar-lance':
      fireSolarLance(world, slot);
      break;
    case 'seeker-missiles':
      fireSeekerMissiles(world, slot);
      break;
    default:
      break;
  }
}

function firePlasmaKatana(world: GameWorldState, slot: ActiveWeaponSlot): void {
  const { player } = world;
  const radius = 135 + (slot.level - 1) * 18;
  const spread = 1.25 + (slot.level - 1) * 0.12;
  spawnSlashArc(world, player.x, player.y, player.aimAngle, radius, spread, '#00f5d4');
  audioSynth.playSfx('slash');

  for (const enemy of world.enemies) {
    const dist = distanceBetween(player.x, player.y, enemy.x, enemy.y);
    if (dist <= radius + enemy.radius) {
      const angleToEnemy = Math.atan2(enemy.y - player.y, enemy.x - player.x);
      if (angleDifference(player.aimAngle, angleToEnemy) <= spread * 0.6) {
        const { damage, isCrit } = computeSlotDamage(world, slot);
        inflictDirectWeaponHit(world, slot, enemy, damage, isCrit, '#00f5d4');
        enemy.x += Math.cos(angleToEnemy) * 18;
        enemy.y += Math.sin(angleToEnemy) * 18;
      }
    }
  }

  if (slot.level >= 2) {
    const { damage } = computeSlotDamage(world, slot);
    world.projectiles.push({
      id: world.nextEntityId++,
      x: player.x,
      y: player.y,
      vx: Math.cos(player.aimAngle) * 660,
      vy: Math.sin(player.aimAngle) * 660,
      radius: 12,
      damage: damage * 0.75,
      element: 'plasma',
      color: '#00f5d4',
      fromPlayer: true,
      pierceRemaining: 4 + slot.level,
      hitEnemyIds: [],
      lifetime: 0.65,
      maxLifetime: 0.65,
      homingStrength: 0,
      explosiveRadius: 0,
      isBeam: false,
      beamEndX: 0,
      beamEndY: 0,
      weaponId: slot.weaponId,
    });
  }
}

function fireAetherPrism(world: GameWorldState, slot: ActiveWeaponSlot): void {
  const { player } = world;
  const count = 1 + Math.floor(slot.level / 2);
  audioSynth.playSfx('laser');

  for (let i = 0; i < count; i += 1) {
    const spreadOffset = (i - (count - 1) / 2) * 0.22;
    const angle = player.aimAngle + spreadOffset;
    const { damage } = computeSlotDamage(world, slot);
    world.projectiles.push({
      id: world.nextEntityId++,
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * 520,
      vy: Math.sin(angle) * 520,
      radius: 7,
      damage,
      element: 'arcane',
      color: '#c77dff',
      fromPlayer: true,
      pierceRemaining: 1 + Math.floor(slot.level / 3),
      hitEnemyIds: [],
      lifetime: 1.5,
      maxLifetime: 1.5,
      homingStrength: 4.8,
      explosiveRadius: 0,
      isBeam: false,
      beamEndX: 0,
      beamEndY: 0,
      weaponId: slot.weaponId,
    });
  }
}

function fireRailgunPistols(world: GameWorldState, slot: ActiveWeaponSlot): void {
  const { player } = world;
  const shots = slot.level >= 4 ? 2 : 1;
  audioSynth.playSfx('railgun');

  for (let i = 0; i < shots; i += 1) {
    const offset = (i - (shots - 1) / 2) * 0.1;
    const angle = player.aimAngle + offset;
    const { damage } = computeSlotDamage(world, slot);
    world.projectiles.push({
      id: world.nextEntityId++,
      x: player.x,
      y: player.y,
      vx: Math.cos(angle) * 940,
      vy: Math.sin(angle) * 940,
      radius: 6,
      damage,
      element: 'physical',
      color: '#ffbe0b',
      fromPlayer: true,
      pierceRemaining: 3 + slot.level,
      hitEnemyIds: [],
      lifetime: 0.9,
      maxLifetime: 0.9,
      homingStrength: 0,
      explosiveRadius: 0,
      isBeam: false,
      beamEndX: 0,
      beamEndY: 0,
      weaponId: slot.weaponId,
    });
  }
}

function fireTeslaCoil(world: GameWorldState, slot: ActiveWeaponSlot): void {
  const { player } = world;
  const bounces = 3 + slot.level;
  const hitIds: number[] = [];
  const points: Vector2D[] = [{ x: player.x, y: player.y }];
  let currentX = player.x;
  let currentY = player.y;

  for (let i = 0; i < bounces; i += 1) {
    const nextTarget = findNearestEnemy(currentX, currentY, world.enemies, 320, hitIds);
    if (!nextTarget) {
      break;
    }
    hitIds.push(nextTarget.id);
    points.push({ x: nextTarget.x, y: nextTarget.y });
    const { damage, isCrit } = computeSlotDamage(world, slot);
    nextTarget.shockTimer = 1.1;
    inflictDirectWeaponHit(world, slot, nextTarget, damage, isCrit, '#4cc9f0');
    currentX = nextTarget.x;
    currentY = nextTarget.y;
  }

  if (points.length > 1) {
    spawnLightningChain(world, points, '#4cc9f0');
    audioSynth.playSfx('lightning');
  }
}
