import { getBiomeById } from '../data/heroes-catalog';
import { GameWorldState } from '../types/content-types';

export function renderWorldBackground(
  ctx: CanvasRenderingContext2D,
  world: GameWorldState,
  viewportWidth: number,
  viewportHeight: number
): void {
  const biome = getBiomeById(world.biomeId);
  const grad = ctx.createRadialGradient(
    viewportWidth / 2,
    viewportHeight / 2,
    60,
    viewportWidth / 2,
    viewportHeight / 2,
    Math.max(viewportWidth, viewportHeight) * 0.75
  );
  grad.addColorStop(0, biome.bgSecondary);
  grad.addColorStop(1, biome.bgPrimary);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, viewportWidth, viewportHeight);

  renderParallaxStars(ctx, world, viewportWidth, viewportHeight);
}

function renderParallaxStars(
  ctx: CanvasRenderingContext2D,
  world: GameWorldState,
  viewportWidth: number,
  viewportHeight: number
): void {
  const offsetX = world.cameraX - viewportWidth / 2;
  const offsetY = world.cameraY - viewportHeight / 2;

  for (const star of world.stars) {
    const sx = ((star.x - offsetX * star.parallax) % viewportWidth + viewportWidth) % viewportWidth;
    const sy =
      ((star.y - offsetY * star.parallax) % viewportHeight + viewportHeight) % viewportHeight;
    ctx.globalAlpha = star.alpha;
    ctx.fillStyle = star.color;
    ctx.beginPath();
    ctx.arc(sx, sy, star.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function renderArenaGridAndTelegraphs(
  ctx: CanvasRenderingContext2D,
  world: GameWorldState,
  viewportWidth: number,
  viewportHeight: number
): void {
  const biome = getBiomeById(world.biomeId);
  const gridStep = 80;
  const startX = Math.max(0, Math.floor((world.cameraX - viewportWidth / 2) / gridStep) * gridStep);
  const endX = Math.min(world.worldWidth, world.cameraX + viewportWidth / 2 + gridStep);
  const startY = Math.max(
    0,
    Math.floor((world.cameraY - viewportHeight / 2) / gridStep) * gridStep
  );
  const endY = Math.min(world.worldHeight, world.cameraY + viewportHeight / 2 + gridStep);

  ctx.strokeStyle = biome.gridColor;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = startX; x <= endX; x += gridStep) {
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
  }
  for (let y = startY; y <= endY; y += gridStep) {
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
  }
  ctx.stroke();

  ctx.strokeStyle = biome.accentColor;
  ctx.lineWidth = 3;
  ctx.strokeRect(20, 20, world.worldWidth - 40, world.worldHeight - 40);

  renderGridPulsesAndTelegraphs(ctx, world);
}

function renderGridPulsesAndTelegraphs(
  ctx: CanvasRenderingContext2D,
  world: GameWorldState
): void {
  for (const pulse of world.gridPulses) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, pulse.alpha);
    ctx.strokeStyle = pulse.color;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  for (const zone of world.telegraphs) {
    const progress = 1 - zone.timer / zone.maxTimer;
    ctx.save();
    if (zone.kind === 'circle') {
      ctx.fillStyle = 'rgba(255, 0, 85, 0.14)';
      ctx.strokeStyle = zone.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(zone.x, zone.y, zone.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.fillStyle = 'rgba(255, 0, 85, 0.28)';
      ctx.arc(zone.x, zone.y, zone.radius * progress, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.strokeStyle = zone.color;
      ctx.lineWidth = 2 + progress * 4;
      ctx.setLineDash([8, 6]);
      ctx.beginPath();
      ctx.moveTo(zone.x, zone.y);
      ctx.lineTo(zone.endX, zone.endY);
      ctx.stroke();
    }
    ctx.restore();
  }
}
