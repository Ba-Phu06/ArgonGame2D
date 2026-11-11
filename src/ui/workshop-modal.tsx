import React from 'react';
import { getMetaUpgradeCost, META_UPGRADES_CATALOG } from '../data/upgrades-catalog';
import { MetaUpgradeDefinition, MetaUpgradeId } from '../types/content-types';
import { AsyncState, StoragePayload } from '../types/data-types';
import { AsyncStateBanner } from './async-state-view';
import { SparklesIcon } from './icons';

export interface WorkshopModalProps {
  storageState: AsyncState<StoragePayload>;
  onBuyUpgrade: (upgradeId: MetaUpgradeId) => void;
  onResetUpgrades: () => void;
  onRetryLoad: () => void;
  onClose: () => void;
}

function renderUpgradeItem(
  def: MetaUpgradeDefinition,
  currentLv: number,
  shards: number,
  onBuy: (id: MetaUpgradeId) => void
): React.ReactElement {
  const isMaxed = currentLv >= def.maxLevel;
  const cost = getMetaUpgradeCost(def, currentLv);
  const canAfford = !isMaxed && shards >= cost;

  return (
    <div key={def.id} className="workshop-card">
      <div className="workshop-card-head">
        <div>
          <h4>{def.name}</h4>
          <span className="bonus-tag">{def.bonusPerLevelLabel}</span>
        </div>
        <span className="level-badge">
          Cấp {currentLv}/{def.maxLevel}
        </span>
      </div>
      <p>{def.description}</p>
      <div className="level-pip-bar">
        {Array.from({ length: def.maxLevel }).map((_, idx) => (
          <span key={idx} className={`level-pip ${idx < currentLv ? 'pip-filled' : ''}`} />
        ))}
      </div>
      <button
        type="button"
        className={canAfford ? 'btn-primary btn-full' : 'btn-secondary btn-full'}
        disabled={!canAfford}
        onClick={() => onBuy(def.id)}
      >
        {isMaxed ? 'ĐÃ ĐẠT CẤP TỐI ĐA' : `Nâng Cấp (${cost} Tinh Thạch)`}
      </button>
    </div>
  );
}

export function WorkshopModal(props: WorkshopModalProps): React.ReactElement {
  const { storageState, onBuyUpgrade, onResetUpgrades, onRetryLoad, onClose } = props;
  const profile = storageState.data?.profile;
  const shards = profile?.aetherShards ?? 0;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel wide-modal">
        <div className="modal-top-bar">
          <div>
            <span className="badge-pill">XƯỞNG CƠ KHÍ LƯỢNG TỬ</span>
            <h2>NÂNG CẤP VĨNH VIỄN</h2>
          </div>
          <div className="shard-balance">
            <SparklesIcon size={18} color="#c77dff" />
            <strong>{shards} Tinh Thạch Aether</strong>
          </div>
        </div>
        {(storageState.status === 'loading' || storageState.status === 'error') && (
          <AsyncStateBanner
            status={storageState.status}
            errorMessage={storageState.errorMessage}
            onRetry={onRetryLoad}
          />
        )}
        {profile && (
          <div className="workshop-grid">
            {META_UPGRADES_CATALOG.map((def) =>
              renderUpgradeItem(def, profile.metaLevels[def.id] ?? 0, shards, onBuyUpgrade)
            )}
          </div>
        )}
        <div className="modal-footer-row">
          <button type="button" className="btn-ghost" onClick={onResetUpgrades}>
            Hoàn Trả Toàn Bộ Tinh Thạch
          </button>
          <button type="button" className="btn-primary" onClick={onClose}>
            Đóng Xưởng Nâng Cấp
          </button>
        </div>
      </div>
    </div>
  );
}
