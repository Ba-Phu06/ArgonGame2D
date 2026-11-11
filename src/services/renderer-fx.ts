import { GameWorldState } from '../types/content-types';
import { renderArenaGridAndTelegraphs, renderWorldBackground } from './renderer-bg';
import {
  renderEnemies,
  renderPickupsAndProjectiles,
  renderPlayerHero,
} from './renderer-entities';

function renderSlashAndLightning(ctx: CanvasRenderingContext2D, world: GameWorldState): void {
  for (const arc of world.slashArcs) {
    const ratio = arc.life / arc.maxLife;
    ctx.save();
    ctx.globalAlpha = ratio;
    ctx.strokeStyle = arc.color;
    ctx.lineWidth = 10 * ratio;
    ctx.shadowColor = arc.color;
    ctx.shadowBlur = 14;
    ctx.beginPath();
    ctx.arc(
      arc.x,
      arc.y,
      arc.radius * (1.05 - ratio * 0.15),
      arc.angle - arc.arcSpread / 2,
      arc.angle + arc.arcSpread / 2
    );
    ctx.stroke();
    ctx.restore();
  }

  for (const bolt of world.lightningBolts) {
    ctx.save();
    ctx.globalAlpha = bolt.life / bolt.maxLife;
    ctx.strokeStyle = bolt.color;
    ctx.lineWidth = 3;
    ctx.shadowColor = bolt.color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    bolt.points.forEach((pt, idx) => {
      if (idx === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        ctx.lineTo(pt.x, pt.y);
      }
    });
    ctx.stroke();
    ctx.restore();
  }
}

function renderParticlesAndCombatText(
  ctx: CanvasRenderingContext2D,
  world: GameWorldState
): void {
  for (const p of world.particles) {
    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.textAlign = 'center';
  for (const ft of world.floatingTexts) {
    const alpha = Math.min(1, (ft.life / ft.maxLife) * 1.4);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `${ft.isCrit ? '800' : '700'} ${Math.round(14 * ft.scale)}px "Chakra Petch", sans-serif`;
    ctx.fillStyle = ft.color;
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.lineWidth = 3;
    ctx.strokeText(ft.text, ft.x, ft.y);
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }
}

export function renderGameWorld(
  ctx: CanvasRenderingContext2D,
  world: GameWorldState,
  viewportWidth: number,
  viewportHeight: number
): void {
  renderWorldBackground(ctx, world, viewportWidth, viewportHeight);

  const shakeX = world.screenShake > 0 ? (Math.random() - 0.5) * world.screenShake : 0;
  const shakeY = world.screenShake > 0 ? (Math.random() - 0.5) * world.screenShake : 0;

  ctx.save();
  ctx.translate(
    viewportWidth / 2 - world.cameraX + shakeX,
    viewportHeight / 2 - world.cameraY + shakeY
  );

  renderArenaGridAndTelegraphs(ctx, world, viewportWidth, viewportHeight);
  renderPickupsAndProjectiles(ctx, world);
  renderEnemies(ctx, world);
  renderPlayerHero(ctx, world);
  renderSlashAndLightning(ctx, world);
  renderParticlesAndCombatText(ctx, world);

  ctx.restore();

  if (world.damageFlashAlpha > 0) {
    ctx.save();
    ctx.fillStyle = `rgba(255, 20, 70, ${world.damageFlashAlpha})`;
    ctx.fillRect(0, 0, viewportWidth, viewportHeight);
    ctx.restore();
  }
}
