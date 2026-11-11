import { WeaponDefinition } from '../types/content-types';
import { WeaponId } from '../types/game-types';

export const WEAPONS_CATALOG: WeaponDefinition[] = [
  {
    id: 'plasma-katana',
    name: 'Kiếm Plasma Ánh Sáng',
    element: 'plasma',
    description:
      'Chém vòng cung năng lượng phía trước, gây sát thương diện rộng và đẩy lùi kẻ địch áp sát.',
    color: '#00f5d4',
    baseDamage: 34,
    baseCooldown: 0.62,
    baseRange: 135,
    basePierce: 99,
    projectileSpeed: 680,
  },
  {
    id: 'aether-prism',
    name: 'Lăng Kính Lượng Tử',
    element: 'arcane',
    description:
      'Bắn chùm cầu năng lượng Aether tự động chuyển hướng truy đuổi mục tiêu gần nhất.',
    color: '#c77dff',
    baseDamage: 24,
    baseCooldown: 0.48,
    baseRange: 520,
    basePierce: 1,
    projectileSpeed: 540,
  },
  {
    id: 'railgun-pistols',
    name: 'Súng Đôi Điện Từ',
    element: 'physical',
    description:
      'Khạc đạn siêu tốc độ cao xuyên thủng nhiều mục tiêu trên một đường thẳng.',
    color: '#ffbe0b',
    baseDamage: 30,
    baseCooldown: 0.44,
    baseRange: 680,
    basePierce: 3,
    projectileSpeed: 920,
  },
  {
    id: 'tesla-coil',
    name: 'Cuộn Sét Tesla',
    element: 'lightning',
    description:
      'Phóng hồ quang điện giật dây chuyền qua nhiều kẻ địch, gây tê liệt tạm thời.',
    color: '#4cc9f0',
    baseDamage: 26,
    baseCooldown: 1.05,
    baseRange: 340,
    basePierce: 4,
    projectileSpeed: 0,
  },
  {
    id: 'aether-orbitals',
    name: 'Vệ Tinh Hộ Pháp',
    element: 'arcane',
    description:
      'Triệu hồi các lưỡi kiếm năng lượng xoay quanh nhân vật, nghiền nát kẻ địch tiếp cận.',
    color: '#72efdd',
    baseDamage: 18,
    baseCooldown: 0.25,
    baseRange: 95,
    basePierce: 99,
    projectileSpeed: 0,
  },
  {
    id: 'frost-nova',
    name: 'Pháo Băng Giá Vĩnh Cửu',
    element: 'cryo',
    description:
      'Bắn tinh thể băng phát nổ khi va chạm, làm chậm 45% tốc độ di chuyển của kẻ địch.',
    color: '#90e0ef',
    baseDamage: 28,
    baseCooldown: 1.25,
    baseRange: 480,
    basePierce: 1,
    projectileSpeed: 460,
  },
  {
    id: 'solar-lance',
    name: 'Thương Ánh Dương',
    element: 'solar',
    description:
      'Chiếu tia laser nhiệt hạch xuyên thấu tức thời, thiêu đốt mục tiêu theo thời gian.',
    color: '#ff5400',
    baseDamage: 42,
    baseCooldown: 1.45,
    baseRange: 620,
    basePierce: 99,
    projectileSpeed: 0,
  },
  {
    id: 'seeker-missiles',
    name: 'Tên Lửa Tầm Nhiệt',
    element: 'plasma',
    description:
      'Phóng loạt tên lửa vi mô tự dẫn đường, phát nổ gây sát thương vùng khi trúng đích.',
    color: '#ff4d6d',
    baseDamage: 32,
    baseCooldown: 1.35,
    baseRange: 600,
    basePierce: 1,
    projectileSpeed: 430,
  },
];

export function getWeaponById(weaponId: WeaponId): WeaponDefinition {
  const found = WEAPONS_CATALOG.find((weapon) => weapon.id === weaponId);
  return found ?? WEAPONS_CATALOG[0];
}
