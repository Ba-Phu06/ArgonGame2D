import { EnemyDefinition } from '../types/content-types';
import { EnemyArchetypeId } from '../types/game-types';

export const ENEMIES_CATALOG: EnemyDefinition[] = [
  {
    id: 'swarm-drone',
    name: 'Drone Cảm Tử',
    role: 'Tập Kích Số Đông',
    description:
      'Thiết bị bay tự hành nhỏ gọn lao nhanh theo bầy đàn để bao vây mục tiêu.',
    color: '#ff4d6d',
    radius: 14,
    baseHp: 38,
    baseSpeed: 138,
    contactDamage: 10,
    xpValue: 12,
    shardValue: 1,
    shieldFront: false,
    isBoss: false,
  },
  {
    id: 'shield-juggernaut',
    name: 'Hộ Vệ Khiên Từ Trường',
    role: 'Đỡ Đòn Hạng Nặng',
    description:
      'Cỗ máy bọc thép mang khiên năng lượng phía trước giảm 60% sát thương trực diện. Hãy đánh tạt sườn hoặc dùng vũ khí xuyên thấu.',
    color: '#f77f00',
    radius: 23,
    baseHp: 135,
    baseSpeed: 82,
    contactDamage: 18,
    xpValue: 28,
    shardValue: 3,
    shieldFront: true,
    isBoss: false,
  },
  {
    id: 'sniper-mech',
    name: 'Pháo Đài Bắn Tỉa',
    role: 'Xạ Kích Tầm Xa',
    description:
      'Giữ khoảng cách và khóa mục tiêu bằng tia ngắm laser đỏ trước khi khai hỏa đạn xung kích tốc độ cao.',
    color: '#ffbe0b',
    radius: 17,
    baseHp: 68,
    baseSpeed: 92,
    contactDamage: 12,
    xpValue: 24,
    shardValue: 2,
    shieldFront: false,
    isBoss: false,
  },
  {
    id: 'volatile-crawler',
    name: 'Bọ Nổ Nhiệt Hạch',
    role: 'Cảm Tử Phát Nổ',
    description:
      'Tăng tốc đột ngột khi ở gần người chơi và kích nổ vùng nhiệt hạch khi bị tiêu diệt hoặc áp sát.',
    color: '#ff006e',
    radius: 15,
    baseHp: 52,
    baseSpeed: 162,
    contactDamage: 22,
    xpValue: 20,
    shardValue: 2,
    shieldFront: false,
    isBoss: false,
  },
  {
    id: 'necro-weaver',
    name: 'Mẫu Hạm Triệu Hồi',
    role: 'Chỉ Huy & Triệu Hồi',
    description:
      'Thiết bị chỉ huy lơ lửng định kỳ sản sinh các Drone Cảm Tử và bắn cầu năng lượng.',
    color: '#9d4edd',
    radius: 22,
    baseHp: 155,
    baseSpeed: 76,
    contactDamage: 15,
    xpValue: 38,
    shardValue: 4,
    shieldFront: false,
    isBoss: false,
  },
  {
    id: 'phase-assassin',
    name: 'Sát Thủ Không Gian',
    role: 'Đột Kích Tốc Biến',
    description:
      'Kẻ săn mồi tốc độ cực cao có khả năng bứt tốc bất ngờ về phía người chơi.',
    color: '#00bbf9',
    radius: 16,
    baseHp: 85,
    baseSpeed: 174,
    contactDamage: 19,
    xpValue: 32,
    shardValue: 3,
    shieldFront: false,
    isBoss: false,
  },
  {
    id: 'chronos-titan',
    name: 'CHRONOS TITAN — Thực Thể Thời Không',
    role: 'Trùm Cuối Đa Giai Đoạn',
    description:
      'Thực thể cơ giới tối thượng cai quản dòng thời gian. Sở hữu loạt đạn vòng tròn, pháo laser hủy diệt và triệu hồi vệ binh.',
    color: '#ff0055',
    radius: 44,
    baseHp: 2400,
    baseSpeed: 96,
    contactDamage: 32,
    xpValue: 350,
    shardValue: 45,
    shieldFront: false,
    isBoss: true,
  },
];

export function getEnemyDefinition(id: EnemyArchetypeId): EnemyDefinition {
  const found = ENEMIES_CATALOG.find((enemy) => enemy.id === id);
  return found ?? ENEMIES_CATALOG[0];
}
