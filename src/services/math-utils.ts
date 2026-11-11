import { EnemyEntity, Vector2D } from '../types/game-types';

export function clampNumber(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function distanceBetween(ax: number, ay: number, bx: number, by: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  return Math.hypot(dx, dy);
}

export function normalizeVector(vx: number, vy: number): Vector2D {
  const length = Math.hypot(vx, vy);
  if (length < 0.0001) {
    return { x: 0, y: 0 };
  }
  return { x: vx / length, y: vy / length };
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

export function normalizeAngle(angle: number): number {
  let result = angle;
  while (result > Math.PI) {
    result -= Math.PI * 2;
  }
  while (result < -Math.PI) {
    result += Math.PI * 2;
  }
  return result;
}

export function angleDifference(angleA: number, angleB: number): number {
  return Math.abs(normalizeAngle(angleA - angleB));
}

export function distanceToSegment(
  px: number,
  py: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lengthSq = dx * dx + dy * dy;
  if (lengthSq < 0.0001) {
    return distanceBetween(px, py, x1, y1);
  }
  const t = clampNumber(((px - x1) * dx + (py - y1) * dy) / lengthSq, 0, 1);
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return distanceBetween(px, py, projX, projY);
}

export function findNearestEnemy(
  x: number,
  y: number,
  enemies: EnemyEntity[],
  maxRange: number,
  excludedIds: number[] = []
): EnemyEntity | null {
  let bestEnemy: EnemyEntity | null = null;
  let bestDist = maxRange;

  for (const enemy of enemies) {
    if (enemy.hp <= 0 || excludedIds.includes(enemy.id)) {
      continue;
    }
    const dist = distanceBetween(x, y, enemy.x, enemy.y);
    if (dist <= bestDist) {
      bestDist = dist;
      bestEnemy = enemy;
    }
  }
  return bestEnemy;
}
