import React from 'react';
import { Skeleton, Card, VStack, HStack } from '@astryxdesign/core';

/**
 * TableSkeleton - Khung tải trang chuẩn cho bảng dữ liệu (DataTable)
 */
export const TableSkeleton = ({ rows = 5, cols = 5 }) => {
  return (
    <Card padding={0} style={{ overflow: 'hidden' }}>
      <div style={{ padding: 'var(--spacing-3) var(--spacing-4)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-background-muted)' }}>
        <HStack gap={4} justify="between">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} height={14} width={i === 0 ? '12%' : i === 1 ? '30%' : '18%'} radius={1} />
          ))}
        </HStack>
      </div>

      <VStack gap={0}>
        {Array.from({ length: rows }).map((_, r) => (
          <div
            key={r}
            style={{
              padding: 'var(--spacing-3) var(--spacing-4)',
              borderBottom: r === rows - 1 ? 'none' : '1px solid var(--color-border)'
            }}
          >
            <HStack gap={4} justify="between" align="center">
              {Array.from({ length: cols }).map((_, c) => (
                <Skeleton
                  key={c}
                  height={18}
                  width={c === 0 ? '14%' : c === 1 ? '35%' : c === cols - 1 ? '12%' : '20%'}
                  radius={1}
                />
              ))}
            </HStack>
          </div>
        ))}
      </VStack>
    </Card>
  );
};

/**
 * CardGridSkeleton - Khung tải trang cho lưới sản phẩm
 */
export const CardGridSkeleton = ({ count = 8 }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: 'var(--spacing-4, 16px)',
        width: '100%'
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} padding={3}>
          <VStack gap={3}>
            <Skeleton height={160} width="100%" radius={2} />
            <Skeleton height={14} width="50%" radius={1} />
            <Skeleton height={18} width="85%" radius={1} />
            <HStack justify="between" align="center" style={{ marginTop: 'var(--spacing-1)' }}>
              <Skeleton height={20} width="40%" radius={1} />
              <Skeleton height={30} width={80} radius={2} />
            </HStack>
          </VStack>
        </Card>
      ))}
    </div>
  );
};

/**
 * DetailPageSkeleton - Khung tải trang cho trang chi tiết đơn hàng / sản phẩm
 */
export const DetailPageSkeleton = () => {
  return (
    <VStack gap={4} style={{ width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      <HStack justify="between" align="center">
        <Skeleton height={28} width={240} radius={1} />
        <Skeleton height={32} width={100} radius={2} />
      </HStack>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--spacing-4, 16px)' }}>
        <Card padding={4}>
          <VStack gap={3}>
            <Skeleton height={20} width={180} radius={1} />
            <Skeleton height={60} width="100%" radius={1} />
            <Skeleton height={60} width="100%" radius={1} />
          </VStack>
        </Card>
        <Card padding={4}>
          <VStack gap={3}>
            <Skeleton height={20} width={140} radius={1} />
            <Skeleton height={36} width="100%" radius={1} />
            <Skeleton height={36} width="100%" radius={1} />
          </VStack>
        </Card>
      </div>
    </VStack>
  );
};

export default {
  TableSkeleton,
  CardGridSkeleton,
  DetailPageSkeleton
};
