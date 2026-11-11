import React from 'react';
import { getHeroById } from '../data/heroes-catalog';
import { getWeaponById } from '../data/weapons-catalog';
import { HudSnapshot } from '../hooks/use-game-loop';
import { CrosshairIcon, ShieldIcon, SparklesIcon, VolumeIcon, ZapIcon } from './icons';

export interface HudOverlayProps {
  hud: HudSnapshot;
  soundEnabled: boolean;
  onTogglePause: () => void;
  onToggleAutoAim: () => void;
  onToggleSound: () => void;
  onTriggerDash: () => void;
  onTriggerUltimate: () => void;
}

function formatClock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function renderBossBar(hud: HudSnapshot): React.ReactElement | null {
  const boss = hud.activeBoss;
  if (!boss) return null;
  const hpPercent = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));
  return (
    <div className="boss-bar-container">
      <div className="boss-bar-header">
        <strong>{boss.name}</strong>
        <span>
          Giai đoạn {boss.bossPhase} • {Math.ceil(boss.hp)} / {boss.maxHp} HP
        </span>
      </div>
      <div className="progress-track boss-track">
        <div className="progress-fill boss-fill" style={{ width: `${hpPercent}%` }} />
      </div>
    </div>
  );
}

function renderVitalsCard(hud: HudSnapshot): React.ReactElement {
  const { player } = hud;
  const hpPct = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
  const shieldPct = Math.max(0, Math.min(100, (player.shield / Math.max(1, player.maxShield)) * 100));
  const xpPct = Math.max(0, Math.min(100, (player.xp / player.xpToNext) * 100));

  return (
    <div className="hud-vitals-card">
      <div className="vitals-title-row">
        <span className="level-circle">LV {player.level}</span>
        <strong>{getHeroById(player.heroId).name}</strong>
      </div>
      <div className="bar-group">
        <div className="bar-label">
          <span>MÁU</span>
          <span>
            {Math.ceil(player.hp)} / {player.maxHp}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill hp-fill" style={{ width: `${hpPct}%` }} />
        </div>
      </div>
      <div className="bar-group">
        <div className="bar-label">
          <span>LÁ CHẮN</span>
          <span>
            {Math.ceil(player.shield)} / {player.maxShield}
          </span>
        </div>
        <div className="progress-track">
          <div className="progress-fill shield-fill" style={{ width: `${shieldPct}%` }} />
        </div>
      </div>
      <div className="bar-group">
        <div className="progress-track xp-track">
          <div className="progress-fill xp-fill" style={{ width: `${xpPct}%` }} />
        </div>
      </div>
    </div>
  );
}

function renderTacticalBottomBar(
  hud: HudSnapshot,
  onTriggerDash: () => void,
  onTriggerUltimate: () => void
): React.ReactElement {
  const { player } = hud;
  const hero = getHeroById(player.heroId);
  const dashReady = player.dashCooldown <= 0;
  const ultPct = Math.min(100, Math.round((player.ultimateEnergy / player.ultimateMaxEnergy) * 100));
  return (
    <div className="hud-bottom-bar">
      <div className="weapons-dock">
        {player.weapons.map((slot) => {
          const def = getWeaponById(slot.weaponId);
          return (
            <div key={slot.weaponId} className="weapon-slot-pill" style={{ borderColor: def.color }}>
              <span className="weapon-dot" style={{ background: def.color }} />
              <div>
                <strong>{def.name}</strong>
                <small>Cấp {slot.level}</small>
              </div>
            </div>
          );
        })}
      </div>
      <div className="skills-dock">
        <button type="button" className={`skill-btn ${dashReady ? 'skill-ready' : 'skill-cooling'}`} onClick={onTriggerDash}>
          <ZapIcon size={18} color="#00f5d4" />
          <div>
            <strong>LƯỚT NÉ [SPACE]</strong>
            <small>{dashReady ? 'SẴN SÀNG' : `${player.dashCooldown.toFixed(1)}s`}</small>
          </div>
        </button>
        <button type="button" className={`skill-btn ${ultPct >= 100 ? 'skill-ult-ready' : 'skill-cooling'}`} onClick={onTriggerUltimate}>
          <ShieldIcon size={18} color={hero.accentColor} />
          <div>
            <strong>TUYỆT KỸ [PHÍM E]</strong>
            <small>{ultPct >= 100 ? 'KÍCH HOẠT NGAY!' : `Năng lượng ${ultPct}%`}</small>
          </div>
        </button>
      </div>
    </div>
  );
}

export function HudOverlay(props: HudOverlayProps): React.ReactElement {
  const { hud, soundEnabled, onTogglePause, onToggleAutoAim, onToggleSound } = props;
  return (
    <div className="hud-layer">
      <div className="hud-top-bar">
        {renderVitalsCard(hud)}
        <div className="hud-wave-center">
          <div className="wave-badge">
            ĐỢT {hud.wave} {!hud.endlessMode ? `/ ${hud.maxWaves}` : '(VÔ TẬN)'}
          </div>
          <div className="clock-display">{formatClock(hud.elapsedTime)}</div>
          {hud.comboCount > 2 && <div className="combo-chip">LIÊN KÍCH x{hud.comboCount}</div>}
        </div>
        <div className="hud-right-controls">
          <div className="score-pill">
            <span>ĐIỂM: {hud.score.toLocaleString('vi-VN')}</span>
            <span>HẠ: {hud.kills}</span>
            <span className="shard-inline">
              <SparklesIcon size={14} color="#c77dff" /> +{hud.shardsEarned}
            </span>
          </div>
          <div className="hud-buttons-row">
            <button type="button" className="hud-icon-btn" onClick={onToggleAutoAim}>
              <CrosshairIcon size={16} color={hud.player.autoAim ? '#00f5d4' : '#94a3b8'} />
              <span>{hud.player.autoAim ? 'Tự Ngắm [Q]: BẬT' : 'Tự Ngắm [Q]: TẮT'}</span>
            </button>
            <button type="button" className="hud-icon-btn" onClick={onToggleSound}>
              <VolumeIcon size={16} color={soundEnabled ? '#00f5d4' : '#94a3b8'} />
            </button>
            <button type="button" className="hud-icon-btn" onClick={onTogglePause}>
              Tạm Dừng [Esc]
            </button>
          </div>
        </div>
      </div>
      {renderBossBar(hud)}
      {renderTacticalBottomBar(hud, props.onTriggerDash, props.onTriggerUltimate)}
    </div>
  );
}
