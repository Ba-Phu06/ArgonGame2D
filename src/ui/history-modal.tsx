import React from 'react';
import { AsyncState, RunHistoryRecord, StoragePayload } from '../types/data-types';
import { AsyncStateBanner } from './async-state-view';

export interface HistoryModalProps {
  storageState: AsyncState<StoragePayload>;
  onRetry: () => void;
  onClearHistory: () => void;
  onClose: () => void;
}

function formatRunDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoString;
  }
}

function renderHistoryRow(run: RunHistoryRecord): React.ReactElement {
  const isWin = run.outcome === 'victory';
  return (
    <div key={run.id} className="history-row">
      <div className="history-row-main">
        <span className={`outcome-tag ${isWin ? 'tag-win' : 'tag-loss'}`}>
          {isWin ? 'CHIẾN THẮNG' : 'THẤT THỦ'}
        </span>
        <strong>{run.heroName}</strong>
        <span className="history-biome">• {run.biomeName}</span>
        <small className="history-date">{formatRunDate(run.timestamp)}</small>
      </div>
      <div className="history-row-stats">
        <span>Wave {run.waveReached}</span>
        <span>Cấp {run.levelReached}</span>
        <span>{run.kills} Hạ Gục</span>
        <strong>{run.score.toLocaleString('vi-VN')} Điểm</strong>
        <span className="shard-gain">+{run.shardsEarned} Tinh Thạch</span>
      </div>
    </div>
  );
}

export function HistoryModal({
  storageState,
  onRetry,
  onClearHistory,
  onClose,
}: HistoryModalProps): React.ReactElement {
  const history = storageState.data?.runHistory ?? [];
  const status =
    storageState.status === 'success' && history.length === 0 ? 'empty' : storageState.status;

  return (
    <div className="modal-backdrop">
      <div className="modal-panel wide-modal">
        <div className="modal-top-bar">
          <div>
            <span className="badge-pill">BIÊN NIÊN SỬ THỜI KHÔNG</span>
            <h2>BẢNG VÀNG LỊCH SỬ CHIẾN DỊCH</h2>
          </div>
          {storageState.data && (
            <div className="summary-pills">
              <span>Tổng Trận: {storageState.data.profile.totalRuns}</span>
              <span>Chiến Thắng: {storageState.data.profile.totalVictories}</span>
              <span>Kỷ Lục: {storageState.data.profile.highestScore.toLocaleString('vi-VN')}</span>
            </div>
          )}
        </div>
        <AsyncStateBanner
          status={status}
          errorMessage={storageState.errorMessage}
          emptyTitle="Chưa có chiến dịch nào được ghi nhận"
          emptyDescription="Sau khi kết thúc một trận đấu, toàn bộ thông số sát thương và điểm số sẽ lưu tại đây."
          onRetry={onRetry}
        />
        {history.length > 0 && <div className="history-list">{history.map(renderHistoryRow)}</div>}
        <div className="modal-footer-row">
          {history.length > 0 ? (
            <button type="button" className="btn-ghost" onClick={onClearHistory}>
              Xóa Lịch Sử Chiến Đấu
            </button>
          ) : (
            <span />
          )}
          <button type="button" className="btn-primary" onClick={onClose}>
            Đóng Bảng Vàng
          </button>
        </div>
      </div>
    </div>
  );
}
