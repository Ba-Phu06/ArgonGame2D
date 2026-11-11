import { getBiomeById, getHeroById } from '../data/heroes-catalog';
import { getWeaponById } from '../data/weapons-catalog';
import { GameWorldState, StarPoint } from '../types/content-types';
import { MetaUpgradeLevels, RunHistoryRecord } from '../types/data-types';
import { BiomeId, HeroId } from '../types/game-types';
import { audioSynth } from './audio-synth';
import { updateCombatAndProjectiles } from './combat-service';
import { updateEnemiesAndTelegraphs } from './enemy-ai-service';
import { updateWaveDirector } from './enemy-spawner';
import { clampNumber, randomRange } from './math-utils';
import { updateVisualEffects } from './particle-system';
import {
  createInitialPlayer,
  PlayerInputSnapshot,
  updatePlayerState,
} from './player-service';
import { updatePlayerWeapons } from './weapon-service';

function createStarfield(worldWidth: number, worldHeight: number): StarPoint[] {
  const colors = ['#ffffff', '#00f5d4', '#c77dff', '#ffbe0b', '#4cc9f0'];
  const stars: StarPoint[] = [];
  for (let i = 0; i < 140; i += 1) {
    stars.push({
      x: randomRange(0, worldWidth),
      y: randomRange(0, worldHeight),
      size: randomRange(1.0, 2.8),
      alpha: randomRange(0.25, 0.85),
      parallax: randomRange(0.2, 0.85),
      color: colors[i % colors.length],
    });
  }
  return stars;
}

export function createGameWorldState(
  heroId: HeroId,
  biomeId: BiomeId,
  metaLevels: MetaUpgradeLevels
): GameWorldState {
  const worldWidth = 2400;
  const worldHeight = 2400;
  const startX = worldWidth / 2;
  const startY = worldHeight / 2;

  return {
    status: 'playing',
    biomeId,
    worldWidth,
    worldHeight,
    cameraX: startX,
    cameraY: startY,
    elapsedTime: 0,
    wave: 1,
    maxWaves: 10,
    endlessMode: false,
    spawnTimer: 0.4,
    eliteTimer: 14,
    bossSpawnedForWave: 0,
    kills: 0,
    score: 0,
    shardsEarned: 0,
    comboCount: 0,
    comboTimer: 0,
    screenShake: 0,
    hitStopTimer: 0,
    damageFlashAlpha: 0,
    timeScaleEnemy: 1.0,
    nextEntityId: 1,
    player: createInitialPlayer(heroId, metaLevels, startX, startY),
    enemies: [],
    projectiles: [],
    slashArcs: [],
    lightningBolts: [],
    telegraphs: [],
    particles: [],
    floatingTexts: [],
    pickups: [],
    upgradeChoices: [],
    stars: createStarfield(worldWidth, worldHeight),
    gridPulses: [],
  };
}

export function updateGameWorld(
  world: GameWorldState,
  input: PlayerInputSnapshot,
  rawDt: number,
  viewportWidth: number,
  viewportHeight: number
): void {
  if (world.status !== 'playing') {
    return;
  }

  const dt = Math.min(0.05, rawDt);
  if (world.hitStopTimer > 0) {
    world.hitStopTimer = Math.max(0, world.hitStopTimer - dt);
    return;
  }

  world.elapsedTime += dt;
  world.screenShake = Math.max(0, world.screenShake - dt * 28);
  world.damageFlashAlpha = Math.max(0, world.damageFlashAlpha - dt * 1.8);

  const hasBoss = world.enemies.some((enemy) => enemy.isBoss && enemy.hp > 0);
  audioSynth.tickBackgroundPulse(dt, hasBoss);

  updatePlayerState(world, input, dt);
  updateWaveDirector(world, dt);
  updatePlayerWeapons(world, dt);
  updateEnemiesAndTelegraphs(world, dt);
  updateCombatAndProjectiles(world, dt);
  updateVisualEffects(world, dt);

  const halfW = viewportWidth / 2;
  const halfH = viewportHeight / 2;
  const targetCamX = clampNumber(world.player.x, halfW * 0.4, world.worldWidth - halfW * 0.4);
  const targetCamY = clampNumber(world.player.y, halfH * 0.4, world.worldHeight - halfH * 0.4);
  world.cameraX += (targetCamX - world.cameraX) * Math.min(1, dt * 10);
  world.cameraY += (targetCamY - world.cameraY) * Math.min(1, dt * 10);

  if (world.player.hp <= 0) {
    world.status = 'defeat';
    audioSynth.playSfx('explosion');
  }
}

export function buildRunHistoryRecord(world: GameWorldState): RunHistoryRecord {
  const hero = getHeroById(world.player.heroId);
  const biome = getBiomeById(world.biomeId);

  return {
    id: `run-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    heroId: hero.id,
    heroName: hero.name,
    biomeId: biome.id,
    biomeName: biome.name,
    outcome: world.status === 'victory' ? 'victory' : 'defeat',
    waveReached: world.wave,
    durationSeconds: Math.round(world.elapsedTime),
    kills: world.kills,
    score: world.score,
    shardsEarned: Math.max(5, world.shardsEarned + world.wave * 3),
    levelReached: world.player.level,
    weaponStats: world.player.weapons.map((slot) => ({
      weaponId: slot.weaponId,
      weaponName: getWeaponById(slot.weaponId).name,
      damageDealt: Math.round(slot.totalDamageDealt),
      level: slot.level,
    })),
  };
}
