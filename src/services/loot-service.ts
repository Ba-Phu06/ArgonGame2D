import { generateUpgradeChoices } from '../data/upgrades-catalog';
import { GameWorldState } from '../types/content-types';
import { EnemyEntity } from '../types/game-types';
import { audioSynth } from './audio-synth';
import { distanceBetween, normalizeVector } from './math-utils';
import { spawnFloatingText, spawnParticleBurst } from './particle-system';

export function resolveDeadEnemies(world: GameWorldState): void {
  for (let i = world.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = world.enemies[i];
    if (enemy.hp > 0) {
      continue;
    }
    world.kills += 1;
    world.comboCount += 1;
    world.comboTimer = 3.2;
    world.score += Math.round(enemy.xpValue * 12 * (1 + Math.min(2.5, world.comboCount * 0.03)));
    world.player.ultimateEnergy = Math.min(
      world.player.ultimateMaxEnergy,
      world.player.ultimateEnergy + (enemy.isBoss ? 35 : 2.8)
    );

    spawnParticleBurst(world, enemy.x, enemy.y, enemy.color, enemy.isBoss ? 40 : 12, 240, 4.2);
    spawnEnemyLoot(world, enemy);
    world.enemies.splice(i, 1);

    if (enemy.isBoss && world.wave >= world.maxWaves && !world.endlessMode) {
      world.status = 'victory';
      audioSynth.playSfx('level-up');
    }
  }
}

function spawnEnemyLoot(world: GameWorldState, enemy: EnemyEntity): void {
  world.pickups.push({
    id: world.nextEntityId++,
    kind: 'xp',
    x: enemy.x,
    y: enemy.y,
    vx: 0,
    vy: 0,
    value: enemy.xpValue,
    radius: 7,
    magnetized: false,
  });

  if (enemy.isBoss || enemy.isElite || Math.random() < 0.32) {
    world.pickups.push({
      id: world.nextEntityId++,
      kind: 'shard',
      x: enemy.x + 12,
      y: enemy.y - 8,
      vx: 0,
      vy: 0,
      value: enemy.shardValue,
      radius: 8,
      magnetized: false,
    });
  }

  if (Math.random() < 0.06 || enemy.isBoss) {
    world.pickups.push({
      id: world.nextEntityId++,
      kind: 'heal',
      x: enemy.x - 10,
      y: enemy.y + 10,
      vx: 0,
      vy: 0,
      value: 28,
      radius: 9,
      magnetized: false,
    });
  }
}

export function updatePickupsAndLeveling(world: GameWorldState, dt: number): void {
  const { player } = world;
  for (let i = world.pickups.length - 1; i >= 0; i -= 1) {
    const item = world.pickups[i];
    const dist = distanceBetween(player.x, player.y, item.x, item.y);
    if (dist <= player.pickupRadius) {
      item.magnetized = true;
    }
    if (item.magnetized) {
      const dir = normalizeVector(player.x - item.x, player.y - item.y);
      item.x += dir.x * 540 * dt;
      item.y += dir.y * 540 * dt;
    }
    if (dist <= player.radius + item.radius + 8) {
      collectPickupItem(world, item);
      world.pickups.splice(i, 1);
    }
  }
}

function collectPickupItem(
  world: GameWorldState,
  item: GameWorldState['pickups'][number]
): void {
  const { player } = world;
  audioSynth.playSfx('pickup', Math.min(25, world.comboCount));
  if (item.kind === 'xp') {
    player.xp += item.value;
    if (player.xp >= player.xpToNext && world.status === 'playing') {
      player.xp -= player.xpToNext;
      player.level += 1;
      player.xpToNext = Math.round(player.xpToNext * 1.32 + 25);
      world.upgradeChoices = generateUpgradeChoices(player);
      world.status = 'level-up';
      audioSynth.playSfx('level-up');
    }
  } else if (item.kind === 'shard') {
    world.shardsEarned += item.value;
  } else if (item.kind === 'heal') {
    player.hp = Math.min(player.maxHp, player.hp + item.value);
    spawnFloatingText(world, player.x, player.y - 18, `+${item.value} HP`, '#38b000', false);
  }
}
