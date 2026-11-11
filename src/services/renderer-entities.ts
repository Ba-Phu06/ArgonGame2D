import { getHeroById } from '../data/heroes-catalog';
import { GameWorldState } from '../types/content-types';
import { EnemyEntity } from '../types/game-types';

function renderPickupItems(ctx: CanvasRenderingContext2D, world: GameWorldState): void {
  for (const item of world.pickups) {
    ctx.save();
    ctx.translate(item.x, item.y);
    if (item.kind === 'xp') {
      ctx.fillStyle = '#00f5d4';
      ctx.beginPath();
      ctx.moveTo(0, -item.radius);
      ctx.lineTo(item.radius, 0);
      ctx.lineTo(0, item.radius);
      ctx.lineTo(-item.radius, 0);
      ctx.closePath();
      ctx.fill();
    } else if (item.kind === 'shard') {
      ctx.fillStyle = '#c77dff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, 0, item.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    } else {
      ctx.fillStyle = '#38b000';
      ctx.fillRect(-item.radius, -3, item.radius * 2, 6);
      ctx.fillRect(-3, -item.radius, 6, item.radius * 2);
    }
    ctx.restore();
  }
}

export function renderPickupsAndProjectiles(
  ctx: CanvasRenderingContext2D,
  world: GameWorldState
): void {
  renderPickupItems(ctx, world);

  for (const proj of world.projectiles) {
    ctx.save();
    if (proj.isBeam) {
      ctx.globalAlpha = proj.lifetime / proj.maxLifetime;
      ctx.strokeStyle = proj.color;
      ctx.lineWidth = proj.radius;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(proj.x, proj.y);
      ctx.lineTo(proj.beamEndX, proj.beamEndY);
      ctx.stroke();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = proj.radius * 0.35;
      ctx.stroke();
    } else {
      ctx.fillStyle = proj.color;
      ctx.shadowColor = proj.color;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

export function renderEnemies(ctx: CanvasRenderingContext2D, world: GameWorldState): void {
  for (const enemy of world.enemies) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    if (enemy.chillTimer > 0) {
      ctx.strokeStyle = '#90e0ef';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius + 5, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawEnemyBodyShape(ctx, enemy);

    if (enemy.shieldFront) {
      ctx.strokeStyle = '#4cc9f0';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, enemy.radius + 6, enemy.facingAngle - 0.95, enemy.facingAngle + 0.95);
      ctx.stroke();
    }

    if (!enemy.isBoss && enemy.hp < enemy.maxHp) {
      const barW = enemy.radius * 2;
      const ratio = Math.max(0, enemy.hp / enemy.maxHp);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
      ctx.fillRect(-barW / 2, -enemy.radius - 11, barW, 4);
      ctx.fillStyle = enemy.isElite ? '#ffbe0b' : '#ff4d6d';
      ctx.fillRect(-barW / 2, -enemy.radius - 11, barW * ratio, 4);
    }
    ctx.restore();
  }
}

function drawEnemyBodyShape(ctx: CanvasRenderingContext2D, enemy: EnemyEntity): void {
  ctx.rotate(enemy.facingAngle);
  ctx.fillStyle = enemy.hitFlashTimer > 0 ? '#ffffff' : enemy.color;
  ctx.strokeStyle = enemy.isElite ? '#ffbe0b' : 'rgba(255,255,255,0.65)';
  ctx.lineWidth = enemy.isElite ? 2.5 : 1.5;

  const r = enemy.radius;
  ctx.beginPath();
  if (enemy.isBoss) {
    for (let i = 0; i < 8; i += 1) {
      const ang = (Math.PI * 2 * i) / 8;
      const rad = i % 2 === 0 ? r : r * 0.72;
      const px = Math.cos(ang) * rad;
      const py = Math.sin(ang) * rad;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  } else if (enemy.archetypeId === 'swarm-drone' || enemy.archetypeId === 'phase-assassin') {
    ctx.moveTo(r, 0);
    ctx.lineTo(-r * 0.8, -r * 0.75);
    ctx.lineTo(-r * 0.4, 0);
    ctx.lineTo(-r * 0.8, r * 0.75);
    ctx.closePath();
  } else if (enemy.archetypeId === 'shield-juggernaut') {
    ctx.rect(-r * 0.85, -r * 0.85, r * 1.7, r * 1.7);
  } else {
    ctx.arc(0, 0, r, 0, Math.PI * 2);
  }
  ctx.fill();
  ctx.stroke();
}

function renderPlayerAfterimagesAndOrbitals(
  ctx: CanvasRenderingContext2D,
  world: GameWorldState
): void {
  const { player } = world;
  for (const ghost of player.afterimages) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ghost.alpha * 0.5);
    ctx.translate(ghost.x, ghost.y);
    ctx.rotate(ghost.angle);
    ctx.fillStyle = ghost.color;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  for (const slot of player.weapons) {
    if (slot.weaponId === 'aether-orbitals') {
      const count = 2 + Math.floor(slot.level / 2);
      const dist = 92 + slot.level * 6;
      for (let i = 0; i < count; i += 1) {
        const ang = slot.orbitAngle + (Math.PI * 2 * i) / count;
        ctx.save();
        ctx.translate(player.x + Math.cos(ang) * dist, player.y + Math.sin(ang) * dist);
        ctx.rotate(ang + Math.PI / 2);
        ctx.fillStyle = '#72efdd';
        ctx.shadowColor = '#72efdd';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(12, 0);
        ctx.lineTo(-8, -6);
        ctx.lineTo(-8, 6);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }
  }
}

export function renderPlayerHero(ctx: CanvasRenderingContext2D, world: GameWorldState): void {
  const { player } = world;
  const hero = getHeroById(player.heroId);
  renderPlayerAfterimagesAndOrbitals(ctx, world);

  ctx.save();
  ctx.translate(player.x, player.y);
  if (player.shield > 0) {
    ctx.strokeStyle = 'rgba(76, 201, 240, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, player.radius + 7, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.rotate(player.aimAngle);
  ctx.fillStyle = player.invulnerableTimer > 0 ? '#ffffff' : hero.accentColor;
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.shadowColor = hero.accentColor;
  ctx.shadowBlur = 14;
  ctx.beginPath();
  ctx.moveTo(player.radius + 5, 0);
  ctx.lineTo(-player.radius * 0.75, -player.radius * 0.85);
  ctx.lineTo(-player.radius * 0.35, 0);
  ctx.lineTo(-player.radius * 0.75, player.radius * 0.85);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
