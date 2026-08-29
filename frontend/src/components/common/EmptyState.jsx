import React from 'react';
import { Card, Heading, Text, VStack, Button } from '@astryxdesign/core';

/**
 * EmptyState Component chuẩn cho danh sách hoặc kết quả rỗng
 * @param {React.ReactNode} [icon] - Icon hoặc hình minh họa
 * @param {string} title - Tiêu đề trạng thái rỗng
 * @param {string} [description] - Hướng dẫn chi tiết
 * @param {string} [actionLabel] - Nhãn nút hành động
 * @param {Function} [onAction] - Handler khi nhấn nút hành động
 * @param {React.ReactNode} [customAction] - Slot hành động tùy chỉnh
 */
export const EmptyState = ({
  icon,
  title = 'Không có dữ liệu',
  description,
  actionLabel,
  onAction,
  customAction,
  className = ''
}) => {
  return (
    <Card
      padding={6}
      className={`app-empty-state ${className}`}
      style={{
        textAlign: 'center',
        borderStyle: 'dashed'
      }}
    >
      <VStack align="center" justify="center" gap={4} style={{ maxWidth: '420px', margin: '0 auto' }}>
        {icon && (
          <div
            style={{
              opacity: 0.6,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </div>
        )}

        <VStack align="center" gap={1}>
          <Heading level={3} style={{ margin: 0 }}>
            {title}
          </Heading>
          {description && (
            <Text size="sm" color="secondary" style={{ margin: 0 }}>
              {description}
            </Text>
          )}
        </VStack>

        {actionLabel && onAction && (
          <Button
            label={actionLabel}
            variant="primary"
            size="sm"
            onClick={onAction}
            style={{ marginTop: 'var(--spacing-2)' }}
          />
        )}

        {customAction}
      </VStack>
    </Card>
  );
};

export default EmptyState;
