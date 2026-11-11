import React, { useEffect } from 'react';
import { UpgradeCardOption, UpgradeRarity } from '../types/content-types';
import { SparklesIcon } from './icons';

export interface LevelUpModalProps {
  level: number;
  choices: UpgradeCardOption[];
  onSelect: (option: UpgradeCardOption) => void;
}

function getRarityLabel(rarity: UpgradeRarity): string {
  switch (rarity) {
    case 'legendary':
      return 'HUYỀN THOẠI';
    case 'epic':
      return 'SỬ THI';
    case 'rare':
      return 'HIẾM';
    default:
      return 'TIÊU CHUẨN';
  }
}

function renderUpgradeCard(
  card: UpgradeCardOption,
  index: number,
  onSelect: (option: UpgradeCardOption) => void
): React.ReactElement {
  return (
    <button
      key={card.id}
      type="button"
      className={`upgrade-card rarity-${card.rarity}`}
      style={{ borderColor: card.accentColor }}
      onClick={() => onSelect(card)}
    >
      <div className="upgrade-card-top">
        <span className="rarity-tag" style={{ color: card.accentColor }}>
          <SparklesIcon size={14} color={card.accentColor} /> {getRarityLabel(card.rarity)}
        </span>
        <span className="key-hint">Phím {index + 1}</span>
      </div>
      <h3>{card.title}</h3>
      <span className="upgrade-subtitle">{card.subtitle}</span>
      <p className="upgrade-desc">{card.description}</p>
      <span className="upgrade-cta" style={{ background: card.accentColor }}>
        KÍCH HOẠT NÂNG CẤP
      </span>
    </button>
  );
}

export function LevelUpModal({
  level,
  choices,
  onSelect,
}: LevelUpModalProps): React.ReactElement {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent): void => {
      if (event.key === '1' && choices[0]) onSelect(choices[0]);
      else if (event.key === '2' && choices[1]) onSelect(choices[1]);
      else if (event.key === '3' && choices[2]) onSelect(choices[2]);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [choices, onSelect]);

  return (
    <div className="modal-backdrop">
      <div className="modal-panel level-up-panel">
        <div className="level-up-header">
          <span className="badge-pill">THĂNG CẤP CHIẾN BINH • CẤP {level}</span>
          <h2>CHỌN LÕI CƯỜNG HÓA AETHER</h2>
          <p>Nhấn chuột vào thẻ hoặc bấm phím [1], [2], [3] để trang bị ngay lập tức.</p>
        </div>
        <div className="upgrade-cards-grid">
          {choices.map((card, index) => renderUpgradeCard(card, index, onSelect))}
        </div>
      </div>
    </div>
  );
}
