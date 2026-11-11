import { GameWorldState } from '../types/content-types';
import { EnemyEntity, ProjectileEntity } from '../types/game-types';
import { audioSynth } from './audio-synth';
import { resolveDeadEnemies, updatePickupsAndLeveling } from './loot-service';
import {
  angleDifference,
  distanceBetween,
  findNearestEnemy,
  normalizeVector,
} from './math-utils';
import {
  spawnFloatingText,
  spawnGridPulse,
  spawnParticleBurst,
} from './particle-system';
import { applyDamageToPlayer } from './player-service';

export function updateCombatAndProjectiles(world: GameWorldState, dt: number): void {
  updateActiveProjectiles(world, dt);
  resolveDeadEnemies(world);
  updatePickupsAndLeveling(world, dt);

  if (world.comboTimer > 0) {
    world.comboTimer = Math.max(0, world.comboTimer - dt);
    if (world.comboTimer <= 0) {
      world.comboCount = 0;
    }
  }
}

function updateActiveProjectiles(world: GameWorldState, dt: number): void {
  for (let i = world.projectiles.length - 1; i >= 0; i -= 1) {
    const proj = world.projectiles[i];
    proj.lifetime -= dt;
    if (proj.lifetime <= 0) {
      world.projectiles.splice(i, 1);
      continue;
    }
    if (proj.isBeam) {
      continue;
    }

    if (proj.fromPlayer && proj.homingStrength > 0) {
      steerHomingProjectile(world, proj, dt);
    }

    proj.x += proj.vx * dt;
    proj.y += proj.vy * dt;

    if (!proj.fromPlayer) {
      if (
        distanceBetween(proj.x, proj.y, world.player.x, world.player.y) <=
        proj.radius + world.player.radius
      ) {
        applyDamageToPlayer(world, proj.damage);
        world.projectiles.splice(i, 1);
      }
      continue;
    }

    if (checkPlayerProjectileHit(world, proj)) {
      world.projectiles.splice(i, 1);
    }
  }
}

function steerHomingProjectile(world: GameWorldState, proj: ProjectileEntity, dt: number): void {
  const target = findNearestEnemy(proj.x, proj.y, world.enemies, 420, proj.hitEnemyIds);
  if (!target) {
    return;
  }
  const speed = Math.hypot(proj.vx, proj.vy) || 480;
  const desired = normalizeVector(target.x - proj.x, target.y - proj.y);
  const current = normalizeVector(proj.vx, proj.vy);
  const blend = Math.min(1, proj.homingStrength * dt);
  const nextDir = normalizeVector(
    current.x + (desired.x - current.x) * blend,
    current.y + (desired.y - current.y) * blend
  );
  proj.vx = nextDir.x * speed;
  proj.vy = nextDir.y * speed;
}

function checkPlayerProjectileHit(world: GameWorldState, proj: ProjectileEntity): boolean {
  for (const enemy of world.enemies) {
    if (enemy.hp <= 0 || proj.hitEnemyIds.includes(enemy.id)) {
      continue;
    }
    if (distanceBetween(proj.x, proj.y, enemy.x, enemy.y) <= proj.radius + enemy.radius) {
      proj.hitEnemyIds.push(enemy.id);
      proj.pierceRemaining -= 1;
      applyProjectileDamageToEnemy(world, proj, enemy);
      if (proj.explosiveRadius > 0) {
        triggerProjectileExplosion(world, proj);
        return true;
      }
      if (proj.pierceRemaining <= 0) {
        return true;
      }
    }
  }
  return false;
}

function applyProjectileDamageToEnemy(
  world: GameWorldState,
  proj: ProjectileEntity,
  enemy: EnemyEntity
): void {
  let finalDamage = proj.damage;
  if (enemy.shieldFront) {
    const incomingAngle = Math.atan2(proj.y - enemy.y, proj.x - enemy.x);
    if (angleDifference(enemy.facingAngle, incomingAngle) < 1.05) {
      finalDamage *= 0.42;
    }
  }

  if (proj.element === 'cryo') {
    enemy.chillTimer = 3.0;
  }
  if (proj.element === 'arcane' && enemy.burnTimer > 0) {
    finalDamage *= 1.45;
    spawnFloatingText(world, enemy.x, enemy.y - 22, 'QUÁ NHIỆT!', '#ff5400', true);
  }
  if ((proj.element === 'plasma' || proj.element === 'lightning') && enemy.chillTimer > 0) {
    finalDamage *= 1.5;
    spawnFloatingText(world, enemy.x, enemy.y - 22, 'SIÊU DẪN!', '#4cc9f0', true);
  }

  enemy.hp -= finalDamage;
  enemy.hitFlashTimer = 0.1;

  if (proj.weaponId) {
    const slot = world.player.weapons.find((w) => w.weaponId === proj.weaponId);
    if (slot) {
      slot.totalDamageDealt += finalDamage;
    }
  }

  spawnParticleBurst(world, proj.x, proj.y, proj.color, 5, 150, 3.0);
  spawnFloatingText(world, enemy.x, enemy.y, `${Math.round(finalDamage)}`, proj.color, false);
}

function triggerProjectileExplosion(world: GameWorldState, proj: ProjectileEntity): void {
  spawnGridPulse(world, proj.x, proj.y, proj.explosiveRadius, proj.color);
  spawnParticleBurst(world, proj.x, proj.y, proj.color, 16, 220, 4.0);
  audioSynth.playSfx('explosion');

  for (const enemy of world.enemies) {
    if (distanceBetween(proj.x, proj.y, enemy.x, enemy.y) <= proj.explosiveRadius + enemy.radius) {
      enemy.hp -= proj.damage * 0.65;
      if (proj.element === 'cryo') {
        enemy.chillTimer = 3.2;
      }
    }
  }
}
