import { getEnemyDefinition } from '../data/enemies-catalog';
import { getBiomeById } from '../data/heroes-catalog';
import { GameWorldState } from '../types/content-types';
import { EnemyArchetypeId, EnemyEntity } from '../types/game-types';
import { audioSynth } from './audio-synth';
import { clampNumber, randomRange } from './math-utils';
import { spawnFloatingText, spawnGridPulse } from './particle-system';

export function spawnEnemyInstance(
  world: GameWorldState,
  archetypeId: EnemyArchetypeId,
  x: number,
  y: number,
  isElite: boolean = false
): EnemyEntity {
  const def = getEnemyDefinition(archetypeId);
  const biome = getBiomeById(world.biomeId);
  const waveScale = 1 + (world.wave - 1) * 0.24;
  const eliteMult = isElite ? 2.4 : 1.0;
  const maxHp = Math.round(def.baseHp * waveScale * biome.difficultyMultiplier * eliteMult);

  const entity: EnemyEntity = {
    id: world.nextEntityId++,
    archetypeId,
    name: isElite ? `[Tinh Anh] ${def.name}` : def.name,
    x: clampNumber(x, 45, world.worldWidth - 45),
    y: clampNumber(y, 45, world.worldHeight - 45),
    vx: 0,
    vy: 0,
    radius: isElite ? Math.round(def.radius * 1.25) : def.radius,
    hp: maxHp,
    maxHp,
    speed: def.baseSpeed * (isElite ? 1.12 : 1.0),
    contactDamage: Math.round(def.contactDamage * biome.difficultyMultiplier * (isElite ? 1.35 : 1)),
    xpValue: Math.round(def.xpValue * (isElite ? 2.8 : 1)),
    shardValue: Math.round(def.shardValue * biome.difficultyMultiplier * (isElite ? 3 : 1)),
    color: def.color,
    isBoss: def.isBoss,
    isElite,
    facingAngle: 0,
    shieldFront: def.shieldFront,
    actionTimer: randomRange(1.4, 2.8),
    actionState: 'chase',
    targetX: x,
    targetY: y,
    chillTimer: 0,
    burnTimer: 0,
    burnDps: 0,
    shockTimer: 0,
    hitFlashTimer: 0,
    bossPhase: 1,
  };

  world.enemies.push(entity);
  return entity;
}

function getPerimeterSpawnPoint(world: GameWorldState): { x: number; y: number } {
  const angle = randomRange(0, Math.PI * 2);
  const dist = randomRange(520, 680);
  const x = clampNumber(world.player.x + Math.cos(angle) * dist, 50, world.worldWidth - 50);
  const y = clampNumber(world.player.y + Math.sin(angle) * dist, 50, world.worldHeight - 50);
  return { x, y };
}

function selectWaveArchetype(wave: number): EnemyArchetypeId {
  const pool: EnemyArchetypeId[] = ['swarm-drone'];
  if (wave >= 2) pool.push('volatile-crawler', 'sniper-mech');
  if (wave >= 3) pool.push('shield-juggernaut');
  if (wave >= 4) pool.push('phase-assassin', 'necro-weaver');
  return pool[Math.floor(Math.random() * pool.length)];
}

function trySpawnWaveBoss(world: GameWorldState): void {
  const isBossWave =
    world.wave === 5 || world.wave === 10 || (world.endlessMode && world.wave % 5 === 0);
  if (!isBossWave || world.bossSpawnedForWave === world.wave) return;

  world.bossSpawnedForWave = world.wave;
  const pt = getPerimeterSpawnPoint(world);
  spawnEnemyInstance(world, 'chronos-titan', pt.x, pt.y, false);
  audioSynth.playSfx('boss-spawn');
  spawnGridPulse(world, pt.x, pt.y, 520, '#ff0055');
  spawnFloatingText(
    world,
    world.player.x,
    world.player.y - 64,
    'CẢNH BÁO: CHRONOS TITAN XUẤT HIỆN!',
    '#ff0055',
    true
  );
}

export function updateWaveDirector(world: GameWorldState, dt: number): void {
  const targetWave = Math.min(
    world.endlessMode ? 99 : world.maxWaves,
    Math.floor(world.elapsedTime / 25) + 1
  );
  if (targetWave > world.wave) {
    world.wave = targetWave;
    spawnFloatingText(world, world.player.x, world.player.y - 45, `ĐỢT ${world.wave}`, '#00f5d4', true);
  }

  trySpawnWaveBoss(world);

  world.spawnTimer -= dt;
  const maxActiveEnemies = 58 + world.wave * 5;
  if (world.spawnTimer <= 0 && world.enemies.length < maxActiveEnemies) {
    world.spawnTimer = Math.max(0.38, 1.35 - world.wave * 0.08);
    const batchCount = 1 + Math.floor(world.wave / 3);
    for (let i = 0; i < batchCount; i += 1) {
      const pt = getPerimeterSpawnPoint(world);
      spawnEnemyInstance(world, selectWaveArchetype(world.wave), pt.x, pt.y, false);
    }
  }

  world.eliteTimer -= dt;
  if (world.eliteTimer <= 0 && world.wave >= 2) {
    world.eliteTimer = Math.max(9, 18 - world.wave * 0.7);
    const pt = getPerimeterSpawnPoint(world);
    spawnEnemyInstance(world, selectWaveArchetype(world.wave), pt.x, pt.y, true);
  }
}
