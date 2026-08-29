import React from 'react';
import { Card, HStack, TextInput, Button } from '@astryxdesign/core';
import { SearchIcon, ResetIcon } from './LayoutIcons';

/**
 * FilterBar Component chuẩn hóa thanh tìm kiếm và lọc dữ liệu
 * @param {string} [search] - Giá trị tìm kiếm hiện tại
 * @param {Function} [onSearchChange] - Handler khi thay đổi tìm kiếm
 * @param {string} [searchPlaceholder] - Placeholder ô tìm kiếm
 * @param {React.ReactNode} [filters] - Các selector lọc dữ liệu tùy chỉnh
 * @param {React.ReactNode} [actions] - Các nút hành động bên phải (VD: Export, Refresh)
 * @param {Function} [onReset] - Handler nút đặt lại bộ lọc
 * @param {boolean} [hasActiveFilters] - Có bộ lọc nào đang được kích hoạt hay không
 */
export const FilterBar = ({
  search,
  onSearchChange,
  searchPlaceholder = 'Tìm kiếm...',
  filters,
  actions,
  onReset,
  hasActiveFilters = false,
  className = ''
}) => {
  return (
    <Card
      padding={3}
      className={`app-filter-bar ${className}`}
      style={{
        marginBottom: 'var(--spacing-4)'
      }}
    >
      <HStack
        justify="between"
        align="center"
        wrap="wrap"
        gap={3}
      >
        <HStack align="center" gap={3} wrap="wrap" style={{ flex: 1, minWidth: '280px' }}>
          {onSearchChange && (
            <div style={{ flex: '1 1 240px', maxWidth: '360px' }}>
              <TextInput
                label="Tìm kiếm"
                isLabelHidden
                value={search || ''}
                onChange={(val) => onSearchChange(val)}
                placeholder={searchPlaceholder}
                startIcon={<SearchIcon size={16} />}
              />
            </div>
          )}

          {filters}

          {onReset && hasActiveFilters && (
            <Button
              label="Đặt lại"
              variant="ghost"
              size="sm"
              onClick={onReset}
              icon={<ResetIcon size={14} />}
            />
          )}
        </HStack>

        {actions && (
          <HStack align="center" gap={2} wrap="wrap" className="app-filter-bar-actions">
            {actions}
          </HStack>
        )}
      </HStack>
    </Card>
  );
};

export default FilterBar;
