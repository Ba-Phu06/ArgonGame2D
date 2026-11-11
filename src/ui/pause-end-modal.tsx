import React from 'react';
import { HudSnapshot } from '../hooks/use-game-loop';
import { RunHistoryRecord } from '../types/data-types';

export interface PauseEndModalProps {
  hud: HudSnapshot;
  completedRun: RunHistoryRecord | null;
  onResume: () => void;
  onRestart: () => void;
  onEnterEndless: () => void;
  onReturnMenu: () => void;
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function renderPausedPanel(props: PauseEndModalProps): React.ReactElement {
  return (
    <div className="modal-backdrop">
      <div className="modal-panel pause-panel">
        <span className="badge-pill">TẠM DỪNG CHIẾN DỊCH</span>
        <h2>HỆ THỐNG ĐANG CHỜ LỆNH</h2>
        <p>
          Mẹo chiến thuật: Kết hợp vũ khí hệ <strong>Băng (Cryo)</strong> với{' '}
          <strong>Sét/Plasma</strong> để kích hoạt phản ứng <em>Siêu Dẫn (+50% sát thương)</em>!
        </p>
        <div className="modal-actions-row">
          <button type="button" className="btn-primary" onClick={props.onResume}>
            Tiếp Tục Chiến Đấu (Esc)
          </button>
          <button type="button" className="btn-secondary" onClick={props.onRestart}>
            Chơi Lại Từ Đầu
          </button>
          <button type="button" className="btn-ghost" onClick={props.onReturnMenu}>
            Về Sảnh Chính
          </button>
        </div>
      </div>
    </div>
  );
}

function renderWeaponBreakdown(completedRun: RunHistoryRecord | null): React.ReactElement | null {
  if (!completedRun || completedRun.weaponStats.length === 0) return null;
  return (
    <div className="weapon-breakdown">
      <h4>Thống Kê Sát Thương Vũ Khí</h4>
      {completedRun.weaponStats.map((w) => (
        <div key={w.weaponId} className="weapon-stat-row">
          <span>
            {w.weaponName} <small>(Cấp {w.level})</small>
          </span>
          <strong>{w.damageDealt.toLocaleString('vi-VN')} DMG</strong>
        </div>
      ))}
    </div>
  );
}

function renderSummaryMetrics(hud: HudSnapshot, totalRewards: number): React.ReactElement {
  return (
    <div className="summary-metrics-grid">
      <div className="metric-box">
        <span>Đợt Tấn Công</span>
        <strong>Wave {hud.wave}</strong>
      </div>
      <div className="metric-box">
        <span>Thời Gian</span>
        <strong>{formatDuration(hud.elapsedTime)}</strong>
      </div>
      <div className="metric-box">
        <span>Tiêu Diệt</span>
        <strong>{hud.kills}</strong>
      </div>
      <div className="metric-box">
        <span>Điểm Số</span>
        <strong>{hud.score.toLocaleString('vi-VN')}</strong>
      </div>
      <div className="metric-box highlight-shard">
        <span>Tinh Thạch</span>
        <strong>+{totalRewards} Tinh Thạch</strong>
      </div>
    </div>
  );
}

export function PauseEndModal(props: PauseEndModalProps): React.ReactElement | null {
  const { hud, completedRun, onRestart, onEnterEndless, onReturnMenu } = props;
  if (hud.status === 'paused') return renderPausedPanel(props);
  if (hud.status !== 'victory' && hud.status !== 'defeat') return null;

  const isVictory = hud.status === 'victory';
  const totalRewards = completedRun
    ? completedRun.shardsEarned
    : Math.max(5, hud.shardsEarned + hud.wave * 3);

  return (
    <div className="modal-backdrop">
      <div className="modal-panel summary-panel">
        <span className={`badge-pill ${isVictory ? 'badge-victory' : 'badge-defeat'}`}>
          {isVictory ? 'CHIẾN THẮNG HUY HOÀNG' : 'CHIẾN DỊCH KẾT THÚC'}
        </span>
        <h2>{isVictory ? 'CHRONOS TITAN ĐÃ BỊ HỦY DIỆT!' : 'LÁ CHẮN THỜI KHÔNG SỤP ĐỔ'}</h2>
        {renderSummaryMetrics(hud, totalRewards)}
        {renderWeaponBreakdown(completedRun)}
        <div className="modal-actions-row">
          {isVictory && (
            <button type="button" className="btn-primary" onClick={onEnterEndless}>
              Tiếp Tục Vô Tận (Endless)
            </button>
          )}
          <button type="button" className="btn-secondary" onClick={onRestart}>
            Tái Chiến Ngay
          </button>
          <button type="button" className="btn-ghost" onClick={onReturnMenu}>
            Về Sảnh & Nâng Cấp
          </button>
        </div>
      </div>
    </div>
  );
}
