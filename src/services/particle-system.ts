import { GameWorldState } from '../types/content-types';
import { Vector2D } from '../types/game-types';
import { randomRange } from './math-utils';

export function spawnParticleBurst(
  world: GameWorldState,
  x: number,
  y: number,
  color: string,
  count: number,
  speedMax: number = 220,
  radiusMax: number = 4.2
): void {
  const maxParticles = 360;
  const available = Math.max(0, maxParticles - world.particles.length);
  const spawnCount = Math.min(count, available);

  for (let i = 0; i < spawnCount; i += 1) {
    const angle = randomRange(0, Math.PI * 2);
    const speed = randomRange(speedMax * 0.25, speedMax);
    const life = randomRange(0.22, 0.58);
    world.particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: randomRange(1.6, radiusMax),
      color,
      alpha: 1,
      life,
      maxLife: life,
      glow: true,
    });
  }
}

export function spawnFloatingText(
  world: GameWorldState,
  x: number,
  y: number,
  text: string,
  color: string,
  isCrit: boolean = false
): void {
  if (world.floatingTexts.length > 75) {
    world.floatingTexts.shift();
  }
  const life = isCrit ? 0.85 : 0.62;
  world.floatingTexts.push({
    x: x + randomRange(-12, 12),
    y: y - 14,
    vy: isCrit ? -68 : -48,
    text,
    color,
    scale: isCrit ? 1.28 : 1.0,
    life,
    maxLife: life,
    isCrit,
  });
}

export function spawnSlashArc(
  world: GameWorldState,
  x: number,
  y: number,
  angle: number,
  radius: number,
  arcSpread: number,
  color: string
): void {
  world.slashArcs.push({
    x,
    y,
    angle,
    radius,
    arcSpread,
    color,
    life: 0.18,
    maxLife: 0.18,
  });
}

export function spawnLightningChain(
  world: GameWorldState,
  points: Vector2D[],
  color: string
): void {
  if (points.length < 2) {
    return;
  }
  world.lightningBolts.push({
    points,
    color,
    life: 0.22,
    maxLife: 0.22,
  });
}

export function spawnGridPulse(
  world: GameWorldState,
  x: number,
  y: number,
  maxRadius: number,
  color: string
): void {
  if (world.gridPulses.length > 12) {
    world.gridPulses.shift();
  }
  world.gridPulses.push({
    x,
    y,
    radius: 14,
    maxRadius,
    color,
    alpha: 0.75,
  });
}

export function updateVisualEffects(world: GameWorldState, dt: number): void {
  for (let i = world.particles.length - 1; i >= 0; i -= 1) {
    const p = world.particles[i];
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vx *= 0.94;
    p.vy *= 0.94;
    p.life -= dt;
    p.alpha = Math.max(0, p.life / p.maxLife);
    if (p.life <= 0) {
      world.particles.splice(i, 1);
    }
  }

  for (let i = world.floatingTexts.length - 1; i >= 0; i -= 1) {
    const ft = world.floatingTexts[i];
    ft.y += ft.vy * dt;
    ft.life -= dt;
    if (ft.life <= 0) {
      world.floatingTexts.splice(i, 1);
    }
  }

  for (let i = world.slashArcs.length - 1; i >= 0; i -= 1) {
    world.slashArcs[i].life -= dt;
    if (world.slashArcs[i].life <= 0) {
      world.slashArcs.splice(i, 1);
    }
  }

  for (let i = world.lightningBolts.length - 1; i >= 0; i -= 1) {
    world.lightningBolts[i].life -= dt;
    if (world.lightningBolts[i].life <= 0) {
      world.lightningBolts.splice(i, 1);
    }
  }

  for (let i = world.gridPulses.length - 1; i >= 0; i -= 1) {
    const pulse = world.gridPulses[i];
    pulse.radius += (pulse.maxRadius - pulse.radius) * Math.min(1, dt * 6.5);
    pulse.alpha -= dt * 1.35;
    if (pulse.alpha <= 0) {
      world.gridPulses.splice(i, 1);
    }
  }
}
