import React, { useState } from 'react';
import { ENEMIES_CATALOG } from '../data/enemies-catalog';
import { WEAPONS_CATALOG } from '../data/weapons-catalog';

export interface CodexModalProps {
  onClose: () => void;
}

function renderWeaponsSection(): React.ReactElement {
  return (
    <div className="codex-grid">
      {WEAPONS_CATALOG.map((w) => (
        <div key={w.id} className="codex-card" style={{ borderLeftColor: w.color }}>
          <div className="codex-card-head">
            <strong style={{ color: w.color }}>{w.name}</strong>
            <span className="element-badge">{w.element.toUpperCase()}</span>
          </div>
          <p>{w.description}</p>
          <div className="codex-stats-mini">
            <span>ST Cơ Bản: {w.baseDamage}</span>
            <span>Hồi Chiêu: {w.baseCooldown}s</span>
            <span>Tầm Bắn: {w.baseRange}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function renderEnemiesSection(): React.ReactElement {
  return (
    <div className="codex-grid">
      {ENEMIES_CATALOG.map((e) => (
        <div key={e.id} className="codex-card" style={{ borderLeftColor: e.color }}>
          <div className="codex-card-head">
            <strong style={{ color: e.color }}>{e.name}</strong>
            <span className="element-badge">{e.role}</span>
          </div>
          <p>{e.description}</p>
          <div className="codex-stats-mini">
            <span>HP: {e.baseHp}</span>
            <span>Tốc Độ: {e.baseSpeed}</span>
            <span>Thưởng XP: {e.xpValue}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CodexModal({ onClose }: CodexModalProps): React.ReactElement {
  const [tab, setTab] = useState<'weapons' | 'enemies'>('weapons');

  return (
    <div className="modal-backdrop">
      <div className="modal-panel wide-modal">
        <div className="modal-top-bar">
          <div>
            <span className="badge-pill">BÁCH KHOA TOÀN THƯ AETHER</span>
            <h2>HỒ SƠ VŨ KHÍ & THỰC THỂ THÙ ĐỊCH</h2>
          </div>
          <div className="tab-switcher">
            <button
              type="button"
              className={tab === 'weapons' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setTab('weapons')}
            >
              Kho Vũ Khí ({WEAPONS_CATALOG.length})
            </button>
            <button
              type="button"
              className={tab === 'enemies' ? 'btn-primary' : 'btn-secondary'}
              onClick={() => setTab('enemies')}
            >
              Thực Thể Địch ({ENEMIES_CATALOG.length})
            </button>
          </div>
        </div>

        <div className="synergy-callout">
          <strong>Cơ Chế Phản Ứng Nguyên Tố:</strong> Đóng băng mục tiêu bằng hệ{' '}
          <em>Cryo</em> rồi tấn công bằng <em>Lightning / Plasma</em> kích hoạt{' '}
          <strong>SIÊU DẪN (+50% sát thương)</strong>. Thiêu đốt mục tiêu bằng <em>Solar</em> rồi
          bắn <em>Arcane</em> kích hoạt <strong>QUÁ NHIỆT (+45% sát thương)</strong>.
        </div>

        {tab === 'weapons' ? renderWeaponsSection() : renderEnemiesSection()}

        <div className="modal-footer-row">
          <span />
          <button type="button" className="btn-primary" onClick={onClose}>
            Đóng Thư Viện
          </button>
        </div>
      </div>
    </div>
  );
}
