import React from 'react';
import { Heading, Text, HStack, VStack } from '@astryxdesign/core';

/**
 * PageHeader Component chuẩn cho tất cả các trang
 * @param {string} title - Tiêu đề chính của trang
 * @param {string} [subtitle] - Mô tả phụ bên dưới tiêu đề
 * @param {React.ReactNode} [breadcrumb] - Breadcrumb navigation
 * @param {React.ReactNode} [badge] - Badge hoặc tag trạng thái
 * @param {React.ReactNode} [actions] - Khu vực nút hành động bên phải
 */
export const PageHeader = ({
  title,
  subtitle,
  breadcrumb,
  badge,
  actions,
  className = ''
}) => {
  return (
    <VStack gap={3} className={`app-page-header ${className}`} style={{ width: '100%', marginBottom: 'var(--spacing-4)' }}>
      {breadcrumb && (
        <div style={{ fontSize: '0.875rem' }}>
          {breadcrumb}
        </div>
      )}

      <HStack
        justify="between"
        align="start"
        wrap="wrap"
        gap={3}
      >
        <VStack gap={1} style={{ flex: 1, minWidth: '240px' }}>
          <HStack align="center" gap={3} wrap="wrap">
            <Heading level={1} style={{ margin: 0, letterSpacing: '-0.02em' }}>
              {title}
            </Heading>
            {badge}
          </HStack>
          {subtitle && (
            <Text
              size="sm"
              color="secondary"
              style={{ maxWidth: '720px' }}
            >
              {subtitle}
            </Text>
          )}
        </VStack>

        {actions && (
          <HStack align="center" gap={2} wrap="wrap" className="app-page-header-actions">
            {actions}
          </HStack>
        )}
      </HStack>
    </VStack>
  );
};

export default PageHeader;
