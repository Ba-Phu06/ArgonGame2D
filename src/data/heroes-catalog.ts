import { BiomeDefinition, HeroDefinition } from '../types/content-types';
import { BiomeId, HeroId } from '../types/game-types';

export const HEROES_CATALOG: HeroDefinition[] = [
  {
    id: 'valkyrie',
    name: 'Valkyrie Aegis',
    title: 'Kiếm Khách Thời Không',
    tagline: 'Tốc độ cao • Cận chiến diện rộng • Phản đòn',
    description:
      'Chiến binh tiên phong sử dụng Kiếm Plasma tần số cao, chém ra sóng năng lượng hình bán nguyệt và lướt xuyên đội hình địch.',
    ultimateName: 'Nhát Chém Phân Quang (Phím E)',
    ultimateDescription:
      'Phóng 12 lưỡi kiếm ánh sáng xoay vòng 360 độ, gây sát thương cực lớn và hồi phục 35% Lá Chắn ngay lập tức.',
    startingWeapon: 'plasma-katana',
    accentColor: '#00f5d4',
    secondaryColor: '#00bbf9',
    baseHp: 135,
    baseShield: 50,
    baseSpeed: 245,
    baseCritChance: 0.18,
    baseDamageMult: 1.05,
  },
  {
    id: 'technomancer',
    name: 'Arcane Technomancer',
    title: 'Pháp Sư Lượng Tử',
    tagline: 'Sát thương nguyên tố • Đạn tự dẫn • Bão điện từ',
    description:
      'Bậc thầy thao túng hạt Aether bằng Lăng Kính Lượng Tử, bắn đạn năng lượng tự động truy tìm mục tiêu và kích hoạt chuỗi phản ứng nguyên tố.',
    ultimateName: 'Siêu Tân Tinh Hư Không (Phím E)',
    ultimateDescription:
      'Giải phóng sóng xung kích lượng tử trên toàn chiến trường, làm tê liệt kẻ địch trong 3.5 giây và đốt cháy năng lượng của chúng.',
    startingWeapon: 'aether-prism',
    accentColor: '#c77dff',
    secondaryColor: '#7b2cbf',
    baseHp: 105,
    baseShield: 75,
    baseSpeed: 225,
    baseCritChance: 0.15,
    baseDamageMult: 1.18,
  },
  {
    id: 'ranger',
    name: 'Void Ranger',
    title: 'Xạ Thủ Hư Không',
    tagline: 'Chí mạng siêu hạng • Đạn xuyên thấu • Làm chậm thời gian',
    description:
      'Tay súng bắn tỉa thiện xạ trang bị Súng Đôi Từ Trường (Railgun), bắn đạn siêu thanh xuyên qua hàng loạt kẻ địch với tỷ lệ chí mạng áp đảo.',
    ultimateName: 'Ma Trận Quá Tải (Phím E)',
    ultimateDescription:
      'Bẻ cong dòng thời gian làm chậm 65% tốc độ của mọi kẻ địch trong 6 giây, đồng thời tăng gấp đôi tốc độ bắn và chí mạng.',
    startingWeapon: 'railgun-pistols',
    accentColor: '#ffbe0b',
    secondaryColor: '#fb5607',
    baseHp: 110,
    baseShield: 45,
    baseSpeed: 260,
    baseCritChance: 0.28,
    baseDamageMult: 1.12,
  },
];

export const BIOMES_CATALOG: BiomeDefinition[] = [
  {
    id: 'neon-sanctum',
    name: 'Thánh Điện Neon',
    subtitle: 'Khu Vực Cân Bằng • Độ Khó Chuẩn (x1.0)',
    description:
      'Pháo đài dữ liệu cổ đại phát sáng dưới lưới quang học xanh ngọc. Nơi lý tưởng để rèn luyện kỹ năng chiến đấu.',
    difficultyMultiplier: 1.0,
    bgPrimary: '#060919',
    bgSecondary: '#0d1836',
    gridColor: 'rgba(0, 245, 212, 0.11)',
    accentColor: '#00f5d4',
    hazardDescription: 'Mật độ quái tiêu chuẩn • Thưởng Tinh Thạch +0%',
  },
  {
    id: 'crimson-forge',
    name: 'Lò Phản Ứng Đỏ Thẫm',
    subtitle: 'Chiến Trường Nhiệt Hạch • Độ Khó Cao (x1.35)',
    description:
      'Trung tâm năng lượng mặt trời bị quá tải. Kẻ địch hung hãn hơn nhưng rơi nhiều Tinh Thạch Aether hơn.',
    difficultyMultiplier: 1.35,
    bgPrimary: '#16060c',
    bgSecondary: '#2d0b18',
    gridColor: 'rgba(255, 77, 109, 0.12)',
    accentColor: '#ff4d6d',
    hazardDescription: 'Máu & Sát thương địch +35% • Thưởng Tinh Thạch +40%',
  },
  {
    id: 'void-singularity',
    name: 'Chân Trời Sự Kiện',
    subtitle: 'Vùng Hư Không Tử Thần • Độ Khó Ác Mộng (x1.75)',
    description:
      'Nơi không-thời gian sụp đổ quanh hố đen nguyên thủy. Chỉ dành cho những Hộ Vệ Thời Không mạnh mẽ nhất.',
    difficultyMultiplier: 1.75,
    bgPrimary: '#090418',
    bgSecondary: '#1c0b3b',
    gridColor: 'rgba(199, 125, 255, 0.13)',
    accentColor: '#c77dff',
    hazardDescription: 'Máu & Sát thương địch +75% • Thưởng Tinh Thạch +85%',
  },
];

export function getHeroById(heroId: HeroId): HeroDefinition {
  const found = HEROES_CATALOG.find((hero) => hero.id === heroId);
  return found ?? HEROES_CATALOG[0];
}

export function getBiomeById(biomeId: BiomeId): BiomeDefinition {
  const found = BIOMES_CATALOG.find((biome) => biome.id === biomeId);
  return found ?? BIOMES_CATALOG[0];
}
