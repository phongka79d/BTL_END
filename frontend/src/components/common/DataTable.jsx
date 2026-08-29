import React from 'react';
import { Card, Text } from '@astryxdesign/core';
import Pagination from './Pagination';
import { TableSkeleton } from './LoadingSkeleton';
import EmptyState from './EmptyState';

/**
 * DataTable Component chuẩn hóa việc hiển thị bảng dữ liệu trên toàn bộ ứng dụng
 * @param {Array<{key: string, title: string, render?: Function, width?: string, align?: 'left'|'center'|'right'}>} columns - Cấu hình cột
 * @param {Array<Object>} data - Dữ liệu bảng
 * @param {string} [keyField] - Tên trường khóa chính (mặc định: 'id')
 * @param {boolean} [loading] - Trạng thái đang tải dữ liệu
 * @param {React.ReactNode} [emptyState] - Component hiển thị khi không có dữ liệu
 * @param {Object} [pagination] - Cấu hình phân trang { page, totalPages, onPageChange, totalItems }
 * @param {Function} [onRowClick] - Handler khi nhấn vào hàng
 */
export const DataTable = ({
  columns = [],
  data = [],
  keyField = 'id',
  loading = false,
  emptyState,
  pagination,
  onRowClick,
  className = ''
}) => {
  if (loading && (!data || data.length === 0)) {
    return <TableSkeleton rows={5} cols={columns.length || 4} />;
  }

  if (!loading && (!data || data.length === 0)) {
    return emptyState || <EmptyState title="Không có dữ liệu để hiển thị" />;
  }

  return (
    <Card
      padding={0}
      aria-busy={loading}
      className={`app-data-table-container ${className}`}
      style={{
        overflow: 'hidden',
        opacity: loading ? 0.65 : 1,
        transition: 'opacity 0.2s ease'
      }}
    >
      <div style={{ overflowX: 'auto', width: '100%' }}>
        <table
          className="app-data-table"
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: '0.875rem'
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-background-muted)'
              }}
            >
              {columns.map((col, idx) => (
                <th
                  key={col.key || idx}
                  style={{
                    padding: 'var(--spacing-3) var(--spacing-4)',
                    fontWeight: 600,
                    opacity: 0.85,
                    width: col.width || 'auto',
                    textAlign: col.align || 'left',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {col.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIdx) => {
              const rowKey = row[keyField] || rowIdx;
              return (
                <tr
                  key={rowKey}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  style={{
                    borderBottom: rowIdx === data.length - 1 ? 'none' : '1px solid var(--color-border)',
                    cursor: onRowClick ? 'pointer' : 'default',
                    transition: 'background-color 0.15s ease'
                  }}
                  className="app-table-row"
                >
                  {columns.map((col, colIdx) => {
                    const cellContent = col.render
                      ? col.render(row[col.key], row, rowIdx)
                      : row[col.key];

                    return (
                      <td
                        key={col.key || colIdx}
                        style={{
                          padding: 'var(--spacing-3) var(--spacing-4)',
                          textAlign: col.align || 'left',
                          verticalAlign: 'middle'
                        }}
                      >
                        {cellContent !== undefined && cellContent !== null ? cellContent : '—'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div
          style={{
            padding: 'var(--spacing-3) var(--spacing-4)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--spacing-2)'
          }}
        >
          {pagination.totalItems !== undefined && (
            <Text size="xs" color="secondary" style={{ margin: 0 }}>
              Tổng cộng <strong>{pagination.totalItems}</strong> mục
            </Text>
          )}

          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={pagination.onPageChange}
          />
        </div>
      )}
    </Card>
  );
};

export default DataTable;
