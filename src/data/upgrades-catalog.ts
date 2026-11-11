import { MetaUpgradeDefinition, UpgradeCardOption } from '../types/content-types';
import { PlayerEntity } from '../types/game-types';
import { WEAPONS_CATALOG } from './weapons-catalog';

export const META_UPGRADES_CATALOG: MetaUpgradeDefinition[] = [
  {
    id: 'hull-plating',
    name: 'Giáp Hợp Kim Aether',
    description: 'Gia cố khung giáp sinh học, tăng lượng Máu tối đa khi bắt đầu mỗi chiến dịch.',
    maxLevel: 8,
    baseCost: 15,
    costScale: 1.55,
    bonusPerLevelLabel: '+18 Máu Tối Đa / cấp',
    statKey: 'maxHp',
    bonusPerLevel: 18,
  },
  {
    id: 'plasma-core',
    name: 'Lõi Phản Ứng Nhiệt Hạch',
    description: 'Khuếch đại công suất đầu ra cho toàn bộ vũ khí và kỹ năng tối thượng.',
    maxLevel: 8,
    baseCost: 20,
    costScale: 1.6,
    bonusPerLevelLabel: '+8% Sát Thương / cấp',
    statKey: 'damageMultiplier',
    bonusPerLevel: 0.08,
  },
  {
    id: 'thruster-boost',
    name: 'Động Cơ Phản Lực Ion',
    description: 'Tăng tốc độ di chuyển cơ bản giúp né đạn và giữ khoảng cách linh hoạt.',
    maxLevel: 6,
    baseCost: 16,
    costScale: 1.55,
    bonusPerLevelLabel: '+12 Tốc Độ Chạy / cấp',
    statKey: 'speed',
    bonusPerLevel: 12,
  },
  {
    id: 'quantum-optics',
    name: 'Thấu Kính Lượng Tử',
    description: 'Phân tích điểm yếu cấu trúc của kẻ địch, tăng xác suất gây đòn Chí Mạng.',
    maxLevel: 6,
    baseCost: 22,
    costScale: 1.65,
    bonusPerLevelLabel: '+4% Tỷ Lệ Chí Mạng / cấp',
    statKey: 'critChance',
    bonusPerLevel: 0.04,
  },
  {
    id: 'chrono-capacitor',
    name: 'Tụ Điện Thời Không',
    description: 'Giảm thời gian hồi chiêu của mọi vũ khí và tăng tốc độ nạp kỹ năng.',
    maxLevel: 6,
    baseCost: 24,
    costScale: 1.65,
    bonusPerLevelLabel: '+6% Tốc Độ Hồi Chiêu / cấp',
    statKey: 'cooldownHaste',
    bonusPerLevel: 0.06,
  },
  {
    id: 'aether-magnet',
    name: 'Từ Trường Hấp Thụ',
    description: 'Mở rộng bán kính tự động hút Tinh Thạch kinh nghiệm và vật phẩm rơi ra.',
    maxLevel: 6,
    baseCost: 14,
    costScale: 1.5,
    bonusPerLevelLabel: '+28 Bán Kính Hút / cấp',
    statKey: 'pickupRadius',
    bonusPerLevel: 28,
  },
];

const PASSIVE_STAT_CARDS: UpgradeCardOption[] = [
  {
    id: 'stat-damage-epic',
    title: 'Quá Tải Hạt Nhân',
    subtitle: 'Cường Hóa Sát Thương',
    description: 'Tăng +18% tổng sát thương cho tất cả vũ khí hiện có.',
    rarity: 'epic',
    accentColor: '#ff4d6d',
    kind: 'stat-boost',
    statKey: 'damageMultiplier',
    statAmount: 0.18,
  },
  {
    id: 'stat-haste-rare',
    title: 'Xung Nhịp Siêu Dẫn',
    subtitle: 'Tăng Tốc Độ Đánh',
    description: 'Tăng +14% tốc độ khai hỏa của toàn bộ kho vũ khí.',
    rarity: 'rare',
    accentColor: '#00f5d4',
    kind: 'stat-boost',
    statKey: 'cooldownHaste',
    statAmount: 0.14,
  },
  {
    id: 'stat-crit-rare',
    title: 'Mắt Thần Định Vị',
    subtitle: 'Chí Mạng Đột Phá',
    description: 'Tăng +8% tỷ lệ chí mạng cho mọi đòn tấn công.',
    rarity: 'rare',
    accentColor: '#ffbe0b',
    kind: 'stat-boost',
    statKey: 'critChance',
    statAmount: 0.08,
  },
  {
    id: 'stat-hull-common',
    title: 'Tái Cấu Trúc Nano',
    subtitle: 'Phục Hồi & Giáp',
    description: 'Tăng +30 Máu tối đa và hồi phục ngay 40% lượng máu đã mất.',
    rarity: 'common',
    accentColor: '#38b000',
    kind: 'stat-boost',
    statKey: 'maxHp',
    statAmount: 30,
    healRatio: 0.4,
  },
  {
    id: 'stat-shield-rare',
    title: 'Khiên Quang Học Kép',
    subtitle: 'Lá Chắn Năng Lượng',
    description: 'Tăng +35 Lá Chắn tối đa và nạp đầy Lá Chắn ngay lập tức.',
    rarity: 'rare',
    accentColor: '#4cc9f0',
    kind: 'stat-boost',
    statKey: 'maxShield',
    statAmount: 35,
  },
  {
    id: 'stat-speed-common',
    title: 'Bộ Đẩy Phản Lực',
    subtitle: 'Cơ Động Chiến Thuật',
    description: 'Tăng +24 tốc độ di chuyển và +35 bán kính hút kinh nghiệm.',
    rarity: 'common',
    accentColor: '#72efdd',
    kind: 'stat-boost',
    statKey: 'speed',
    statAmount: 24,
  },
];

export function getMetaUpgradeCost(def: MetaUpgradeDefinition, currentLevel: number): number {
  return Math.round(def.baseCost * Math.pow(def.costScale, currentLevel));
}

export function generateUpgradeChoices(player: PlayerEntity): UpgradeCardOption[] {
  const pool: UpgradeCardOption[] = [...PASSIVE_STAT_CARDS];

  for (const weaponDef of WEAPONS_CATALOG) {
    const owned = player.weapons.find((slot) => slot.weaponId === weaponDef.id);
    if (owned && owned.level < 6) {
      pool.push({
        id: `upg-${weaponDef.id}-${owned.level + 1}`,
        title: `${weaponDef.name} [Cấp ${owned.level + 1}]`,
        subtitle: 'Nâng Cấp Vũ Khí',
        description: `Tăng +25% sát thương cơ bản, giảm hồi chiêu và mở rộng quy mô đòn đánh của ${weaponDef.name}.`,
        rarity: owned.level >= 4 ? 'legendary' : 'epic',
        accentColor: weaponDef.color,
        kind: 'weapon-upgrade',
        weaponId: weaponDef.id,
      });
    } else if (!owned && player.weapons.length < 5) {
      pool.push({
        id: `unlock-${weaponDef.id}`,
        title: `Mở Khóa: ${weaponDef.name}`,
        subtitle: 'Vũ Khí Mới',
        description: weaponDef.description,
        rarity: 'legendary',
        accentColor: weaponDef.color,
        kind: 'weapon-unlock',
        weaponId: weaponDef.id,
      });
    }
  }

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}
