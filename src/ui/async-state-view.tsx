import React from 'react';
import { AsyncStatus } from '../types/data-types';

export interface AsyncStateBannerProps {
  status: AsyncStatus;
  errorMessage: string | null;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry: () => void;
}

export function AsyncStateBanner({
  status,
  errorMessage,
  emptyTitle = 'Chưa có dữ liệu chiến dịch',
  emptyDescription = 'Hãy khởi đầu chiến dịch đầu tiên để ghi danh vào Bảng Vàng Thời Không!',
  onRetry,
}: AsyncStateBannerProps): React.ReactElement | null {
  if (status === 'loading') {
    return (
      <div className="async-banner async-loading" role="status">
        <div className="spinner-ring" />
        <div>
          <strong>Đang đồng bộ dữ liệu Aether...</strong>
          <p>Vui lòng chờ trong giây lát khi hệ thống tải hồ sơ chiến binh.</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="async-banner async-error" role="alert">
        <div>
          <strong>Lỗi truy xuất dữ liệu</strong>
          <p>{errorMessage ?? 'Đã xảy ra sự cố không xác định khi đọc bộ nhớ.'}</p>
        </div>
        <button type="button" className="btn-secondary" onClick={onRetry}>
          Thử Lại Ngay
        </button>
      </div>
    );
  }

  if (status === 'empty') {
    return (
      <div className="async-banner async-empty">
        <div>
          <strong>{emptyTitle}</strong>
          <p>{emptyDescription}</p>
        </div>
      </div>
    );
  }

  return null;
}
