import { GameWorldState } from '../types/content-types';
import { EnemyEntity } from '../types/game-types';
import { spawnEnemyInstance } from './enemy-spawner';
import { clampNumber, distanceBetween, distanceToSegment } from './math-utils';
import { spawnGridPulse, spawnParticleBurst } from './particle-system';
import { applyDamageToPlayer } from './player-service';

export function updateEnemiesAndTelegraphs(world: GameWorldState, dt: number): void {
  const scaledDt = dt * world.timeScaleEnemy;

  for (let i = world.telegraphs.length - 1; i >= 0; i -= 1) {
    const zone = world.telegraphs[i];
    zone.timer -= scaledDt;
    if (zone.timer <= 0) {
      detonateTelegraphZone(world, zone);
      world.telegraphs.splice(i, 1);
    }
  }

  for (const enemy of world.enemies) {
    if (enemy.hp <= 0) continue;
    tickEnemyStatusEffects(enemy, dt);
    if (enemy.shockTimer > 0) continue;
    const chillFactor = enemy.chillTimer > 0 ? 0.52 : 1.0;
    const enemyDt = scaledDt * chillFactor;

    if (enemy.isBoss) {
      updateBossBehavior(world, enemy, enemyDt);
    } else {
      updateStandardEnemyBehavior(world, enemy, enemyDt);
    }

    const distToPlayer = distanceBetween(enemy.x, enemy.y, world.player.x, world.player.y);
    if (distToPlayer <= enemy.radius + world.player.radius - 2) {
      applyDamageToPlayer(world, enemy.contactDamage);
      if (enemy.archetypeId === 'volatile-crawler') {
        enemy.hp = 0;
        spawnGridPulse(world, enemy.x, enemy.y, 130, '#ff006e');
      }
    }
  }
}

function tickEnemyStatusEffects(enemy: EnemyEntity, dt: number): void {
  enemy.hitFlashTimer = Math.max(0, enemy.hitFlashTimer - dt);
  enemy.chillTimer = Math.max(0, enemy.chillTimer - dt);
  enemy.shockTimer = Math.max(0, enemy.shockTimer - dt);
  if (enemy.burnTimer > 0) {
    enemy.burnTimer = Math.max(0, enemy.burnTimer - dt);
    enemy.hp -= enemy.burnDps * dt;
  }
}

function tryTriggerSniperTelegraph(
  world: GameWorldState,
  enemy: EnemyEntity,
  dx: number,
  dy: number,
  dist: number,
  dt: number
): void {
  if (dist > 340) {
    enemy.x += (dx / dist) * enemy.speed * dt;
    enemy.y += (dy / dist) * enemy.speed * dt;
  }
  if (enemy.actionTimer <= 0) {
    enemy.actionTimer = 3.1;
    world.telegraphs.push({
      id: world.nextEntityId++,
      kind: 'line',
      x: enemy.x,
      y: enemy.y,
      endX: world.player.x + (dx / dist) * 140,
      endY: world.player.y + (dy / dist) * 140,
      radius: 14,
      timer: 0.85,
      maxTimer: 0.85,
      damage: enemy.contactDamage * 1.4,
      color: '#ffbe0b',
    });
  }
}

function updateStandardEnemyBehavior(
  world: GameWorldState,
  enemy: EnemyEntity,
  dt: number
): void {
  const { player } = world;
  const dx = player.x - enemy.x;
  const dy = player.y - enemy.y;
  const dist = Math.hypot(dx, dy) || 1;
  enemy.facingAngle = Math.atan2(dy, dx);
  enemy.actionTimer -= dt;

  if (enemy.archetypeId === 'sniper-mech') {
    tryTriggerSniperTelegraph(world, enemy, dx, dy, dist, dt);
    return;
  }
  if (enemy.archetypeId === 'necro-weaver' && enemy.actionTimer <= 0) {
    enemy.actionTimer = 4.2;
    if (world.enemies.length < 75) {
      spawnEnemyInstance(world, 'swarm-drone', enemy.x + 28, enemy.y - 28, false);
    }
  }
  const speedBoost =
    enemy.archetypeId === 'phase-assassin' && enemy.actionTimer <= 0.45 ? 2.3 : 1.0;
  if (enemy.actionTimer <= 0) enemy.actionTimer = 2.6;
  enemy.x = clampNumber(
    enemy.x + (dx / dist) * enemy.speed * speedBoost * dt,
    30,
    world.worldWidth - 30
  );
  enemy.y = clampNumber(
    enemy.y + (dy / dist) * enemy.speed * speedBoost * dt,
    30,
    world.worldHeight - 30
  );
}

function fireBossRadialBurst(world: GameWorldState, boss: EnemyEntity): void {
  const bulletCount = boss.bossPhase === 2 ? 14 : 10;
  for (let i = 0; i < bulletCount; i += 1) {
    const angle = boss.facingAngle + (Math.PI * 2 * i) / bulletCount;
    world.projectiles.push({
      id: world.nextEntityId++,
      x: boss.x,
      y: boss.y,
      vx: Math.cos(angle) * 290,
      vy: Math.sin(angle) * 290,
      radius: 8,
      damage: boss.contactDamage * 0.75,
      element: 'plasma',
      color: '#ff0055',
      fromPlayer: false,
      pierceRemaining: 1,
      hitEnemyIds: [],
      lifetime: 2.6,
      maxLifetime: 2.6,
      homingStrength: 0,
      explosiveRadius: 0,
      isBeam: false,
      beamEndX: 0,
      beamEndY: 0,
    });
  }
}

function updateBossBehavior(world: GameWorldState, boss: EnemyEntity, dt: number): void {
  const { player } = world;
  const dx = player.x - boss.x;
  const dy = player.y - boss.y;
  const dist = Math.hypot(dx, dy) || 1;
  boss.facingAngle = Math.atan2(dy, dx);
  boss.bossPhase = boss.hp < boss.maxHp * 0.5 ? 2 : 1;

  const moveSpeed = boss.speed * (boss.bossPhase === 2 ? 1.25 : 1.0);
  boss.x = clampNumber(boss.x + (dx / dist) * moveSpeed * dt, 60, world.worldWidth - 60);
  boss.y = clampNumber(boss.y + (dy / dist) * moveSpeed * dt, 60, world.worldHeight - 60);

  boss.actionTimer -= dt;
  if (boss.actionTimer > 0) return;

  boss.actionTimer = boss.bossPhase === 2 ? 2.1 : 2.8;
  fireBossRadialBurst(world, boss);
  world.telegraphs.push({
    id: world.nextEntityId++,
    kind: 'circle',
    x: player.x,
    y: player.y,
    endX: player.x,
    endY: player.y,
    radius: 105,
    timer: 1.05,
    maxTimer: 1.05,
    damage: boss.contactDamage * 1.25,
    color: '#ff0055',
  });
}

function detonateTelegraphZone(
  world: GameWorldState,
  zone: GameWorldState['telegraphs'][number]
): void {
  const { player } = world;
  if (zone.kind === 'circle') {
    spawnGridPulse(world, zone.x, zone.y, zone.radius * 1.2, zone.color);
    spawnParticleBurst(world, zone.x, zone.y, zone.color, 18, 240, 4.2);
    if (distanceBetween(player.x, player.y, zone.x, zone.y) <= zone.radius + player.radius) {
      applyDamageToPlayer(world, zone.damage);
    }
  } else {
    spawnParticleBurst(world, zone.endX, zone.endY, zone.color, 10, 180, 3.2);
    const dist = distanceToSegment(player.x, player.y, zone.x, zone.y, zone.endX, zone.endY);
    if (dist <= zone.radius + player.radius) {
      applyDamageToPlayer(world, zone.damage);
    }
  }
}
