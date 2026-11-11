import React from 'react';
import { BIOMES_CATALOG, HEROES_CATALOG } from '../data/heroes-catalog';
import { createDefaultProfile } from '../data/profile-repository';
import { getWeaponById } from '../data/weapons-catalog';
import { BiomeDefinition, HeroDefinition } from '../types/content-types';
import { AsyncState, PlayerProfile, StoragePayload } from '../types/data-types';
import { BiomeId, HeroId } from '../types/game-types';
import { AsyncStateBanner } from './async-state-view';
import { BookIcon, SparklesIcon, SwordIcon, TrophyIcon, ZapIcon } from './icons';

export interface MainMenuProps {
  storageState: AsyncState<StoragePayload>;
  onSelectHero: (heroId: HeroId) => void;
  onSelectBiome: (biomeId: BiomeId) => void;
  onLaunchGame: () => void;
  onOpenWorkshop: () => void;
  onOpenCodex: () => void;
  onOpenHistory: () => void;
  onRetryLoad: () => void;
}

function renderHeroCard(
  hero: HeroDefinition,
  isSelected: boolean,
  onSelect: (id: HeroId) => void
): React.ReactElement {
  const starterWeapon = getWeaponById(hero.startingWeapon);
  return (
    <button
      key={hero.id}
      type="button"
      className={`hero-select-card ${isSelected ? 'card-selected' : ''}`}
      style={{ borderColor: isSelected ? hero.accentColor : 'rgba(255,255,255,0.12)' }}
      onClick={() => onSelect(hero.id)}
    >
      <div className="hero-card-top">
        <div>
          <span className="hero-role" style={{ color: hero.accentColor }}>
            {hero.title}
          </span>
          <h3>{hero.name}</h3>
        </div>
        <span className="hero-swatch" style={{ background: hero.accentColor }} />
      </div>
      <p className="hero-desc">{hero.description}</p>
      <div className="hero-meta-box">
        <div>
          <small>Vũ Khí Khởi Đầu</small>
          <strong style={{ color: starterWeapon.color }}>{starterWeapon.name}</strong>
        </div>
        <div>
          <small>Tuyệt Kỹ</small>
          <strong>{hero.ultimateName}</strong>
        </div>
      </div>
      <div className="hero-stats-strip">
        <span>HP: {hero.baseHp}</span>
        <span>Khiên: {hero.baseShield}</span>
        <span>Tốc Độ: {hero.baseSpeed}</span>
        <span>Chí Mạng: {Math.round(hero.baseCritChance * 100)}%</span>
      </div>
    </button>
  );
}

function renderBiomeCard(
  biome: BiomeDefinition,
  isSelected: boolean,
  onSelect: (id: BiomeId) => void
): React.ReactElement {
  return (
    <button
      key={biome.id}
      type="button"
      className={`biome-select-card ${isSelected ? 'card-selected' : ''}`}
      style={{ borderColor: isSelected ? biome.accentColor : 'rgba(255,255,255,0.12)' }}
      onClick={() => onSelect(biome.id)}
    >
      <div className="biome-head">
        <strong style={{ color: biome.accentColor }}>{biome.name}</strong>
        <span className="biome-sub">{biome.subtitle}</span>
      </div>
      <p>{biome.description}</p>
      <small className="biome-hazard">{biome.hazardDescription}</small>
    </button>
  );
}

function renderMenuHeader(props: MainMenuProps, profile: PlayerProfile): React.ReactElement {
  return (
    <header className="menu-header">
      <div className="brand-block">
        <span className="badge-pill">ACTION ROGUELITE • TWIN-STICK ARENA</span>
        <h1>AETHERIUM: HỘ VỆ THỜI KHÔNG</h1>
        <p>
          Điều khiển chiến binh vượt qua 10 đợt tấn công không-thời gian, kết hợp nguyên tố và tiêu
          diệt thực thể tối thượng <strong>Chronos Titan</strong>.
        </p>
      </div>
      <div className="menu-nav-Cluster">
        <div className="shard-wallet">
          <SparklesIcon size={18} color="#c77dff" />
          <div>
            <small>Tinh Thạch Aether</small>
            <strong>{profile.aetherShards}</strong>
          </div>
        </div>
        <button type="button" className="btn-secondary" onClick={props.onOpenWorkshop}>
          <ZapIcon size={16} color="#00f5d4" /> Xưởng Nâng Cấp
        </button>
        <button type="button" className="btn-secondary" onClick={props.onOpenCodex}>
          <BookIcon size={16} color="#ffbe0b" /> Bách Khoa Toàn Thư
        </button>
        <button type="button" className="btn-secondary" onClick={props.onOpenHistory}>
          <TrophyIcon size={16} color="#c77dff" /> Bảng Vàng ({profile.totalRuns})
        </button>
      </div>
    </header>
  );
}

export function MainMenu(props: MainMenuProps): React.ReactElement {
  const profile = props.storageState.data?.profile ?? createDefaultProfile();
  return (
    <div className="menu-screen">
      <div className="menu-container">
        {renderMenuHeader(props, profile)}
        <AsyncStateBanner
          status={props.storageState.status}
          errorMessage={props.storageState.errorMessage}
          emptyTitle="Hồ sơ chiến binh mới đã sẵn sàng!"
          emptyDescription="Bạn được tặng 35 Tinh Thạch Aether khởi đầu. Có thể vào Xưởng Nâng Cấp hoặc xuất kích ngay!"
          onRetry={props.onRetryLoad}
        />
        <section className="menu-section">
          <h2>1. CHỌN HỘ VỆ THỜI KHÔNG</h2>
          <div className="heroes-grid">
            {HEROES_CATALOG.map((h) =>
              renderHeroCard(h, profile.selectedHeroId === h.id, props.onSelectHero)
            )}
          </div>
        </section>
        <section className="menu-section">
          <h2>2. CHỌN CHIẾN TRƯỜNG KHÔNG-THỜI GIAN</h2>
          <div className="biomes-grid">
            {BIOMES_CATALOG.map((b) =>
              renderBiomeCard(b, profile.selectedBiomeId === b.id, props.onSelectBiome)
            )}
          </div>
        </section>
        <footer className="menu-launch-bar">
          <div className="controls-guide">
            <span><strong>WASD:</strong> Di chuyển</span>
            <span><strong>Space:</strong> Lướt Né</span>
            <span><strong>Phím E:</strong> Tuyệt Kỹ</span>
            <span><strong>Phím Q:</strong> Tự Ngắm</span>
          </div>
          <button type="button" className="btn-launch" onClick={props.onLaunchGame}>
            <SwordIcon size={22} color="#040814" /> KHỞI ĐỘNG CHIẾN DỊCH NGAY
          </button>
        </footer>
      </div>
    </div>
  );
}
