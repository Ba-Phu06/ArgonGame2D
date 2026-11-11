import { getHeroById } from '../data/heroes-catalog';
import { GameWorldState, UpgradeCardOption } from '../types/content-types';
import { audioSynth } from './audio-synth';
import { distanceBetween, normalizeVector } from './math-utils';
import {
  spawnFloatingText,
  spawnGridPulse,
  spawnParticleBurst,
  spawnSlashArc,
} from './particle-system';

export function triggerPlayerDash(world: GameWorldState, moveX: number, moveY: number): void {
  const { player } = world;
  if (player.dashCooldown > 0 || player.dashTimer > 0) {
    return;
  }
  const dir =
    Math.abs(moveX) > 0.01 || Math.abs(moveY) > 0.01
      ? normalizeVector(moveX, moveY)
      : { x: Math.cos(player.aimAngle), y: Math.sin(player.aimAngle) };

  player.vx = dir.x * player.speed * 3.1;
  player.vy = dir.y * player.speed * 3.1;
  player.dashTimer = 0.18;
  player.invulnerableTimer = Math.max(player.invulnerableTimer, 0.28);
  player.dashCooldown = player.dashMaxCooldown;
  audioSynth.playSfx('dash');
  spawnGridPulse(world, player.x, player.y, 170, '#00f5d4');
  spawnParticleBurst(world, player.x, player.y, '#00f5d4', 14, 190, 3.5);
}

export function triggerPlayerUltimate(world: GameWorldState): void {
  const { player } = world;
  if (player.ultimateEnergy < player.ultimateMaxEnergy) {
    return;
  }
  player.ultimateEnergy = 0;
  player.ultimateActiveTimer = 6.0;
  player.invulnerableTimer = Math.max(player.invulnerableTimer, 1.2);
  world.screenShake = Math.max(world.screenShake, 12);
  audioSynth.playSfx('ultimate');

  const hero = getHeroById(player.heroId);
  spawnGridPulse(world, player.x, player.y, 440, hero.accentColor);
  spawnFloatingText(world, player.x, player.y - 24, hero.ultimateName, hero.accentColor, true);
  executeHeroUltimatePayload(world);
}

function executeHeroUltimatePayload(world: GameWorldState): void {
  const { player } = world;
  if (player.heroId === 'valkyrie') {
    player.shield = Math.min(player.maxShield, player.shield + player.maxShield * 0.45);
    spawnSlashArc(world, player.x, player.y, 0, 210, Math.PI * 2, '#00f5d4');
    for (let i = 0; i < 12; i += 1) {
      const angle = (Math.PI * 2 * i) / 12;
      world.projectiles.push({
        id: world.nextEntityId++,
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * 680,
        vy: Math.sin(angle) * 680,
        radius: 10,
        damage: 78 * player.damageMultiplier,
        element: 'plasma',
        color: '#00f5d4',
        fromPlayer: true,
        pierceRemaining: 6,
        hitEnemyIds: [],
        lifetime: 0.95,
        maxLifetime: 0.95,
        homingStrength: 0,
        explosiveRadius: 0,
        isBeam: false,
        beamEndX: 0,
        beamEndY: 0,
        weaponId: 'plasma-katana',
      });
    }
  } else if (player.heroId === 'technomancer') {
    for (const enemy of world.enemies) {
      if (distanceBetween(player.x, player.y, enemy.x, enemy.y) <= 480) {
        enemy.hp -= 95 * player.damageMultiplier;
        enemy.shockTimer = 3.5;
        enemy.burnTimer = 4.0;
        enemy.burnDps = 22 * player.damageMultiplier;
        spawnParticleBurst(world, enemy.x, enemy.y, '#c77dff', 10, 180, 3.8);
      }
    }
  } else {
    world.timeScaleEnemy = 0.35;
  }
}

export function applyUpgradeChoice(world: GameWorldState, option: UpgradeCardOption): void {
  const { player } = world;
  if (option.kind === 'weapon-unlock' && option.weaponId) {
    player.weapons.push({
      weaponId: option.weaponId,
      level: 1,
      cooldownTimer: 0.1,
      orbitAngle: 0,
      totalDamageDealt: 0,
    });
  } else if (option.kind === 'weapon-upgrade' && option.weaponId) {
    const target = player.weapons.find((w) => w.weaponId === option.weaponId);
    if (target) {
      target.level += 1;
    }
  } else if (option.statKey && typeof option.statAmount === 'number') {
    player[option.statKey] += option.statAmount;
    if (option.statKey === 'maxHp') {
      player.hp = Math.min(player.maxHp, player.hp + option.statAmount + player.maxHp * 0.3);
    }
    if (option.statKey === 'maxShield') {
      player.shield = player.maxShield;
    }
    if (option.statKey === 'speed') {
      player.pickupRadius += 35;
    }
  }
}
